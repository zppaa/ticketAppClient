// pages/index/cIndex/appointGuide/appointGuide.js
var util = require("../../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    guideList: [],
    normaList: [],
    index: 0,
    guideName: '请选择导游',
    name: '',
    guideShow: false,
    orderId: '',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      orderId: options.orderId
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    let that = this;
    let params = {
      id: util.userInfo.id
    }
    wx.request({
      url: util.getGuide,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      data: params,
      success:function(res){
        if(res.data.code === 200 && res.statusCode === 200){
          that.setData({
            guideList: res.data.data,
            normaList: res.data.data
          })
        }
      },
      fail:function(err){
        console.log(err)
      }
    })
  },
  // 模糊查询
  guide: function (e) {
    let that = this;
    let json = that.data.guideList;
    let newJson = [];
    if ( e.detail.value == '' || e.detail.value == null ){
      that.setData({
        guideShow: false,
        guideList: that.data.normaList
      })
    } else {
      for (var i = 0; i < json.length; i++) {
        if ((json[i].name).indexOf(e.detail.value) > -1) {
          var tempJson = {
            "name": json[i].name,
            "id": json[i].id
          };
          newJson.push(tempJson);
          that.setData({
            guideShow: true,
            guideList: newJson
          })
        }
      }
    }
  },
 
  // 选择指定导游
  chooseGuide: function(e) {
    let that = this;
    let json = that.data.guideList;
    let id =parseInt(e.target.id);
    let newJson = [];
    if (id == '' ||id == null) {
      that.setData({
        guideShow: false,
        guideList: that.data.normaList
      })
    } else {
      var obj = json.find(function (x) {
        return x.id === id
      })
      that.setData({
        name: obj.name,
        guideShow: false,
        id: obj.id
      })
     
    }
  },
  confirm: function(e){
    let that = this;
    console.log(that.data.orderId, that.data.id);
    if (!that.data.id){
      wx.showModal({
        title: '提示',
        content: "没有该导游信息",
        showCancel: false
      });
      return false;
    }
    let params = {
      orderId: that.data.orderId,
      id: that.data.id
    }
    wx.request({
      url: util.allowOrder,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      data: params,
      success:function(res){
        if(res.statusCode === 200 && res.data.code === 200 ){
          // wx.showModal({
          //   title: '提示',
          //   content: "分配成功",
          //   showCancel: false
          // })
          wx.navigateTo({
            url: '/pages/order/orderDetail/orderDetail?orderId=' + that.data.orderId,
          })
        }
      },
      fail:function(err){
        console.log(err)
      }
    })
    
  }
})