// pages/forgetPsw/changePsw/changePsw.js
let util = require('../../../utils/util');
let MD5 = require('../../../utils/MD5');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        oldPsw:'',
        password1:'',
        newPsw:'',
        mobile:'',
    },

    // 旧密码输入
    oldPswChange:function(e){
        let oldpsw = e.detail.value;
        if(oldpsw.length>0){
            this.data.oldPsw = oldpsw;
        }
    },

    // 新密码输入
    psw1Change:function(e){
        let psw1 = e.detail.value;
        if(psw1){
            if (psw1.length > 7) {
                this.data.password1 = psw1
            } else {
                wx.showModal({
                    title: '提示',
                    content: '密码不少于8位',
                    showCancel: false
                })
            }
        }
    },

    // 新密码再输入
    psw2Change:function(e){
        let psw = e.detail.value;
        if(psw){
            if (psw === this.data.password1) {
                this.data.newPsw = psw
            } else {
                wx.showModal({
                    title: '提示',
                    content: '确认密码与新密码不符',
                    showCancel: false
                })
            }
        }
    },

    // 修改密码
    changePsw:function(){
        let data = {};
        data.mobile = this.data.mobile;
        data.oldPsw = MD5.hexMD5("" + this.data.mobile + this.data.oldPsw);
        data.newPsw = MD5.hexMD5("" + this.data.mobile + this.data.newPsw);

        let url = util.changePswUrl;
        wx.request({
            url: url,
            method:'POST',
            data:data,
            header:{
                'content-type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + wx.getStorageSync('token')
            },
            dataType:'JSON',
            success:function(res){
                // console.log('修改密码结果：',res);
                let data = JSON.parse(res.data);
                if (res.statusCode == 401) {
                    // token过期重新登录
                    wx.showToast({
                        title: '登录过期，请重新登录！',
                        icon: 'loading',
                        duration: 1500
                    });
                    setTimeout(function () {
                        wx.redirectTo({
                            url: '/pages/login/login',
                        })
                    }, 1500);
                }else if(data.code === 200){
                    // 修改密码成功，弹窗提示，然后跳转回用户详情
                    wx.showToast({
                        title: '修改密码成功',
                        icon: 'success',
                        duration: 1500
                    });
                    setTimeout(function(){
                        wx.navigateBack({
                            delta: 1
                        })
                    },1500)
                }else{
                    // 修改密码失败，弹窗提示
                    wx.showModal({
                        title: '提示',
                        content: '修改密码失败，请重试！',
                        showCancel: false
                    })
                }
            },
            fail:function(){
                // 修改密码失败，弹窗提示
                wx.showModal({
                    title: '提示',
                    content: '修改密码失败，请重试！',
                    showCancel: false
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let userInfo = util.userInfo;
        let mobile = userInfo.mobile;
        if (mobile){
            this.data.mobile = mobile
        }
    },
})