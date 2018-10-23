// pages/index/dIndex/promotion/promotion.js

var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activity: {
      name: '',
      introduce: '',
      money: '',
      startTime: '',
      endTime: '',
      id: ''
    },
    id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options,"options")
    let that = this;
    let params = {
      timestamp: new Date().getTime()
    }
    wx.request({
      url: util.currentCoupon,
      data: params,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      success: function (res) {
        console.log(res,"优惠券")
        // 筛选出对应的优惠券
        var arr = res.data.data.filter(function (e) {
          return e.id == options.id; 
        });
        if (res.statusCode === 200 && res.data.code === 200){
          let _startTime = arr[0].startTime,
            _endTime = arr[0].endTime;
          arr[0].startTime = util.formatTime(new Date(_startTime));
          arr[0].startTime = util.formatTime(new Date(_startTime));
          arr[0].endTime = util.formatTime(new Date(_endTime));
          that.setData({
            activity: arr[0],
          })
          console.log(that.data.activity)
        } else if (res.data.code === 300){
          wx.showModal({
            title: '提示',
            content: '已经领取',
            showCancel: false
          })
        }else{
          wx.showModal({
            title: '提示',
            content: '领取失败',
            showCancel: false
          })
        }
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 判断是否注册
  isRegister: function () {
    return !!util.userInfo.mobile
  },
  getGift:function(){
    let that = this;
    // 判断是否注册
    console.log(that.isRegister(),"是否注册")
    if (that.isRegister()){
      let params = {
        userId: util.userInfo.id,
        couponId: that.data.activity.id,
        timestamp: new Date().getTime()
      };
      console.log(params, "params::")
      wx.request({
        url: util.getCoupon,
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer ' + util.userInfo.token
        },
        data: params,
        success: function (res) {
          console.log(res, "领取")
          if (res.data.code === 200) {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false
            })
          } else if (res.data.code === 300) {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false
            })
          }
        },
        fail: function (err) {
          wx.showModal({
            title: '提示',
            content: '领取失败',
            showCancel: false
          })
        }
      })
    }else{
      wx.navigateTo({
        url: '/pages/tourist/register/register',
      })
    }

  }
})
