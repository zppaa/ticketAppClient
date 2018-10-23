// pages/tourist/reserve/reserve.js
let util = require('../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startTime: '',    // 起始时间
    endTime: '', // 选择最大时间
    time: '',
    mobile: '', //手机号
    totalMoney: 0.00,
    ticketTypeValue: '1',
    ticketsNumber: 0,  // 票数

    personPrice: '',


    couponId:'',
    cheapBtnShow: false,
    cheapShow: false,
    cList: [],      // 优惠券money 列表
    idList: [],     // 优惠券id 列表
    couponList: [],  // 优惠券列表
    realPay: 0,       //实际支付
    cheapPrice: 0,
    payTxt: '选择优惠券',   // 优惠信息
    categoryId: '',   //票分类id
    inputDisable: false, //input锁定
   },
  // 票数
  getNum: function (e) {
    let that = this;
    let number = e.detail.value, price = this.data.personPrice;
    this.setData({
      totalMoney: (number * price).toFixed(2),
      ticketsNumber: e.detail.value.replace(/[^\d]/g, ''),
      personPrice: price,
      realPay: (number * price).toFixed(2) - that.data.cheapPrice < 0 ? 0 : (number * price).toFixed(2) - that.data.cheapPrice
    });
  },
  // 选定入园日期
  bindDateChange: function (e) {
    let time = e.detail.value;
    this.setData({
      time: time
    })
  },
  // 选择使用优惠券
  open: function () {
    let that = this;
    wx.showActionSheet({
      itemList: that.data.couponList,
      success: function (res) {
        if (!res.cancel) {
          // console.log(res.tapIndex);
          // console.log(that.data.cList[res.tapIndex].money / 100);
          // console.log(that.data.idList[res.tapIndex]);
          let realPay = that.data.totalMoney - (that.data.cList[res.tapIndex].money / 100).toFixed(2);
          that.setData({
            cheapPrice: that.data.cList[res.tapIndex].money / 100,
            realPay: realPay < 0 ? 0 : realPay,
            couponId: that.data.idList[res.tapIndex],
            cheapShow: true,
            payTxt: that.data.couponList[res.tapIndex]
          })
        }
      }
    });
  },
  pay: function () {
    let that = this;
    // console.log('开始支付');
    
    if (that.data.categoryId >3){
      if (that.data.ticketsNumber <4){
        wx.showModal({
          title: '提示',
          content: '该价格票数不能少于4张',
          showCancel: false
        })
        return
      }
    }
    let user = util.userInfo,
    scenicId = util.scenicId; //景区id
    console.log(this.data.totalMoney,"totalMoney")
    console.log(this.data.ticketsNumber,"数量")
    console.log(this.data.personPrice, "票价")
    let money = (this.data.totalMoney * 100).toFixed(2);
    let data = {};
    data.orderId = this.createOrderId(user.id);
    data.source = util.userInfo.source;
    data.totalPrice = parseInt(money);
    data.userId = user.id;
    data.placeId = scenicId;
    data.reserveDate = this.data.time;
    data.ticketType = 1;
    data.unit = this.data.personPrice * 100;
    data.number = this.data.ticketsNumber;
    data.timestamp = new Date().getTime();
    data.categoryId = this.data.categoryId;
    console.log(data,"data::")
    if (this.data.couponId && this.data.cheapPrice){
      data.couponId = this.data.couponId;
      data.discountFee = this.data.cheapPrice*100;
    }
    data.openid = util.userInfo.openid;
    console.log(data, "params:::")
    this.beginRecharge(data);

  },
  // 支付
  beginRecharge: function (obj) {
    let self = this;
    let data = obj;
    wx.showLoading({
      title: '支付中',
      mask: true
    });
    console.log('支付--',data)
    self.wxRecharge(data);
  },

  // 微信支付
  wxRecharge: function (data) {
    let self = this;
    let url = util.wxPay;
    wx.request({
      url: url,
      method: 'POST',
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      dataType: 'JSON',
      success: function (res) {
        wx.hideLoading();
        console.log(res,"11111",typeof(res.data))
        let result = JSON.parse(res.data);

        console.log('创建订单结果', result);
        if (result.code === 200) { // 创建预支付单成功，开始微信支付
          self.requestPayment(result.data)

        } else if (result.code === 600) {
          //实际支付0，支付成功，
          self.setData({
            couponId: '',
            cheapPrice: 0
          })
          self.getCoupon();
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000,
            mask: true
          });
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/order/orderDetail/orderDetail?orderId=' + self.data.orderId,
            })
          }, 2000)         
        } else  { // 创建订单失败
          if (result.msg instanceof Object){
            wx.showModal({
              title: '提示',
              content: '下单失败',
              showCancel: false
            })
          }else{
            wx.showModal({
              title: '提示',
              content: result.msg,
              showCancel: false
            })
          }
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '支付失败，请重试！',
          showCancel: false
        })
      }
    })
  },

  // 调用微信支付
  requestPayment: function (data) {
    let self = this;
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': 'MD5',
      'paySign': data.paySign,
      'success': function (res) {
        // 判断调用接口是否成功，成功则跳转到订单详情页
        self.setData({
          couponId: '',
          cheapPrice: 0
        })
        self.getCoupon();
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000,
          mask: true
        });
        setTimeout(function () {
          wx.navigateTo({
            url: '/pages/order/orderDetail/orderDetail?orderId=' + self.data.orderId,
          })
        }, 2000)        
      },
      'fail': function (res) {
        // console.log('用户取消支付或支付失败',res);
        if (res.errMsg !== 'requestPayment:fail cancel') {
          let msg = res.errMsg.split('(')[1];
          msg = msg.slice(0, msg.length - 1);
          wx.showModal({
            title: '提示',
            content: '支付失败：' + msg,
            confirmColor: '#20b976',
            showCancel: false
          });
        }
      }
    })
  },

  // 生成订单id
  createOrderId(userId) {
    let res = '';
    res += util.formatOrder(new Date());
    res += userId;

    let num = Math.random() + '';
    res += num.slice(num.length - 2);

    this.setData({
      orderId: res
    });
    return res
  },
  onShow:function(){
    this.getCoupon()
    this.setData({
      totalMoney: (this.data.ticketsNumber * this.data.personPrice).toFixed(2)
    })
  },

  //获取下个月日期
  getNextMonth: function () {
    var date = new Date;
    var year = date.getFullYear();
    var month = date.getMonth() + 2;
    var lastDay = util.formatDate(new Date(year, month, 0));
    return lastDay;
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    console.log('生命周期函数--监听页面加载',options);
    let that = this;
    let today = new Date();
    today = util.formatDate(today);
    let endTime = that.getNextMonth();
    that.setData({
      startTime: today,
      endTime: endTime,
      time: today,
      personPrice: options.ticketPrice/100,
      categoryId: options.categoryId
    });
    let user = util.userInfo;     // 判断用户信息 如果是游客需跳转到哪页
    console.log(user, "user:::")
    if ( options.categoryId === '1'){
      that.setData({
        ticketsNumber: 1,
        inputDisable: true
      })
    } else if (options.categoryId === '2') {
      that.setData({
        ticketsNumber: 2,
        inputDisable: true
      })
    } else if (options.categoryId === '3') {
      that.setData({
        ticketsNumber: 3,
        inputDisable: true
      })
    } else if (options.categoryId === '4') {
      that.setData({
        ticketsNumber: 4
      })
    } 
    if (!user.mobile) { //没有用户信息，未登录，跳转到登录页
      wx.redirectTo({
        url: '/pages/tourist/register/register',
      })
    } else {

    }
  },
  getCoupon: function(){
    let that = this;
    let params = {
      userId: util.userInfo.id,
      timestamp: new Date().getTime()
    };
    wx.request({
      url: util.queryCoupon,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      data: params,
      success: function (res) {
        if (res.statusCode === 200 && res.data.code === 200) {
          let couData = res.data.data;
          let arr = [];
         couData.forEach(function(item){
              if(item.status === 1){
                arr.push(item);
              }
          });
         let couponList = arr.map(o => {
            return o.name + '-' + '优惠' + o.money / 100 + '元'
          })
         let idList = arr.map(o => {
            return o.id
          })
         if (arr.length>0){
           that.setData({
             couponList: couponList,
             cList: arr,
             idList: idList,
             cheapBtnShow: true,
             cheapShow: true
           })
         }else{
           that.setData({
             couponList: [],
             cList: [],
             idList: [],
             cheapBtnShow: false,
             cheapShow: false
           })
         }         
        } else {
          that.setData({
            couponList: [],
            cList: [],
            idList: [],
            cheapBtnShow: false,
            cheapShow: false
          })
        }
      },
      fail: function (err) {
        console.log(err)
        that.setData({
          cheapBtnShow: false,
          cheapShow: false
        })
      }
    })
  }

})
