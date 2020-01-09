const app = getApp()

Page({
  data: {
    active: 0,
    avatarUrl: "/resource/images/noneface.png",
    nickName: "",
    isLogin: app.globalData.isLogin,
    currentUserId: "",
    serverUrl: app.serverUrl,
    isUserSelf: true,
    isFollowed: false,

    myVideoList: [],
    myVideoPage: 1,
    myVideoTotal: 1,

    collectVideoList: [],
    collectVideoPage: 1,
    collectVideoTotal: 1,

    followUserList: [],
    followUserPage: 1,
    followUserTotal: 1,
  },
  onLoad: function() {},
  onShow: function() {
    this.loadUserInfo()
    this.setData({
      isLogin: app.globalData.isLogin
    })
    if (this.data.isLogin) {
      this.getMyVideoList(1)
    }

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
  getMyCollectList: function(page) {
    let userId = this.data.currentUserId,
      serverUrl = app.serverUrl,
      _this = this
    wx.showLoading({
      title: '加载中...'
    })
    wx.request({
      url: serverUrl + '/video/collectvideolist?userId=' + userId + '&page=' + page,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res.data)
        wx.hideLoading()
        // 判断当前page是否是第一页，如果是第一页，那么设置videoList为空
        if (page == 1) {
          _this.setData({
            collectVideoList: []
          })
        }
        let collectVideoList = res.data.data.rows,
          newCollectVideoList = _this.data.collectVideoList
        _this.setData({
          collectVideoPage: page,
          collectVideoList: newCollectVideoList.concat(collectVideoList),
          collectVideoTotal: res.data.data.total,
        });
      }
    })
  },
  getMyVideoList: function(page) {
    let serverUrl = this.data.serverUrl,
      _this = this
    wx.showLoading({
      title: '加载中...'
    })
    wx.request({
      url: serverUrl + '/video/showvideolist?page=' + page + '&pageSize=8',
      method: 'POST',
      data: {
        userId: app.globalData.currentUserId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log("myVideoList:", res.data)
        wx.hideLoading()
        // 判断当前page是否是第一页，如果是第一页，那么设置videoList为空
        if (page == 1) {
          _this.setData({
            myVideoList: []
          })
        }
        let myVideoList = res.data.data.rows,
          newVideoList = _this.data.myVideoList
        _this.setData({
          myVideoPage: page,
          myVideoList: newVideoList.concat(myVideoList),
          myVideoTotal: res.data.data.total,
        });
        console.log("_this.data", _this.data)
      }
    })
  },
  getMyFollowList: function(page) {
    let serverUrl = this.data.serverUrl,
      userId = app.globalData.currentUserId,
      _this = this
    wx.showLoading({
      title: '加载中...'
    })
    wx.request({
      url: serverUrl + '/video/showfollowusers?userId=' + userId,
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        console.log("followUserList:", res.data)
        wx.hideLoading()
        // 判断当前page是否是第一页，如果是第一页，那么设置videoList为空
        if (page == 1) {
          _this.setData({
            followUserList: []
          })
        }
        let followUserList = res.data.data.rows,
          newFollowUserList = _this.data.followUserList
        _this.setData({
          followUserPage: page,
          followUserList: newFollowUserList.concat(followUserList),
          followUserTotal: res.data.data.total,
        });
      }
    })
  },
  lower: function() {
    let currentPage = this.data.myVideoPage,
      totalPage = this.data.myVideoTotal,
      page = 1
    switch (this.data.active) {
      case 0:
        currentPage = this.data.myVideoPage
        totalPage = this.data.myVideoTotal
        if (currentPage == totalPage) {
          wx.showToast({
            title: '已经没有视频了~',
            icon: 'none'
          })
          return;
        }
        this.getMyVideoList(page + 1)
        break;
      case 1:
        currentPage = this.data.collectVideoPage
        totalPage = this.data.collectVideoTotal
        if (currentPage == totalPage) {
          wx.showToast({
            title: '已经没有视频了~',
            icon: 'none'
          })
          return;
        }
        this.getMyCollectList(page + 1)
        break;
      case 2:
        currentPage = this.data.followUserPage
        totalPage = this.data.followUserTotal
        if (currentPage == totalPage) {
          wx.showToast({
            title: '已经没有关注者了~',
            icon: 'none'
          })
          return;
        }
        this.getMyFollowList(page + 1)
        break;
    }
  },
  showVideoInfo: function(e) {
    let videoList = []
    switch (this.data.active) {
      case 0:
        videoList = this.data.myVideoList
        break;
      case 1:
        videoList = this.data.collectVideoList
        break;
    }
    let arrIndex = e.target.dataset.arrIndex,
      videoInfo = JSON.stringify(videoList[arrIndex])
    wx.navigateTo({
      url: '../video-detail/video-detail?videoInfo=' + videoInfo,
    })
  }
})