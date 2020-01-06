const app = getApp()

Page({
  data: {

  },
  doRegist: function(e) {
    let obj = e.detail.value;
    let username = obj.username;
    let password = obj.password;

    // 1. 简单验证
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
      wx.request({
        url: serverUrl + '/user/regist',
        method: 'POST',
        data: {
          username: username,
          password: password
        },
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          console.log(res.data)
          let status = res.data.status;
          // 等待后端处理
          wx.hideLoading();
          if (status == "success") {
            wx.showToast({
                title: '用户注册成功~~',
                icon: 'none',
                duration: 3000
              }),
              app.setGlobalUserInfo(res.data.data)
            wx.navigateTo({
              url: '../index/index',
            })
          } else if (status == "failed") {
            wx.showToast({
              title: res.data.data.errMsg,
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    }
  },
  goLoginPage: function() {
    wx.navigateTo({
      url: '../login/login',
    })
  },
  showglobalData: function() {}
})