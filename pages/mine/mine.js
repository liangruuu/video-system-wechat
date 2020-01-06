const app = getApp()

Page({
  data: {
    active: 0,
    avatarUrl: "/resource/images/noneface.png",
    nickName: "",
    isLogin: app.globalData.isLogin,
    currentUserId: "",
    isUserSelf: true,
    isFollowed: false,

    myVideoList: [],
    myVideoPage: 1,
    collectVideoList: [],
    collectVideoPage: 1,
    followUserList: [],
    followUserPage: 1
  },
  onLoad: function() {},
  onShow: function() {
    this.loadUserInfo()
    this.setData({
      isLogin: app.globalData.isLogin
    })

    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },
  // changenameStatus: function() {
  //   let userInfo = app.getGlobalUserInfo()
  //   if (userInfo !== null && userInfo !== undefined && userInfo !== '') {
  //     this.setData({
  //       nickName: userInfo.nickname,
  //       isLogin: true
  //     })
  //   } else {
  //     this.setData({
  //       isLogin: false
  //     })
  //   }
  // },
  toLoginPage: function() {
    wx.navigateTo({
      url: '../login/login',
    })
  },
  logout: function() {
    let serverUrl = app.serverUrl
    let user = app.getGlobalUserInfo()
    let _this = this
    wx.showLoading({
      title: '请等待...',
    })
    wx.request({
      url: serverUrl + '/user/logout?userId=' + user.id,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        wx.hideLoading()
        app.setGlobalUserInfo(null)
        app.globalData.isLogin = false
        // 注销以后清空缓存
        wx.removeStorageSync("userInfo")
        _this.setData({
          avatarUrl: "/resource/images/noneface.png"
        })
        _this.onShow()
      }
    })
  },
  changeAvatar: function() {
    let _this = this
    if (this.data.isLogin) {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success(res) {
          // tempFilePath可以作为img标签的src属性显示图片
          const tempFilePaths = res.tempFilePaths
          const userInfo = app.getGlobalUserInfo()
          // 上传文件
          const serverUrl = app.serverUrl
          wx.showLoading({
            title: '上传中...',
          })
          wx.uploadFile({
            url: serverUrl + '/user/uploadavatar?userId=' + userInfo.id,
            filePath: tempFilePaths[0],
            name: 'file',
            success(res) {
              const data = JSON.parse(res.data)
              wx.hideLoading();
              if (data.status == "success") {
                wx.showToast({
                  title: '上传成功...',
                  icon: "success"
                })
                let imageUrl = data.data.obj
                _this.setData({
                  avatarUrl: serverUrl + imageUrl
                })
              } else {
                wx.showToast({
                  title: data.data.errMsg,
                  icon: "error"
                })
              }
            }
          })
        }
      })
    }
  },
  loadUserInfo: function() {
    let _this = this
    let userInfo = app.getGlobalUserInfo(),
      serverUrl = app.serverUrl,
      userId = userInfo.id,
      // 获取当前浏览的用户的ID,获取到就立即改变为自身Id
      currentUserId = app.globalData.currentUserId
    if (userInfo != "" && currentUserId != userInfo.id) {
      this.setData({
        isUserSelf: false,
        currentUserId: currentUserId
      })
      app.globalData.currentUserId = userInfo.id
    } else {
      this.setData({
        isUserSelf: true
      })
    }
    if (currentUserId != null && currentUserId != undefined && currentUserId != '') {
      userId = currentUserId
    }
    if (userInfo !== null && userInfo !== undefined && userInfo !== '') {
      wx.request({
        url: serverUrl + '/user/query?userId=' + userId + '&fanId=' + userInfo.id,
        method: 'POST',
        header: {
          'content-type': 'application/json',
          // 把验证信息都放在HEADER里,会比较安全且把验证信息和业务信息隔离开来
          'userId': userInfo.id,
          'userToken': userInfo.userToken
        },
        success: function(res) {
          console.log("res:", res.data)
          if (res.data.status === "success") {
            let userInfo = res.data.data
            let avatarUrl = "/resource/images/noneface.png"
            if (userInfo.avatar !== null && userInfo.avatar !== '' &&
              userInfo.avatar !== undefined) {
              avatarUrl = serverUrl + userInfo.avatar
            }
            _this.setData({
              avatarUrl: avatarUrl,
              fansCounts: userInfo.fansCounts,
              followCounts: userInfo.followCounts,
              receiveLikeCounts: userInfo.likeCounts,
              nickName: userInfo.nickname,
              isFollowed: userInfo.followed
            })
          }
        }
      })
    }
  },
  focus: function() {
    let user = app.getGlobalUserInfo(),
      userId = user.id,
      currentUserId = this.data.currentUserId,
      serverUrl = app.serverUrl,
      _this = this
    wx.request({
      url: `${serverUrl}/user/focus?userId=${currentUserId}&fanId=${userId}`,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function(res) {
        _this.setData({
          isFollowed: true
        })
      }
    })
  },
  unFocus: function() {
    let user = app.getGlobalUserInfo(),
      userId = user.id,
      currentUserId = this.data.currentUserId,
      serverUrl = app.serverUrl,
      _this = this
    wx.request({
      url: `${serverUrl}/user/unfocus?userId=${currentUserId}&fanId=${userId}`,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'headerUserId': user.id,
        'headerUserToken': user.userToken
      },
      success: function(res) {
        _this.setData({
          isFollowed: false
        })
      }
    })
  },
  onChange(event) {
    wx.showToast({
      title: `切换到标签 ${event.detail.name}`,
      icon: 'none'
    });
  }
})