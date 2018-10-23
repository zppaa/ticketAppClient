// pages/index/cIndex/coupon/coupon.js
var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this,
        params = {
          userId: util.userInfo.id,
          timestamp: new Date().getTime()
        };
    wx.request({
      url: util.queryCoupon,
      data: params,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      success:function(res){
        console.log(res,"res::")
        // todo 判断状态，如果没有数据，弹出showTotal 无优惠券
        if(res.data.code === 200){
          for (let i = 0; i < res.data.data.length;i++){
            let startTime = res.data.data[i].startTime,
                endTime = res.data.data[i].endTime;
            res.data.data[i].startTime = util.formatTime(new Date(startTime));
            res.data.data[i].endTime = util.formatTime(new Date(endTime))
          }
          that.setData({
            couponList: res.data.data
          })
        }
      },
      fail:function(err){
        console.log(err)
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(util.userInfo, "userInfo")
  },
})
