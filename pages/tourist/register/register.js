// pages/tourist/register/register.js
let util = require('../../../utils/util');
let MD5 = require('../../../utils/MD5');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        role: 'visitor',
        mobile: '', //电话
        code:'123456', //手机验证码
        codeBtnText: '获取验证码',
        countdown: '60',
        codeBtnDisablied: false,
        isUploadShow:true,
        registerSuccess:false,

        id: ''
    },
    // 输入手机号
    mobileChange: function (e) {
        console.log('输入手机号', e);
        let mobile = e.detail.value;
        this.data.mobile = mobile;
    },
    //获取验证码
    getCode: function (e) {
      let mobile = this.data.mobile;
      console.log('mobile:', mobile)
      if (!mobile) {
        wx.showModal({
          title: '提示',
          content: '请填写手机号',
          showCancel: false
        });
        return false;
      } else if (!/^1[3,4,5,6,7,8,9][0-9]{9}$/g.test(mobile)) {
        wx.showModal({
          title: '提示',
          content: '手机号格式不对',
          showCancel: false
        });
        return false;
      }
      // util.countdownFn(this);
      // console.log('获取验证码:', e)

      let data = { mobile: mobile, timestamp: new Date().getTime() }
      let registerUrl = util.GET_CODE;
      wx.request({
        url: registerUrl,
        method: 'POST',
        data: data,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        dataType: 'JSON',
        success: function (res) {
          //判断注册状态
          let result = JSON.parse(res.data);
          console.log('获取验证码', result);
          if (result.code == 200) {
            wx.showToast({
              title: '验证码发送成功',
              icon: 'success',
              duration: 2000
            })
          } else {
            wx.showModal({
              title: '错误提示',
              content: result.msg,
              showCancel: false
            })
          }
        },
        fail: function () {
          wx.showModal({
            title: '提示',
            content: '获取验证码失败，请重试！',
            showCancel: false
          })
        },
      })
    },
    // 注册条件完整度判断
    isOmitted:function(){
        let obj = this.data;
        if (!obj.mobile || !obj.code){
            return true
        }else{
            return false
        }
    },
    // 输入验证码
    codeChange:function(e){
      let that =this;
      that.setData({
        code: e.detail.value
      })
    },
    // 注册
    register: function () {
        console.log('注册', this.data);
        let self = this;
        //判断注册条件全不全
        let omit = this.isOmitted();
        if(omit){
            wx.showModal({
                title: '提示',
                content: '注册条件有遗漏未填项，请填完整',
                showCancel: false
            });
            return false
        }
        let data = {};
        data.role = this.data.role;
        data.openid = util.userInfo.openid;
        data.mobile = this.data.mobile;
        data.code = this.data.code;
        data.timestamp = new Date().getTime();
        let registerUrl = util.registerUrl;
        wx.request({
            url: registerUrl,
            method: 'POST',
            data: data,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            dataType: 'JSON',
            success: function (res) {
                //判断注册状态
                let result = JSON.parse(res.data);
                // console.log('注册结果', res,result);
                if (result.code == 200) {
                    //注册成功，跳转到登录页
                    self.data.registerSuccess = true; //修改是否注册成功状态
                    wx.showModal({
                      title: '注册成功',
                      content: '请点击确定跳转到首页',
                      showCancel:false,
                      success: function (res) {
                        if (res.confirm) {
                          wx.switchTab ({
                            url: '/pages/index/cIndex/index/index',
                          })
                        }
                      }
                    })
                } else if(result.code==300){
                    wx.showModal({
                        title: '提示',
                        content: result.msg,
                        showCancel: false
                    })
                } else {
                    wx.showModal({
                        title: '错误提示',
                        content: result.msg,
                        showCancel: false
                    })
                }
            },
            fail: function () {
                wx.showModal({
                    title: '提示',
                    content: '注册失败，请重试！',
                    showCancel: false
                })
            },
        })
    },
    // 获取用户信息
    getUserInfo: function () {
      let that = this;
      let params = {
        id: that.data.id
      }
      wx.request({
        url: util.registerUserInfo,
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer ' + util.userInfo.token
        },
        data: params,
        success: function (res) {
          if (res.statusCode === 200 && res.data.code === 200) {
            console.log(res)
            that.setData({
              mobile: res.data.data[0].mobile,
            })
          }
        },
        fail: function (err) {
          console.log(err)
        }
      })
    },
    // 注册编辑
    registerEdit: function () {
      let that = this;
      let omit = this.isOmitted();
      if (omit) {
        wx.showModal({
          title: '提示',
          content: '注册条件有遗漏未填项，请填完整',
          showCancel: false
        });
        return false
      }
      let data = {};
      data.role = this.data.role;
      data.openid = util.userInfo.openid;
      data.mobile = this.data.mobile;
      data.code = this.data.code;
      data.timestamp = new Date().getTime();
      console.log(data, "data:::")
      wx.request({
        url: util.registerEdit,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer ' + util.userInfo.token
        },
        data: data,
        success: function (res) {
          if (res.statusCode === 200 && res.data.code === 200) {
            //注册成功，跳转到登录页
            console.log("chenggongla")
            that.data.registerSuccess = true;
            wx.showModal({
              title: '注册成功',
              content: '请点击确定跳转到首页',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.switchTab({
                    url: '/pages/index/cIndex/index/index',
                  })
                }
              }
            })
          } else if (res.data.code == 300) {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: false
            })
          } else {
            wx.showModal({
              title: '错误提示',
              content: res.data.msg,
              showCancel: false
            })
          }
        },
        fail: function () {
          wx.showModal({
            title: '提示',
            content: '注册失败，请重试！',
            showCancel: false
          })
        },
      })
    },
    // 页面卸载
    onUnload:function(){
        // console.log('页面卸载');
        let sure = this.data.registerSuccess;
        let img = this.data.identifyCardUrl;
        if(!sure && img){ //未注册成功即退出本页
            // 通知后台服务器删除刚上传的照片
            let url = util.deleteImgUrl;
            wx.request({
                url: url,
                method:'POST',
                data:{ imgUrl:img, timestamp: new Date().getTime()},
                header:{
                    'content-type': 'application/x-www-form-urlencoded'
                },
                dataType:'JSON',
                success:function(data){
                    let res = JSON.parse(data.data);
                    if(res.code===200){
                        console.log('通知后台服务器删除刚上传的照片ok')
                    }else{
                        console.log('通知后台服务器删除刚上传的照片err')
                    }
                }
            })
        }
    },
    //返回首页
    backIndex: function () {
      wx.switchTab({
        url: '/pages/index/cIndex/index/index',
      })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.setData({
        id: options.id
      })
      if (options.id) {
        this.getUserInfo();
      }
    },
})
