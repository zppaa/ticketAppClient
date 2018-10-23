// pages/index/bIndex/QRscan/scan.js
let util = require('../../../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scenicName: '奥运塔景区欢迎您！',
    userCenterUrl: '',
    orderData: {},
    ticketData: [],
    clickScan: false,
  },

  scanBtn: function () {
    let self = this;
    // 允许从相机和相册扫码
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        if (res.result) {
          //获取订单信息
          wx.showLoading({title: '加载中',})
          wx.request({
            url: util.SCAN_GET_ORDER + '/' + res.result+'?timestamp='+(new Date().getTime()) ,
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + wx.getStorageSync('token')
            },
            dataType: 'json',
            success: function (res) {
              wx.hideLoading()
              if (res.statusCode == 401) {
                  // token过期重新登录
                  wx.showToast({
                      title: '登录过期，请重新登录！',
                      icon: 'loading',
                      duration: 1500
                  });
                  setTimeout(function () {
                      wx.redirectTo({
                          url: '/pages/login/login',
                      })
                  }, 1500);
              } else if (res.statusCode === 200 && res.data.code === 200) {
                console.log(res.data.data)
                console.log('ok')
                self.setData({ orderData: res.data.data.order[0], ticketData: res.data.data.ticket, clickScan: true })
              } else {
                self.setData({ orderData: {}, ticketData: [], clickScan: false })
                wx.showModal({ title: '错误提示',content: res.data.msg,})
              }
            },
            fail: function () {
              wx.hideLoading()
              self.setData({ orderData: {}, ticketData: [], clickScan: false })
              wx.showModal({ title: '提示', content: '请求失败，请重试！' })
            },
          })
        }
      }
    })

  },

  scanPass: function () {
    let self = this;
    let orderId = self.data.orderData.id;
    if (!orderId) {
      wx.showModal({ title: '错误提示', content: '缺少订单号', })
      return
    }
    wx.showLoading({ title: '加载中', })
    wx.request({
      url: util.SCAN_ORDER_PASS  + '/' + orderId+'?timestamp='+(new Date().getTime()),
      method: 'GET',
      header:{
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading()
        if (res.statusCode == 401) {
            // token过期重新登录
            wx.showToast({
                title: '登录过期，请重新登录！',
                icon: 'loading',
                duration: 1500
            });
            setTimeout(function () {
                wx.redirectTo({
                    url: '/pages/login/login',
                })
            }, 1500);
        } else if (res.statusCode === 200 && res.data.code === 200) {
          console.log(res.data)
          console.log('pass ok')
          self.setData({ orderData: {}, ticketData: [], clickScan: false })
          wx.showToast({ title: '成功', icon: 'success',duration: 2000})
        } else {
          wx.showModal({ title: '错误提示', content: res.data.msg, })
        }
      },
      fail: function () {
        wx.hideLoading()
        wx.showModal({ title: '提示', content: '请求失败，请重试！' })
      },
    })
  },

  orderPage: function () {
    wx.redirectTo({
      url: '/pages/index/bIndex/order/orderList'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
