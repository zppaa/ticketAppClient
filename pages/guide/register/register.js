// pages/tour/register/register.js
let util = require('../../../utils/util');
let MD5 = require('../../../utils/MD5');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        role:'guide',
        name: '', //名称
        mobile: '', //手机
        code: '', //手机验证码
        idcardNum: '', //身份证号
        creditCode: '',  //导游证号
        authPic: '', //导游证照片地址
        codeBtnText: '获取验证码',
        countdown: '60',
        codeBtnDisablied: false,
        files: [],
        isUploadShow: true,
        registerSuccess:false,
        travelAgents:[], // 所有旅行社
        travelObj:[],
        travelIndex:0,

        id: '',
    },

    // 姓名输入
    nameChange: function (e) {
        console.log('姓名输入', e);
        let name = e.detail.value;
        this.data.name = name;
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
      console.log('mobile:',mobile)
      if (!mobile) {
        wx.showModal({
          title: '提示',
          content: '请填写手机号',
          showCancel: false
        });
        return false;
      } else if (!/^1[3,4,5,6,7,8,9][0-9]{9}$/g.test(mobile)){
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
    // 输入验证码
    codeChange: function (e) {
      console.log('输入验证码', e);
      let code = e.detail.value;
      this.data.code = code;
    },
    //输入身份证号
    idcardChange:function(e){
        let val= e.detail.value;
        if(val){
            if (/^\d{17}(\d|x)$/g.test(val)) {
                this.data.idcardNum = val
            } else {
                wx.showModal({
                    title: '提示',
                    content: '身份证号格式不对',
                    showCancel: false
                })
            }
        }
    },

    //输入导游证号
    creditCodeChange:function(e){
        let val = e.detail.value;
        if(val){
            if (/^D-\d{4}-\d{6}$/g.test(val)) {
                this.data.creditCode = val;
            } else {
                wx.showModal({
                    title: '提示',
                    content: '导游证编号格式不对',
                    showCancel: false
                })
            }
        }
    },

    // 上传导游证照片，返回照片url
    chooseImage: function (e) {
        let that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            count: 1,
            success: function (res) {
                // console.log('图片信息', res);
                that.setData({
                    files: that.data.files.concat(res.tempFilePaths)
                });

                let tempFilePaths = res.tempFilePaths
                let uploadImgUrl = util.uploadImgUrl;
                wx.uploadFile({
                    url: uploadImgUrl,
                    filePath: tempFilePaths[0], //只能上传一张吗？
                    name: 'guide',
                    success: function (res) {
                        // console.log('上传结果', res.data);
                        let data = res.data;
                        if (data != 'no_file') {
                            //上传成功，方框中心打勾，将url存入this.data.identifyCardUrl
                            let path = data.split('>')[1];
                            that.setData({
                                isUploadShow: false,
                                authPic: path
                            });
                        } else {
                            wx.showModal({
                                title: 'error',
                                content: '导游证上传失败，请重试！',
                                showCancel: false
                            })
                        }
                    },
                    fail: function () {
                        console.log('上传失败')
                    }
                })
            }
        })
    },
    // 预览照片
    previewImage: function (e) {
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.files // 需要预览的图片http链接列表
        })
    },

    // 注册条件完整度判断
    isOmitted: function () {
        let obj = this.data;
        console.log('注册信息：',obj)
        if (!obj.name || !obj.mobile || !obj.authPic || !obj.idcardNum || !obj.creditCode ||  !obj.code) {
            return true
        } else {
            return false
        }
    },

    // 注册
    register: function () {
        console.log('注册', this.data);
        let self = this;
        //判断注册条件全不全
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
        data.name = this.data.name;
        data.mobile = this.data.mobile;
        data.code = this.data.code;
        data.role = this.data.role;
        data.idcard = this.data.idcardNum;
        data.creditCode = this.data.creditCode;
        data.authPic = this.data.authPic;
        data.openid = util.userInfo.openid;
        data.timestamp = new Date().getTime();
        data.source = util.userInfo.source;
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
                console.log('注册结果', res, result);
                if (result.code == 200) {
                    //注册成功，跳转到登录页
                    self.data.registerSuccess = true;
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
                } else if (result.code == 300) {
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
            let files = [];
            files.push(res.data.data[0].authPic)
            that.setData({
              mobile: res.data.data[0].mobile,
              name: res.data.data[0].name,
              idcardNum: res.data.data[0].idcard,
              creditCode: res.data.data[0].creditCode,
              authPic: res.data.data[0].authPic,
              files: files
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
      data.name = that.data.name;
      data.mobile = that.data.mobile;
      data.code = that.data.code;
      data.role = that.data.role;
      data.idcard = that.data.idcardNum;
      data.creditCode = that.data.creditCode;
      data.authPic = that.data.authPic;
      data.openid = util.userInfo.openid;
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

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        // console.log('页面卸载');
        let sure = this.data.registerSuccess;
        let img = this.data.authPic;
        if (!sure && img) { //未注册成功即退出本页
            // 通知后台服务器删除刚上传的照片
            let url = util.deleteImgUrl;
            wx.request({
                url: url,
                method: 'POST',
                data: { imgUrl: img,timestamp: new Date().getTime() },
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                dataType: 'JSON',
                success: function (data) {
                    let res = JSON.parse(data.data);
                    if (res.code === 200) {
                        console.log('通知后台服务器删除刚上传的照片ok')
                    } else {
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
})
