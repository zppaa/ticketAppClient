// pages/login/login.js
let util = require('../../utils/util');
let MD5 = require('../../utils/MD5');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        from: '',
        mobile: '',
        password: '',
        disabled: '',
        indexUrl: ['../index/cIndex/index/index', '../index/bIndex/index'],
    },

    /*
    * 手机号输入
    **/
    mobileChange: function (e) {
        // console.log('手机输入', e);
        let mobile = e.detail.value;
        if(mobile.length>0){
            if (/^1[3,4,5,6,7,8,9][0-9]{9}$/g.test(mobile)) {
                this.data.mobile = mobile;
            } else {
                wx.showToast({
                    title: '请填写正确手机号!',
                    icon: 'none',
                    duration: 2000
                })
            }
        }
    },
    //密码输入
    pswChange: function (e) {
        // console.log('密码输入', e);
        let psw = e.detail.value;
        if (!psw) {
            wx.showToast({
                title: '请填写密码!',
                icon: 'none',
                duration: 2000
            })
            return;
        }
        this.data.password = psw;
    },
    /*
    * 登录
    */
    loginSystem: function () {
        let self = this;
        let mobile = self.data.mobile,
            password = self.data.password;

        let data = {};
        data.mobile = mobile;
        data.password = MD5.hexMD5("" + mobile + password);  //MD5加密
        data.timestamp = new Date().getTime();
        let url = util.loginUrl;
        wx.showLoading({ title: '加载中', })
        // 登录请求
        wx.request({
            url: url,
            method: 'POST',
            data: data,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            dataType: 'JSON',
            success: function (res) {
                wx.hideLoading()
                //判断登录状态
                let result = JSON.parse(res.data);
                // console.log('登录验证结果', res,result);
                if (result.code == 200) {
                    // 保存用户信息
                    util.userInfo = result.info;

                    wx.setStorageSync('token', result.info.token);

                    // 登录成功，跳转到相应页面
                    if (util.userInfo.role === 'admin') {

                        wx.redirectTo({
                            url: '/pages/index/bIndex/QRscan/scan',
                        })
                    } else if (self.data.from) {
                        wx.switchTab({
                            url: self.data.from,
                        })
                    } else {
                        wx.switchTab({
                            url: '/pages/index/cIndex/index/index',
                        })
                    }
                } else {
                    wx.showModal({ title: '错误提示', content: result.msg, showCancel:false})
                }
            },
            fail: function () {
                wx.hideLoading()
                wx.showModal({ title: '登录提示', content: '请求失败，请重试！', showCancel: false })
            },
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (e) {
        console.log('生命周期函数--监听页面加载', e);
        this.data.from = e.from
    },

    /**
     * 忘记密码
     */
    forgetPsw: function () {
        let mobile = util.serviceTel;
        wx.showModal({
            title: '提示',
            content: '忘记密码需要电话联系我们的客服，让客服给您一个临时密码，您用临时密码登录，进入用户中心设置新密码，是否电话联系客服？电话：18310016618',
            confirmText:'电话联系',
            success:function(res){
                if (res.confirm) {
                    console.log('用户点击确定');
                    wx.makePhoneCall({
                        phoneNumber: mobile //仅为示例，并非真实的电话号码
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            },
        })
    }
})
