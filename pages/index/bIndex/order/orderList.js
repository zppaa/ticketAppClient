// pages/index/bIndex/order/orderList.js
let util = require('../../../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scenicName: '奥运塔景区欢迎您！',
    userCenterUrl: '',
    ticketData: [],
    allOrderNumber: '',
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
    let self = this;
    let placeId = util.userInfo.parent;
    if (!placeId) {
      wx.showToast({ title: '缺少景区编号', icon: 'none', duration: 2000 })
      return;
    }
    //获取订单信息
    wx.showLoading({ title: '加载中', })
    wx.request({
      url: util.PLACE_ALL_ORDER + '/' + placeId +'?timestamp='+(new Date().getTime()),
      method: 'GET',
      header:{
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      dataType: 'json',
      success: function (res) {
        wx.hideLoading()
        if (res.statusCode === 200 && res.data.code === 200) {
          console.log(res.data.data)
          console.log('ok')
          let allOrderNumber = res.data.data.length;
          self.setData({ ticketData: res.data.data, allOrderNumber: allOrderNumber })
        } else if (res.statusCode == 401) {
            // token过期重新登录
            wx.showToast({
                title: '登录过期，请重新登录！',
                icon: 'loading',
                duration: 1500
            });
            setTimeout(function () {
                wx.redirectTo({
                    url: '/pages/login/login?from=/pages/index/cIndex/userCenter/userCenter',
                })
            }, 1500);
        } else {
          self.setData({ ticketData: [], allOrderNumber: 0 })
          wx.showModal({ title: '错误提示', content: res.data.msg, })
        }
      },
      fail: function () {
        wx.hideLoading()
        self.setData({ ticketData: [], allOrderNumber: 0 })
        wx.showModal({ title: '提示', content: '请求失败，请重试！' })
      }
    })
  },

  scanPage: function () {
    wx.redirectTo({
      url: '/pages/index/bIndex/QRscan/scan'
    })
  },

  getDetail: function (e) {
    let orderId = e.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: '/pages/index/bIndex/orderDetail/orderDetail?orderId=' + orderId
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
