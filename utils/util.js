const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') //+ ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatOrder = date => {
  let year = date.getFullYear() + '';
  year = year.slice(year.length - 2);
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('') + [hour, minute, second].map(formatNumber).join('')
}
let source = '';
let userInfo = {
  openid: '',
  mobile: ''
};
const login = fn => {
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      let data = {
        code: res.code
      }
      wx.request({
        url: loginCheck,
        data: data,
        success: function (e) {
          console.log(e, "首页注册")
          if (e.data.code === 200) {
            userInfo = e.data.userInfo;
            console.log(userInfo,"i want ::")
            fn(null, userInfo);
          } else if (e.data.code === 300) {
            userInfo = {
              openid: e.data.openid,
              mobile: ''
            };
            fn(null, userInfo)
          } else if (e.data.code === 500) {
            console.log("网络异常")
            fn("网络异常")
          }
        },
        fail: function (err) {
          console.log(err)
          fn("失败2")
        }
      })
    },
    fail: function (err) {
      fn("失败1")
    }
  })

}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//倒计时60s
const countdownFn = that => {
  if (that.data.countdown == 0) {
    that.setData({
      codeBtnText: '获取验证码',
      codeBtnDisablied: false,
      countdown: '60'
    })
  } else {
    let c = (that.data.countdown) - 1
    that.setData({
      codeBtnText: that.data.countdown + 's',
      codeBtnDisablied: true,
      countdown: c
    })
    setTimeout(function () {
      countdownFn(that)
    }, 1000)
  }
}
// 客服电话
const serviceTel = '18310016618';
// 景区id
const scenicId = '1';
//const MAIN_URL = 'http://192.168.30.14:3081';  //本地链接
const MAIN_URL = 'https://cm.tianbiao.net';  //测试链接
//const MAIN_URL = 'https://m.tianbiao.net';  //线上链接

// 滚动展示活动内容接口
const currentCoupon = MAIN_URL + '/coupon/currentCoupon';
// 领取购物券接口
const getCoupon = MAIN_URL + '/coupon/getCoupon';
// 查询购物券接口
const queryCoupon = MAIN_URL + '/coupon/myCoupon';
// 登录验证接口
const loginCheck = MAIN_URL + '/login/check';
// 首页票价查询接口
const indexTicketPrice = MAIN_URL + '/reserve/indexTicketPrice';
// 团队购票订单总金额
const collectiveTicketPrice = MAIN_URL + '/reserve/collectiveTicketPrice';
// 微信支付
const wxPay = MAIN_URL + '/reserve/wxPay';
// 订单统计接口
const orderStatistics = MAIN_URL + '/order/statistics';
// 登录接口
const loginUrl = MAIN_URL + '/login';
// 修改密码
const changePswUrl = MAIN_URL + '/login/changePsw';
// 注册接口
const registerUrl = MAIN_URL + '/register';
// 上传图片接口
const uploadImgUrl = MAIN_URL + '/register/uploadImg';
// 删除上传照片接口
const deleteImgUrl = MAIN_URL + '/register/deleteImg';
// 导游注册获取所有旅行社接口
const getAllTravelAgentUrl = MAIN_URL + '/register/allTravelAgent';
// 获取门票信息
const getTicketInfoUrl = MAIN_URL + '/reserve/getTicketInfo';
// 判断是不是预付费
const isPrepayUrl = MAIN_URL + '/reserve/isPrepay';
// 判断用户余额是否足够
const isBalanceEnoughUrl = MAIN_URL + '/reserve/isBalanceEnough';
// 旅行社余额支付接口
const paymentUrl = MAIN_URL + '/reserve/balancePay';
// 获取用户订单接口
const orderListUrl = MAIN_URL + '/order/userOrderList';
// 扫码验票 获取订单信息 
const SCAN_GET_ORDER = MAIN_URL + '/admin/getOrder';
// 扫码验票 订单通过
const SCAN_ORDER_PASS = MAIN_URL + '/admin/orderPass';
// 景区所有订单
const PLACE_ALL_ORDER = MAIN_URL + '/admin/placeAllOrder';
// 获取导游的归属旅行社
const GUIDE_GET_TRAVEL = MAIN_URL + '/travel/getInfo';
//获取验证码接口
const GET_CODE = MAIN_URL + '/register/sms';
//退款接口
const refund = MAIN_URL + '/reserve/refund';
// 获取导游列表  
const getGuide = MAIN_URL + '/order/getTravelGuide';
// 分配导游
const allowOrder = MAIN_URL + '/order/allowOrder';
// 结算列表
const settlement = MAIN_URL + '/settlement';
// 编辑保存
const registerEdit = MAIN_URL + '/register/edit';
// 编辑页面查询已有用户信息
const registerUserInfo = MAIN_URL + '/register/userInfo';
//获取导游来源旅行社名称
const getSource = MAIN_URL + '/reserve/getSource';

module.exports = {
  formatDate: formatDate,
  formatTime: formatTime,
  formatOrder: formatOrder,
  serviceTel: serviceTel,
  scenicId: scenicId,
  userInfo: userInfo,
  loginUrl: loginUrl,
  changePswUrl: changePswUrl,
  registerUrl: registerUrl,
  uploadImgUrl: uploadImgUrl,
  deleteImgUrl: deleteImgUrl,
  orderListUrl: orderListUrl,
  getAllTravelAgentUrl: getAllTravelAgentUrl,
  getTicketInfoUrl: getTicketInfoUrl,
  isPrepayUrl: isPrepayUrl,
  isBalanceEnoughUrl: isBalanceEnoughUrl,
  paymentUrl: paymentUrl,
  SCAN_GET_ORDER: SCAN_GET_ORDER,
  SCAN_ORDER_PASS: SCAN_ORDER_PASS,
  PLACE_ALL_ORDER: PLACE_ALL_ORDER,
  GUIDE_GET_TRAVEL: GUIDE_GET_TRAVEL,
  login: login,
  loginCheck: loginCheck,
  currentCoupon: currentCoupon,
  getCoupon: getCoupon,
  queryCoupon: queryCoupon,
  countdownFn: countdownFn,
  GET_CODE: GET_CODE,
  orderStatistics: orderStatistics,
  indexTicketPrice: indexTicketPrice,
  collectiveTicketPrice: collectiveTicketPrice,
  wxPay: wxPay,
  getGuide: getGuide,
  allowOrder: allowOrder,
  refund: refund,
  source: source,
  settlement: settlement,
  registerEdit: registerEdit,
  registerUserInfo: registerUserInfo,
  getSource: getSource,
}
