// pages/index/bIndex/orderDetail/orderDetail.js
let util = require('../../../../utils/util');
var QRCode = require('../../../../utils/weapp-qrcode.js')
var qrcode = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scenicName: '奥运塔景区欢迎您！',
    orderData: {},
    ticketData: [],
    orderId: ''
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let orderId = options.orderId;
      console.log(orderId)
      this.setData({orderId: orderId});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let self = this;
    let orderId = this.data.orderId;

    //获取订单信息
    wx.showLoading({ title: '加载中', })
    wx.request({
      url: util.SCAN_GET_ORDER + '/' + self.data.orderId+'?timestamp='+(new Date().getTime()) ,
      method: 'GET',
      header:{
          'Authorization': 'Bearer ' + util.userInfo.token
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading()
        if (res.statusCode === 200 && res.data.code === 200) {
          console.log(res.data.data)
          console.log('ok')
          self.setData({ orderData: res.data.data.order[0], ticketData: res.data.data.ticket })
        } else if (res.statusCode == 401){
            // token过期重新登录
            wx.showToast({
                title: '登录过期，请重新登录！',
                icon: 'loading',
                duration: 1500
            });
            setTimeout(function(){
                wx.redirectTo({
                    url: '/pages/login/login',
                })
            },1500);
        } else {
          self.setData({ orderData: {}, ticketData: [] })
          wx.showModal({ title: '错误提示', content: res.data.msg, })
        }
      },
      fail: function () {
        wx.hideLoading()
        self.setData({ orderData: {}, ticketData: [] })
        wx.showModal({ title: '提示', content: '请求失败，请重试！' })
      },
    })

    qrcode = new QRCode('canvas', {
      text: orderId,
      width: 150,
      height: 150,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  },

  save: function () {
    console.log('save')
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
