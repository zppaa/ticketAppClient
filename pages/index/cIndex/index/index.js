// pages/index/cIndex/index/index.js
var base64 = require("../../../../public/images/base64");
var util = require("../../../../utils/util.js");
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
  /**
   * 页面的初始数据
   */
  data: {
    itemUrl: '/public/images/olympic_title.jpg',
    // showActivity: false,
    // text: '',
    
    couponList: [],      //轮播图片
    indicatorDots: true,
    autoplay: true,
    circular: true,
    interval: 5000,
    duration: 1000,

    tabs: ["游客购票", "景点介绍"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    loginCode: '',

    ticketPrice: 0,
    couponId: '',  // 当前优惠券id

    hidden: true,  // 加载中
    ticketsList: [],
    categoryId: '',
    flag: true
  },
  // 活动详情
  activity: function (e) {
    let that = this;
    if (that.data.flag) {
      return false;
    }
    wx.navigateTo({
      url: '/pages/index/cIndex/promotion/promotion?id='+ e.target.id
    })
    
  },
  onShow: function () {
    var that = this;
    // 获取登录信息
    util.login(function (err, userInfo) {
      console.log(userInfo, "userInfo::")
      if (err) {
        console.log(err)
        wx.showModal({
          title: '提示',
          content: "网络繁忙，请稍后重试",
          confirmText: '关闭',
          showCancel: false
        })
      } else {
        userInfo.source = util.source;
        util.userInfo = userInfo;
        console.log(util.userInfo,"util:::")
        that.getPrice();
        if (util.userInfo.role === 'visitor') {
          wx.request({
            url: util.currentCoupon + '?timestamp=' + (new Date().getTime()),
            success: function (res) {
              console.log("coupnId",res)
              if (res.statusCode === 200 && res.data.code === 200) {
                if (res.data.data.length != 0){
                  let imgUrls = res.data.data.map(o => {
                    return o.picture
                  })
                  that.setData({
                    // couponId: res.data.data[0].id,
                    // text: res.data.data[0].name,  显示活动名称
                    imgUrls: imgUrls,
                    couponList: res.data.data,
                    flag: false    // 图片点击
                  })
                  that.queryCoupon(userInfo.id, res.data.data[0].id, res.data.data[0].name);
                }else{
                  that.setPic();
                }
                
              } else {
                that.setPic();
              }
            },
            fail: function (err) {
              console.error(err)
              that.setPic();
            }
          })
        } else {
          that.setPic();
        }
      }
    })      
  },
  setPic:function(){
    this.setData({
      // showActivity: false
      couponList: [
        { picture: '/public/images/olympic_add.jpg' },
        { picture: '/public/images/olympic_four.jpg' },
        { picture: '/public/images/olympic_five.jpg' },
        { picture: '/public/images/olympic_six.jpg' }
      ]
    })
  },

  getPrice:function(){
    // 首页获取票价
    let that = this;
    that.setData({
      hidden: false
    })
    let source = { source: util.userInfo.source, timestamp: new Date().getTime() };
    wx.request({
      url: util.indexTicketPrice,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      data: source,
      success: function (res) {
        console.log(res,"首页获取票价：：")
        that.setData({
          hidden: true
        })
        if (res.statusCode === 200 && res.data.code === 200) {
          let ticketsList = [];
          ticketsList=res.data.data;
          that.setData({
            ticketsList: ticketsList
          })
        } else {
          that.setData({
            ticketPrice: 0
          })
          wx.showModal({
            title: '提示',
            content: "网络繁忙，请稍后重试",
            confirmText: '关闭',
            showCancel: false
          })
          
        }
      },
      fail: function (err) {
        that.setData({
          hidden: true
        })
        wx.showModal({
          title: '提示',
          content: "网络繁忙，请稍后重试",
          confirmText: '关闭',
          showCancel: false
        })
        console.error(err)
      }
    })
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  // onConfirm: function () {
  //   this.hideModal();
  // },
  // 购票须知
  ticketNotice: function () {
    wx.navigateTo({
      url: '/pages/index/cIndex/notice/notice'
    })
  },
  // 周边美食
  arroundFood: function () {
    wx.navigateTo({
      url: '/pages/index/cIndex/arroundFood/arroundFood'
    })
  },
  // 购票、景点介绍tab切换
  tabClick: function (e) {
    let that = this;
    that.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  // 判断是否注册
  isRegister:function(){
    return !!util.userInfo.mobile
  },
  // 预订购票
  pay: function (e) {
    // 判断用户身份
    let that = this;
    
    that.setData({
      categoryId: e.target.id,
    })
    console.log(e.target.dataset.unit,11)
    if(that.isRegister()){
      if (e.target.dataset.unit > 0) {
        wx.navigateTo({
          url: '/pages/tourist/reserve/reserve?ticketPrice=' + e.target.dataset.unit + '&categoryId=' + that.data.categoryId,    //游客购票页
        })
      }
    }else{
      wx.navigateTo({
        url: '/pages/tourist/register/register',    //游客注册页
      })
    }
  },
  // 查询优惠券是否领取
  queryCoupon(id,couponId,content){
    console.log("开始领取")
    let that = this;
    let params = {
      userId: id,
      couponId: couponId,
      timestamp: new Date().getTime()
    };
    console.log(params,"params:::")
    wx.request({
      url: util.queryCoupon,
      data: params,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      success: function (res) {
        console.log(res,"res:::")
        if (res.statusCode === 200 && res.data.code === 200) {
          // that.setData({
          //   showActivity: false
          // })
        } else {
          // 
          // that.setData({
          //   showActivity: true
          // })
          // wx.showModal({
          //   title: '优惠活动',
          //   content: content,
          //   confirmText: '查看',
          //   cancelText: '取消',
          //   success: function (res) {
          //     console.log(res, "res::")
          //     if (res.confirm == true) {
          //       console.log("confirm")
          //       wx.navigateTo({
          //         url: '/pages/index/cIndex/promotion/promotion',
          //       })
          //     }
          //   }
          // })
        }
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    
    // tab 切换
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    this.setData({
      icon: base64.icon20
    });
  },
  showModal: function () {
    wx.showModal({
      title: '营业时间',
      content: '日场：9:00-16:30\r\n兑票时间：9:00-16:00\r\n夜场：17:00-22:00\r\n兑票时间：17:00-21:00',
      showCancel:false
    })
  }
})
