// pages/index/cIndex/buildCode/buildCode.js
let util = require('../../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    codeUrl: '',
    scene: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log(util.userInfo,"url:")
    that.setData({
      codeUrl: util.userInfo.qrUrl
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log('授权成功')
            }
          })
        }
      }
    })
  },
  saveImgToPhotosAlbumTap: function () {
    let that = this;
    wx.downloadFile({
      url: that.data.codeUrl,
      success: function (res) {
        console.log(res);
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            console.log(data);
            if(data.errMsg == 'saveImageToPhotoasAlbum:ok'){
              wx.showToast({
                title: '图片已保存至相册',
                icon: 'success',
                duration: 2000
              })
            }else{
              wx.showToast({
                title: '图片保存至相册失败',
                icon: 'fail',
                duration: 2000
              })
            }
            
          },
          fail: function (err) {
            console.log(err);
            if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
              console.log("用户一开始拒绝了，我们想再次发起授权")
              console.log('打开设置窗口')
              wx.openSetting({
                success(settingdata) {
                  console.log(settingdata)
                  if (settingdata.authSetting['scope.writePhotosAlbum']) {
                    console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                  } else {
                    console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                  }
                }
              })
            }
          }
        })
      }
    })
  }
})  