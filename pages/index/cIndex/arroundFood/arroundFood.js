// pages/index/dIndex/arroundFood/arroundFood.js
let amapFile = require('../../../../utils/amap-wx.js');
var markersData = [];
Page({
  data: {
    markers: [],
    latitude: '',
    longitude: '',
    location:'',
    textData: {}
  },
  makertap: function (e) {
    var id = e.markerId;
    var that = this;
    that.showMarkerInfo(markersData, id);
    that.changeMarkerColor(markersData, id);
  },
  onLoad: function () {
    var that = this;
    var myAmapFun = new amapFile.AMapWX({ key: 'dab9accd558ae7007717c17613b43e0c' });
    myAmapFun.getInputtips({
      keywords: '奥林匹克塔',
      city: '北京',
      success(res) {
        var tip = res.tips[0];
        var lo = tip.location.split(',')[0];
        var la = tip.location.split(',')[1];
        that.setData({
          latitude: la,
          longitude: lo,
          location: tip.location,
        })
        that.getAround(myAmapFun);
      }
    })
   
  },

  getAround: function (myAmapFun){
    let that = this;
    myAmapFun.getPoiAround({
      location: that.data.location,
      querytypes:'050000',   //餐饮
      success: function (data) {
        markersData = data.markers;
        that.setData({
          markers: markersData
        });
        that.setData({
          latitude: markersData[0].latitude
        });
        that.setData({
          longitude: markersData[0].longitude
        });
        that.showMarkerInfo(markersData, 0);
      },
      fail: function (info) {
        wx.showModal({ title: "请手动授权地理位置" })
        // wx.getSetting({
        //   success(res) {
        //     if (!res.authSetting['scope.userLocation']) {
        //       wx.authorize({
        //         scope: 'scope.userLocation',
        //         success() {
        //           console.log('授权成功')
        //         }
        //       })
        //     }
        //   }
        // })
      }
    })
  },

  showMarkerInfo: function (data, i) {
    var that = this;
    that.setData({
      textData: {
        name: data[i].name,
        desc: data[i].address
      }
    });
  },
  changeMarkerColor: function (data, i) {
    var that = this;
    var markers = [];
    for (var j = 0; j < data.length; j++) {
      if (j == i) {
        // data[j].iconPath = "选中 marker 图标的相对路径"; //如：..­/..­/img/marker_checked.png
      } else {
        // data[j].iconPath = "未选中 marker 图标的相对路径"; //如：..­/..­/img/marker.png
      }
      markers.push(data[j]);
    }
    that.setData({
      markers: markers
    });
  }

})