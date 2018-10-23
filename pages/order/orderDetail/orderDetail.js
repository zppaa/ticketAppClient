// pages/order/orderDetail/orderDetail.js
let util = require('../../../utils/util');
var QRCode = require('../../../utils/weapp-qrcode.js')
var qrcode = null;
var timer = null; //定时器变量
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderData: {},
    orderId: '',  //订单号
    refundId: '', //退货单号
    socketOpen : false, //长连接是否打开
    showShare: false,  // 分享按钮显示
    refundBtn: false,   //退款按钮
    codeShow: true,   // 二维码是否显示
    share: '',
    sourceName: '', //来源名
  },

  orderPage: function () {
    wx.redirectTo({
      url: '/pages/index/bIndex/order/orderList'
    })
  },

  scanPage: function () {
    wx.redirectTo({
      url: '/pages/index/bIndex/QRscan/scan'
    })
  },

  //获取来源名称
  getSource: function () {
    let that = this;
    if (util.userInfo.source == '-2') {
      console.log('二维码来源为景区')
      that.setData({
        sourceName: '奥林匹克塔'
      })
      return false;
    }
    let params = {
      source: util.userInfo.source
    }
    wx.request({
      url: util.getSource,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      data: params,
      success: function (res) {
        if (res.statusCode === 200 && res.data.code === 200) {
          console.log('获取来源名称', res)
          that.setData({
            sourceName: res.data.data[0].sourceName
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            confirmColor: '#20b976',
            showCancel: false
          });
        }
      },
      fail: function (err) {
        console.log('获取导游来源旅行社名称失败', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderId = options.orderId;
    let share = options.share||'';
    if (util.userInfo.role === 'travelAgent'){
      this.setData({ showShare: true });
    }
    this.setData({ orderId: orderId, share: share });
    if(1 == share){ // 如果是分享的页面，则不显示退款按钮
      this.setData({
        refundBtn: true,
        showShare: false
      })
    }
  },


  // 分享
  onShareAppMessage: function (res) {
    console.log(res,"转发")
    let that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '转发',
      path: '/pages/order/orderDetail/orderDetail?orderId=' + that.data.orderId+ '&share=1'
    }
  },
  save: function () {
    wx.showActionSheet({
      itemList: ['保存图片'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          qrcode.exportImage(function (path) {
            wx.saveImageToPhotosAlbum({
              filePath: path,
            })
          })
        }
      }
    })
  },

  /**
   * 获取订单信息
   */
  getOrder: function(){
    let self = this;
    //获取订单信息

    console.log(util.SCAN_GET_ORDER, "url")
    wx.request({
      url: util.SCAN_GET_ORDER,
      method: 'GET',
      data: { orderId: self.data.orderId },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.statusCode === 200 && res.data.code === 200) {
          if (res.data.data.order[0].payStatus == 25 || res.data.data.order[0].enterTime){
            self.setData({
              refundBtn: true,
              codeShow: false
            })
          }
          self.setData({ orderData: res.data.data.order[0] })
          let enterTime = self.data.orderData.enterTime;
        } else {
          self.setData({ orderData: {} })
          wx.showModal({ title: '错误提示', content: res.data.msg, })
        }
      },
      fail: function (res) {
        console.log(res, "res:::fail")
        wx.hideLoading()
        self.setData({ orderData: {} })
        //wx.showModal({ title: '提示', content: '请求失败，请重试！' })
      },
    })
  },
  /**
   * 生成退货单id
   */
  createRefundId(userId) {
    let res = '';
    res += util.formatOrder(new Date());
    res += userId;

    let num = Math.random() + '';
    res += num.slice(num.length - 2);

    this.setData({
      refundId: res
    });
    return res
  },

  returnMoney:function(){
    let self = this;
    wx.showLoading({
      title: '退款中',
    })
    let url = util.refund;
    let orderId = self.data.orderId,  //订单号
      refundId = self.data.orderId, //退货单号
      payWay = self.data.orderData.payWay,    //支付方式
      reserveDate = self.data.orderData.reserveDate, //入院时间
      money = self.data.orderData.actualFee; // 退款金额
    let data = {};
    data.orderId = orderId;
    data.refundId = refundId;
    data.payWay = payWay;
    data.reserveDate = reserveDate;
    data.money = money;
    wx.request({
      url: url,
      method: 'post',
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res, "退款返回")
        if (res.statusCode === 200 && res.data.code === 200) {
          wx.showToast({
            title: res.data.msg,
            icon: 'success',
            duration: 2000,
            mask: true
          });
          self.setData({
            refundBtn: true,
            codeShow: false,
            showShare: false
          });
          self.getOrder();
        } else {
          clearInterval(timer);
          timer = null;
          wx.showModal({ title: '提示', content: res.data.msg, showCancel: false })
        }
      },
      fail: function (res) {
        console.log(res, "res:::fail")
        wx.hideLoading()
        wx.showModal({ title: '提示', content: '请求失败，请重试！', showCancel: false })
      },
    })
  },
  /**
   * 退款
   */
  refund:function(){
    // 判断是否在规定退票时间
    let self = this;
    let orderDate = self.data.orderData.reserveDate;
    let now = util.formatTime(new Date())
    if (orderDate === now && new Date().getHours() < 21 || orderDate < now){
      self.returnMoney()
    } else{
      wx.showToast({
        title: '已过退票时间！',
        icon: 'loading',
        duration: 1500
      });
      self.setData({
        codeShow: true
      })
    }   

    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    let orderId = self.data.orderId;
    //获取来源名
    self.getSource();
    //轮训获取订单
    self.getOrder();
    if(timer){
      clearInterval(timer);
      timer = null;
    }
    timer = setInterval(function(){
      if (!enterTime){
        self.getOrder();
      }
      let enterTime = self.data.orderData.enterTime;
      if (enterTime) {
        wx.showModal({ title: '提示', content: '此票已使用', showCancel: false });
        clearInterval(timer);
        timer = null;
      }
    },3000);
    qrcode = new QRCode('canvas', {
      text: orderId,
      width: 150,
      height: 150,  
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  }  


})
