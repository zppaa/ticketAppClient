// pages/forgetPsw/verificationCode/verificationCode.js
Page({

    /**
       * 页面的初始数据
       */
    data: {
        tip: '获取验证码',
        mobile: '',
        verificationCode: '',
        isDisabled:false,
    },

    /*
    * 监听手机号输入
    */
    mobileChange: function (val) {
        let mobile = val.detail.value;
        if (/^1[3,4,5,7,8][0-9]{9}$/g.test(mobile)) {
            this.data.mobile = mobile;
        } else {
            wx.showModal({
                title: '提示',
                content: '手机号格式不对',
            });
        }
    },

    /*
    * 通知后台发送验证码，然后开始倒计时
    */
    getVerificationCode: function () {
        console.log('通知后台发送验证码，然后开始倒计时');
        let mobile = this.data.mobile;
        if(mobile){
            //   wx.request({})
            this.setData({
                isDisabled:true
            });
            this.countDown()
        }else{
            wx.showModal({
                title: '提示',
                content: '请先输入手机号！',
                showCancel:false
            })
        }
    },

    // 60s倒计时
    countDown:function(){
        let self = this;
        let number = 60;
        let timer = setInterval(function(){
            if(number>=0){
                self.setData({
                    tip: number + 's'
                });
                number--;
            }else{
                clearInterval(timer);
                self.setData({
                    isDisabled: false,
                    tip:'获取验证码'
                });
                console.log('定时器',timer);
            }
            
        },1000);
    },

    /*
    * 监听验证码输入
    */
    verificationCodeChange: function (val) {
        let verificationCode = val.detail.value;
        this.data.verificationCode = verificationCode;
    },

    /*
    * 验证验证码，去获取密码???????是到设置新密码界面，还是直接短信给他旧密码--旧密码给不了，md5加密没法解密
    */
    goEditPsw: function () {
        let mobile = this.data.mobile,
            verificationCode = this.data.verificationCode;

    },
})