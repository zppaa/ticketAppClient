// pages/index/cIndex/reserve/reserve.js
let util = require('../../../../utils/util');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    sourceName: '', //来源名
    startTime: '',      // 默认时间
    endTime:'', // 选择最大时间
    number: 0,   // 票数
    unit: 0, // 单价
    time: '',           // 入园日期
    ticketType: 1, // 票类型
    totalMoney: 0,
    failedOrder: '', // 支付失败订单
    flag: false,
    timeValue:1,         //选择1白场 2夜场
    timeRange:['白场','夜场'],      // 入场时间
    originValue:1,        // 客源地 1内宾 2外宾
    originRange:['内宾','外宾']
  },
  // 票数
  getNum: function (e) {
    let that = this;
    var number = e.detail.value.replace(/[^\d]/g, '');
    this.setData({
      number: number,
    })
    console.log(111)
    //that.getTicketsPrice(that.data.number, that.data.timeValue, that.data.originValue);
  },
  //选择夜场白场
  timeSelect: function (value) {
    let that = this;
    let index = parseInt(value.detail.value[0]);
    that.setData({
      timeValue: index + 1
    });
    //that.getTicketsPrice(that.data.number, that.data.timeValue, that.data.originValue);
  },

  //选择内宾外宾
  originSelect: function (value) {
    let that = this;
    let index = parseInt(value.detail.value[0]);
    this.setData({
      originValue: index + 1
    });
    //that.getTicketsPrice(that.data.number, that.data.timeValue, that.data.originValue);
  },
  // 选定入园日期
  bindDateChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  // 获取票价
  getTicketsPrice: function (number, businessTime, guestType,cb) {
    let that = this;
    let userId;
    if (!number) {
      return;
    }
    if (util.userInfo.source != '-2'){   // 如果是导游，获取来源（旅行社）的票价
      userId = util.userInfo.source;
    }else{
      userId = util.userInfo.openid;
    }
    let params = {
      userId: userId,
      number: number,
      businessTime: businessTime,
      guestType: guestType,
      timestamp: new Date().getTime()
    };
    console.log("params:",params)
    wx.request({
      url: util.collectiveTicketPrice,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      data: params,
      success: function (res) {
        console.log('获取票价', res);
        cb(res)
      //   if (res.statusCode === 200 && res.data.code === 200) {
      //     let totalMoney = res.data.data.total / 100
      //     that.setData({
      //       totalMoney: totalMoney,
      //       realPay: (totalMoney - that.data.cheapPrice) < 0 ? 0 : (totalMoney - that.data.cheapPrice),
      //       unit: res.data.data.unit / 100,
      //       flag: false
      //     })
      //   }else if(res.data.code === 300){
      //     wx.showModal({
      //       title: '提示',
      //       content: '该用户还没有计费规则，请联系票务客服',
      //       showCancel: false
      //     })
      //     that.setData({
      //       flag: true
      //     })
      //   }
       }
    })
  },

  //点击确定
  confirm:function(){
    let that = this;
    let param = that.param();
    if (!param.number) {
      wx.showToast({
        title: '请填写购票数量',
        icon: 'none'
      })
      return false;
    }
    that.getTicketsPrice(that.data.number, that.data.timeValue, that.data.originValue,function(res){
      if (res.statusCode === 200 && res.data.code === 200) {
        let totalMoney = res.data.data.total / 100
        that.setData({
          totalMoney: totalMoney,
          realPay: (totalMoney - that.data.cheapPrice) < 0 ? 0 : (totalMoney - that.data.cheapPrice),
          unit: res.data.data.unit / 100,
          flag: false
        });
        wx.showModal({
          title: '',
          content: '购票数量：' + param.number + ' 张\r\n 预约入园日期：' + param.reserveDate + '\r\n浏览时间：' + that.data.timeRange[param.timeValue - 1] + '\r\n客源地：' + that.data.originRange[param.originValue - 1] + '\r\n 单价：' + that.data.unit + '\r\n 总价：' + that.data.totalMoney,
          confirmText: '支付',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
              that.pay();
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })  
      } else if (res.data.code === 300) {
        wx.showModal({
          title: '提示',
          content: '该用户还没有计费规则，请联系票务客服',
          showCancel: false
        })
        that.setData({
          flag: true
        })
      }
    });
    
    
  },
  
  pay: function () {
    let that = this;
    if(that.data.flag === true){
      return false;
    } 
    let user = util.userInfo,
      scenicId = util.scenicId; //景区id
    let param = that.param();
    if (user.role === 'guide') {
      // 走微信支付
      that.wxRecharge(param);
    } else {
      if (user.isPrepay === 1) {
        // 旅行社判断余额是否足够
        that.isBalanceEnough((err, res) => {
          if (err) {
            // 提示用户重试
            console.log('提示用户重试');
          } else {
            let result = JSON.parse(res.data);
            console.log('旅行社用户余额是否够用', result);
            if (result.code === 200) {
              if (result.data === 'enough') {
                // 余额支付
                that.data.failedOrder && (param.failedOrder = that.data.failedOrder);
                that.balanceRecharge(param);
              } else if (result.data === 'shortage') {
                // 微信支付
                that.wxRecharge(param);
              }
            } else {
              // 判断失败,提示用户重试
              console.log('判断失败,提示用户重试');
            }
          }
        })
      } else {
        // 微信支付
        that.wxRecharge(param);
      }

    }
  },

  // 旅行社用户余额是否够用
  isBalanceEnough: function (cb) {
    let data = {};
    data.userId = util.userInfo.id;
    data.money = this.data.totalMoney * 100;
    data.timestamp = new Date().getTime();
    let url = util.isBalanceEnoughUrl;
    wx.request({
      url: url,
      method: 'POST',
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      dataType: 'JSON',
      success: function (res) {
        cb(null, res)
      },
      fail: function (err) {
        cb(err)
      }
    })
  },

  // 条件收集
  param: function () {
    let obj = this.data, user = util.userInfo;
    let money = parseInt(obj.totalMoney * 100);
    let data = {};
    data.orderId = this.createOrderId(user.id);
    data.totalPrice = money;
    data.number = obj.number;
    data.userId = user.id;
    data.placeId = util.scenicId;
    data.reserveDate = obj.time;
    data.unit = obj.unit*100;
    data.ticketType = obj.ticketType;
    data.source = user.source;
    data.openid = user.openid;
    data.timestamp = new Date().getTime();
    data.timeValue = obj.timeValue;
    data.originValue = obj.originValue;
    if (obj.discountFee) {
      data.discountFee = obj.discountFee;
      data.couponId = obj.couponId;
    }

    return data;
  },

  // 余额支付
  balanceRecharge: function (data) {
    // 导游和旅行社用户从预充值账户里扣钱支付
    console.log('开始余额支付', data);
    let url = util.paymentUrl;
    wx.request({
      url: url,
      method: 'POST',
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      dataType: 'JSON',
      success: function (res) {
        // wx.hideLoading();
        let result = JSON.parse(res.data);
        console.log('支付结果', result);
        if (result.code == 200) {
          //支付成功，
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000,
            mask: true
          });
          setTimeout(function(){
            wx.navigateTo({
              url: '/pages/order/orderDetail/orderDetail?orderId=' + data.orderId,
            })
          },2000)
        } else if (result.code == 250) {
          wx.showModal({
            title: '提示',
            content: '余额不足，请先充值！',
            showCancel: false
          })
        } else if (result.code == 500) {
          //支付失败，弹窗提示，重新支付
          self.data.failedOrder = data.orderId;

          wx.showModal({
            title: '提示',
            content: '支付失败，请重试！',
            showCancel: false
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        // self.data.failedOrder = data.orderId;
        wx.showModal({
          title: '提示',
          content: '支付失败，请重试！',
          showCancel: false
        })
      }
    })
  },

  // 微信支付
  wxRecharge: function (data) {
    let self = this;
    let url = util.wxPay;
    wx.request({
      url: url,
      method: 'POST',
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      dataType: 'JSON',
      success: function (res) {
        // wx.hideLoading();

        let result = JSON.parse(res.data);
        if (result.code === 200) { // 创建预支付单成功，开始微信支付
          self.requestPayment(result.data)
        } else { // 创建订单失败
          if (result.msg instanceof Object) {
            wx.showModal({
              title: '提示',
              content: '下单失败',
              showCancel: false
            })
          } else {   
            wx.showModal({
              title: '提示',
              content: result.msg,
              showCancel: false,
              success: function (res) {
                if (res.confirm === true) {
                  wx.navigateTo({
                    url: '/pages/order/orderDetail/orderDetail?orderId=' + data.orderId,
                  })
                }
              }
            })
          }
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '支付失败，请重试！',
          showCancel: false
        })
      }
    })
  },

  // 调用微信支付
  requestPayment: function (data) {
    let self = this;
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': 'MD5',
      'paySign': data.paySign,
      'success': function (res) {

        // 判断调用接口是否成功，成功则跳转到订单详情页
        // 支付成功,判断是否是旅行社
        wx.navigateTo({
          url: '/pages/order/orderDetail/orderDetail?orderId=' + self.data.orderId,
        })
      },
      'fail': function (res) {
        // console.log('用户取消支付或支付失败',res);
        if (res.errMsg !== 'requestPayment:fail cancel') {
          let msg = res.errMsg.split('(')[1];
          msg = msg.slice(0, msg.length - 1);
          wx.showModal({
            title: '提示',
            content: '支付失败：' + msg,
            confirmColor: '#20b976',
            showCancel: false
          });
        }
      }
    })
  },

  // 生成订单id
  createOrderId(userId) {
    let res = '';
    res += util.formatOrder(new Date());
    res += userId;

    let num = Math.random() + '';
    res += num.slice(num.length - 2);

    this.setData({
      orderId: res
    });
    return res
  },
  //获取来源名称
  getSource: function(){
    let that = this;
    if (util.userInfo.source == '-2'){
      console.log('二维码来源为景区')
      that.setData({
        sourceName: '奥林匹克塔'
      })
      return false;
    }
    let params = {
      source: util.userInfo.source
    }
    wx.request({
      url: util.getSource,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      data: params,
      success: function (res) {
        if (res.statusCode === 200 && res.data.code === 200) {
          console.log('获取来源名称',res)
          that.setData({
            sourceName: res.data.data[0].sourceName
          })
        }else{
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            confirmColor: '#20b976',
            showCancel: false
          });
        }
      },
      fail: function (err) {
        console.log('获取导游来源旅行社名称失败', err)
      }
    })
  },

  //获取下个月日期
  getNextMonth:function(){
    var date = new Date;
    var year = date.getFullYear();
    var month = date.getMonth() + 2;
    var lastDay = util.formatDate(new Date(year, month, 0));
    return lastDay;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    // console.log('生命周期函数--监听页面加载');
    let today = new Date();
    let that = this;
    today = util.formatDate(today);
    let user = util.userInfo;      // todo 判断只有旅行社和导游可进入，其他需跳转到首页、
    let mobile = user.mobile;
    console.log('mobile',mobile)
    if (!mobile) { // 1.判断用户是否注册，跳转到选择身份页
      return wx.redirectTo({
        url: '/pages/selectIdentity/selectIdentity',
      });
    } 
    if (user.role == 'travelAgent' || user.role == 'guide') {
      let endTime = that.getNextMonth();
      that.setData({
        startTime: today,
        time: today,
        endTime: endTime,
      });

      //获取来源名
      that.getSource();
      // 判断是否审核
      if (util.userInfo.status != 1) {
        wx.showModal({
          title: '提示',
          content: '审核未通过，请耐心等待',
          showCancel: false,
          success: function (res) {
            if (res.confirm === true) {
              wx.switchTab({
                url: '/pages/index/cIndex/index/index',
              })
            }
          }
        })
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '只有旅行社和导游可购买团体票',
        showCancel: false,
        success: function (res) {
          if (res.confirm == true) {
            wx.switchTab({
              url: '/pages/index/cIndex/index/index',
            })
          }
        }
      })
    }
  }
})
