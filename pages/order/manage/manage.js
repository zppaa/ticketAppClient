// pages/order/statistics/statistics.js
let util = require('../../../utils/util');
var sliderWidth = 86; // 需要设置slider的宽度，用于计算中间位置
var _sliderWidth = 86; // 需要设置slider的宽度，用于计算中间位置
function check(startTime, endTime) {
  if (startTime.length > 0 && endTime.length > 0) {
    var startTmp = startTime.split("-");
    var endTmp = endTime.split("-");
    var sd = new Date(startTmp[0], startTmp[1], startTmp[2]);
    var ed = new Date(endTmp[0], endTmp[1], endTmp[2]);
    if (sd.getTime() > ed.getTime()) {
      console.log("开始日期不能大于结束日期");
      return false;
    }
  }
  return true;
}
Page({
  data: {
    statisShow: true,
    tabs: ["订单列表", "订单统计"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    startDate: '',
    endDate: '',
    orderNumber: '- -',
    toBeDone: '- -',
    alreadyPay: '- -',

    _tabs: ["全部订单", "已退款", "已支付"],
    _activeIndex: 0,
    _sliderOffset: 0,
    _sliderLeft: 0,
    orderType: '0', //订单状态 0：全部 1：代付款 2：已完成
    allOrder: [],
    loading: false, //"上拉加载"的变量，默认false，隐藏
    loadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    pageNum: 0,   // 设置加载的第几次，默认是第一次
    callbackcount: 10,      //返回数据的个数
    isFromSearch: true, // 用于判断allOrder数组是不是空数组，默认true，空的数组
    role:'',     //用户角色
    source:'',   //来源
    stasticList: []  // 订单统计列表
  },
  onLoad: function () {
    var that = this;

    let _date = util.formatDate(new Date());
    that.setData({
      startDate: _date,
      endDate: _date,
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,

          _sliderLeft: (res.windowWidth / that.data._tabs.length - _sliderWidth) / 2,
          _sliderOffset: res.windowWidth / that.data._tabs.length * that.data._activeIndex
        });
      }
    });

    //通过身份判断订单统计页显示
    if (util.userInfo.role === 'visitor'){
      sliderWidth = -100
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            statisShow: false,
            tabs: ['订单列表'],
            sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
            sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
          });
        }
      });
      
    }else{
      that.setData({
        statisShow: true
      })
    }
  },

  // 订单列表
  /**
   * tab 点击
   */
  listTabClick: function (e) {
    let that = this;
    let id = e.currentTarget.id;
    that.setData({
      pageNum:0,
      allOrder:[],
      orderType: id,
      _sliderOffset: e.currentTarget.offsetLeft,
      _activeIndex: e.currentTarget.id
    });
    that.getOrderList();
  },
  /**
   * 获取订单列表
   */
  getOrderList: function () {
    //订单状态
    let that = this;
    let orderType = that.data.orderType;
    let pageindex = that.data.pageNum;
    let callbackcount = that.data.callbackcount;
    let userId = util.userInfo.id;
    let token = util.userInfo.token;
    let source = util.userInfo.source; 
    let data = { orderType: orderType, pageindex: pageindex, count: callbackcount, source: source }
    let registerUrl = util.orderListUrl + '?orderType=' + orderType + '&pageindex=' + pageindex + '&count=' + callbackcount + '&userId=' + userId + '&source=' + source +'&timestamp='+(new Date().getTime());
    wx.request({
      url: registerUrl,
      method: 'get',
      data:data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + token
      },
      dataType: 'JSON',
      success: function (res) {
        res = JSON.parse(res.data);
        console.log('订单列表数据:', res)
        if (res.code == 200) {
          if (res.data.length != 0){
            let _data = that.data.allOrder.concat(res.data);
            that.setData({
              allOrder: _data,
              role:util.userInfo.role,
              source: util.userInfo.source
            });
          }else{
            that.setData({
              loadingComplete: true, //把“没有数据”设为true，显示
              loading: false,  //把"上拉加载"的变量设为false，隐藏
            });
          }
        } else {
          that.setData({
            loadingComplete: true, //把“没有数据”设为true，显示
            loading: false,  //把"上拉加载"的变量设为false，隐藏
          });
        }
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '获取订单数据失败！',
          showCancel: false
        })
      },
    })
  },
  /**
    * 滚动到底部触发事件
    */
  scrollLower: function () {
    console.log('滚动到底部触发事件')
    let that = this;
    that.setData({
      loading: true,  //把"上拉加载"的变量设为false，隐藏
      loadingComplete: false, //“没有数据”的变量，默认false，隐藏e,
    })
    if (that.data.loading && !that.data.loadingComplete) {
      that.setData({
        pageNum: that.data.pageNum + 1,  //每次触发上拉事件，把searchPageNum+1
        isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false
      });
      that.getOrderList();
    }
  },


  // 订单统计
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  startDateChange: function (e) {
    this.setData({
      startDate: e.detail.value
    })
  },
  endDateChange: function (e) {
    this.setData({
      endDate: e.detail.value
    })
    if(!check(this.data.startDate,this.data.endDate)){
      wx.showModal({
        content: '结束日期应大于起始日期',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      });
      let _date = util.formatDate(new Date());
      this.setData({
        startDate: _date,
        endDate: _date
      })
    }
  },
  search:function(){
    let that = this;
    let startDate = that.data.startDate,
        endDate = that.data.endDate,
        source = util.userInfo.openid

    let data = {};
    data.beginTime = startDate;
    data.endTime = endDate;
    data.source = source;
    data.timestamp = new Date().getTime();
    console.log(data,"data:")
    wx.request({
      url: util.orderStatistics,
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + util.userInfo.token
      },
      success:function(res){
        console.log(res, "res::")
        that.setData({
          orderNumber: res.data.data.all,
          toBeDone: res.data.data.noPay,
          alreadyPay: res.data.data.pay,
          stasticList: res.data.data.list,
        })
      },
      fail:function(err){
        console.log(err)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    let that = this;
    that.setData({
      pageNum: 0,
      allOrder: []     
    });
    that.getOrderList();
  },
});
