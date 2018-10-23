// pages/index/cIndex/settleManage/settleManage.js
var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    settleList: [],
    dataShow: false
  },
  // 获取结算列表
  getList: function(){
    let that = this;
    console.log(util.userInfo, "userInfo:::")
    let params = {
      id: util.userInfo.id
    }
    wx.request({
      url: util.settlement,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      data: params,
      success: function (res) {
        console.log(res,"res::")
        let arr = res.data.data;
        for(let i=0;i<arr.length;i++){
          arr[i].payDate = util.formatTime(new Date(arr[i].payDate))
        }
        if (res.statusCode === 200 && res.data.code === 200) {
          if (res.data.data.length === 0) {
            that.setData({
              dataShow: true
            })
          } else {
            that.setData({
              settleList: res.data.data
            })
          }
        }
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList();
  },
  onShow: function () {

  },

 
})