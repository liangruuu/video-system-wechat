const app = getApp()

Page({
  data: {},
  onLoad: function(params) {
    if (params.redirectUrl != undefined) {
      let redirectUrl = params.redirectUrl
      redirectUrl = redirectUrl.replace(/#/g, "?")
      redirectUrl = redirectUrl.replace(/@/g, "=")
      this.data.redirectUrl = redirectUrl
      console.log("redirectUrl:", redirectUrl)
    }
  },
  // 登录  
  doLogin: function(e) {
    let _this = this;
    let obj = e.detail.value;
    let username = obj.username;
    let password = obj.password;
    // 简单验证
    if (username.length == 0 || password.length == 0) {
      wx.showToast({
        title: '用户名或密码不能为空',
        icon: 'none',
        duration: 3000
      })
    } else {
      let serverUrl = app.serverUrl;
      // 等待后端处理
      wx.showLoading({
        title: '请等待...',
      });
      // 调用后端
      wx.request({
        url: serverUrl + '/user/login',
        method: "POST",
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          // 等待后端处理
          wx.hideLoading();
          if (res.data.status == "success") {
            // 登录成功跳转 
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000
            });
            let userInfo = res.data.data
            app.setGlobalUserInfo(userInfo)
            app.globalData.isLogin = true
            app.globalData.currentUserId = userInfo.id

            // 判断页面是否是从其他页面跳转过来的，若是则登录后返回原页面且保存原页面数据
            let redirectUrl = _this.data.redirectUrl
            if (redirectUrl != null && redirectUrl != undefined && redirectUrl != '') {
              wx.navigateTo({
                url: redirectUrl,
              })
            } else {
              // 页面跳转到个人主页
              wx.switchTab({
                url: '../mine/mine',
              })
            }
          } else if (res.data.status == 500) {
            // 失败弹出框
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 3000
            })
          }
        },
        fail: function(error) {
          console.log("error:", error)
        }
      })
    }
  },
  goRegistPage: function() {
    wx.navigateTo({
      url: '../regist/regist',
    })
  }
})