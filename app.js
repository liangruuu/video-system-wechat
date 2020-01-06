//app.js
App({
  serverUrl: "http://127.0.0.1:8081",
  globalData: {
    userInfo: null,
    isLogin: false,
    currentUserId: ""
  },
  // 把用户信息保存到本地缓存 
  setGlobalUserInfo: function(user) {
    wx.setStorageSync("userInfo", user)
  },
  getGlobalUserInfo: function() {
    return wx.getStorageSync("userInfo")
  }
})