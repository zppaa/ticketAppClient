// pages/merchant/userDetail/userDetail.js
let util = require('../../../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    changeShow: true,
    systems: [
      { name: '游客', id: 1 },
      { name: '旅游行业从业者', id: 2 },
      { name: '旅游行业企业', id: 3 },
      { name: '旅行社', id: 4 },
      { name: '司机', id: 5 },
    ],
    registers: ['../../../tourist/register/register', '../../../guide/register/register', '../../../merchant/register/register', '../../../travelAgent/register/register', '../../../driver/register/register'],
  },

  // 去往修改密码页
  changePsw: function () {
    wx.navigateTo({
      url: '/pages/forgetPsw/changePsw/changePsw',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    console.log('用户信息：', util.userInfo);
    let user = util.userInfo;
    let time = new Date(user.uptime);
    time = util.formatTime(time)
    user.uptime = time;
    this.setData({
      user: user
    });
    // request请求获取用户头像
  },
  onShow: function(){
    if(this.data.user.status === 5){
      this.setData({
        changeShow: true
      })
    }
  },
  // 修改
  change:function(){
    // var a = [{ id: 1, name: 1 }, { id: 2, name: 2 }, { id: 3, name: 4 }, { id: 2, name: 'zjw' }];
    let that = this;
    let a = that.data.systems;
    let result = [];
    let name = '';
    if (that.data.user.role === 'visitor'){
      name = '游客'
    } else if (that.data.user.role === 'guide') {
      name = '旅游行业从业者'
    } else if (that.data.user.role === 'travelAgent') {
      name = '旅行社'
    } else if (that.data.user.role === 'merchant') {
      name = '旅游行业企业'
    } else if (that.data.user.role === 'driver') {
      name = '司机'
    }
    a.map(function (a, b, c) {
      if (a.name === name) {
        result.push(a);
        return;
      }
    });
    let register = that.data.registers[result[0].id - 1];
    wx.navigateTo({
      url: register + '?id=' + util.userInfo.id
    })
  }
})