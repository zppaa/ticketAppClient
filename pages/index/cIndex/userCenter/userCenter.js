//index.js
//获取应用实例
var base64 = require("../../../../public/images/base64");
var util = require("../../../../utils/util.js");
const app = getApp()
Page({
  data: {
    user: {},
    codeUrl: '/public/images/erweima.jpg',
    imgSrc: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    let that = this;
    let user = util.userInfo;
    that.setData({
      user: user
    });
    that.setData({
      icon: base64.icon20
    });

    if (that.isRegister()){
      console.log("已经注册")
      wx.switchTab({
        url: '/pages/index/cIndex/userCenter/userCenter',
      })
    }else{
      console.log("未注册")
      wx.redirectTo({
        url: '/pages/selectIdentity/selectIdentity',
      })
    }
  },
  // 判断用户是否注册
  isRegister: function () {
    return !!util.userInfo.mobile
  },
  // 查询订单
  queryOrder:function(){
    wx.navigateTo({
      url: '/pages/order/manage/manage',
    })
  },
  settleList: function(){
    wx.navigateTo({
      url: '/pages/index/cIndex/settleList/settleList',
    })
  },
  // 头像查看个人信息
  personInfo: function(){
    wx.navigateTo({
      url: '/pages/index/cIndex/userDetail/userDetail',
    })
  },
  // 查看优惠券
  getCoupon: function(){
    let params = {
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
      success: function (res) {
        // todo 判断状态，如果没有数据，弹出showTotal 无优惠券
        if (res.data.code === 200) {
          wx.navigateTo({
            url: '/pages/index/cIndex/coupon/coupon',
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '无优惠券',
            showCancel: false,
            success: function (res) {
              if (res.confirm == true) {
                wx.switchTab({
                  url: '/pages/index/cIndex/userCenter/userCenter',
                })
              }
            }
          })
        }
      },
      fail: function (err) {
        console.log(err)
      }
    })

  },
  getImg:function(){
    let that = this;
    wx.request({
      url: 'http://192.168.50.17:3081/travel/qr?userId=10',
      success:function(res){
        console.log(res,"res::")
        that.setData({
          imgSrc: res.data.src
        })
      }
    })
  },
  // 联系我们
  calling: function () {
    wx.showActionSheet({
      itemList: ['咨询电话', '预约电话'],
      success: function (res) {
        if (!res.cancel) {
          console.log(res.tapIndex)
          if (res.tapIndex === 0){
            wx.makePhoneCall({
              phoneNumber: '01084296866',
              success: function () {
                console.log("拨打电话成功！")
              },
              fail: function () {
                console.log("拨打电话失败！")
              }
            })
          } else if (res.tapIndex === 1) {
            wx.makePhoneCall({
              phoneNumber: '01084296869',
              success: function () {
                console.log("拨打电话成功！")
              },
              fail: function () {
                console.log("拨打电话失败！")
              }
            })
          }
        }
      }
    });
  },
  // 获取二维码
  buildCode:function(){
    wx.navigateTo({
      url: '/pages/index/cIndex/buildCode/buildCode',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */

})
