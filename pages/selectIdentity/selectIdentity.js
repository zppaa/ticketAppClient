// pages/selectIdentity/selectIdentity.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        systems: [
            { name: '游客', id: 1 },
            { name: '旅游行业从业者', id: 2 },
            { name: '旅游行业企业', id: 3 },
            { name: '旅行社', id: 4 },
            { name: '司机', id: 5 },

        ],
        defaultSystemValue: [1],
        systemValue: 2,
        registers: ['../tourist/register/register', '../guide/register/register', '../merchant/register/register','../travelAgent/register/register',  '../driver/register/register'],
    },

    //切换系统
    // systemSelect: function (value) {
    //     let index = value.detail.value[0];
    //     this.data.systemValue = this.data.systems[index].id;
    // },

    // //下一步去注册
    // next: function () {
    //     console.log('去注册');
    //     let sys = this.data.systemValue;
    //     console.log(sys)
    //     let register = this.data.registers[sys - 1];
    //     wx.navigateTo({
    //         url: register,
    //     })
    // },
    //去注册
    registerGo: function(e){
      console.log('去注册');
      console.log(e)
      let id = e.currentTarget.id;
      let register = this.data.registers[id-1];
      wx.navigateTo({
        url: register,
      })
    },
    //返回首页
    backIndex: function () {
      wx.switchTab({
        url: '/pages/index/cIndex/index/index',
      })
    },
})