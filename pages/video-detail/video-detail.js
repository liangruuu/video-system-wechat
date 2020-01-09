// pages/video-detail/video-detail.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    videoId: "",
    videoSrc: "",
    videoInfo: {},
    videoInfoStr: "",
    serverUrl: app.serverUrl,
    /**
     * 把当前视频信息的数据保存起来,若用户没登录,
     * 则通过这个realUrl把参数保存起来,当注册成功跳转页面后的数据任然是当前视频的
     */
    realUrl: "",
    likeCounts: 0,
    collectCounts: 0,
    isLike: false,
    isCollect: false,
    isFollowed: false,
  },
  videoCtx: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(params) {
    this.videoCtx = wx.createVideoContext("video-container", this)
    console.log("我又加载了")

    // 获取上一个页面传过来的数据
    let videoInfo = JSON.parse(params.videoInfo)
    this.setData({
      videoId: videoInfo.id,
      videoSrc: app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
      likeCounts: videoInfo.likeCounts,
      collectCounts: videoInfo.collectCounts,
      videoInfoStr: params.videoInfo,
      /**
       * 因为JSON.parse解析会覆盖，所以把参数里的?和=换成#和@
       */
      realUrl: '../video-detail/video-detail#videoInfo@' + params.videoInfo
    })
    // this.getUserVideoRelation()
  },
  onShow: function(params) {
    this.videoCtx.play()
    this.getUserVideoRelation()
  },
  onHide: function() {
    this.videoCtx.stop()
  },
  onUnload: function() {
    wx.redirectTo({
      url: '../index/index'
    })
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
  likeVideoOrNot: function() {
    let user = app.getGlobalUserInfo()
    let videoInfo = this.data.videoInfo
    let serverUrl = app.serverUrl
    let isLike = this.data.isLike
    let urlParam = !isLike ? "like" : "unlike"
    let _this = this

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login?redirectUrl=' + this.data.realUrl,
      })
    } else {
      let url = `/video/${videoInfo.id}/${urlParam}?userId=` + user.id + '&createUserId=' + videoInfo.userId
      console.log("url:", url)
      wx.request({
        url: serverUrl + url,
        method: 'POST',
        header: {
          'content-type': 'application/json',
        },
        success: function(res) {
          let likeCounts = _this.data.likeCounts
          likeCounts = !isLike ? likeCounts + 1 : likeCounts - 1
          console.log("res:", res.data)
          _this.setData({
            isLike: !isLike,
            likeCounts: likeCounts
          })
        }
      })
    }
  },
  collectVideoOrNot: function() {
    let user = app.getGlobalUserInfo()
    let videoInfo = this.data.videoInfo
    let serverUrl = app.serverUrl
    let isCollect = this.data.isCollect
    let urlParam = !isCollect ? "collect" : "uncollect"
    let _this = this

    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login?redirectUrl=' + this.data.realUrl,
      })
    } else {
      let url = `/video/${videoInfo.id}/${urlParam}?userId=` + user.id + '&createUserId=' + videoInfo.userId
      console.log("url:", url)
      wx.request({
        url: serverUrl + url,
        method: 'POST',
        header: {
          'content-type': 'application/json',
        },
        success: function(res) {
          console.log("res:", res.data)
          let collectCounts = _this.data.collectCounts
          collectCounts = !isCollect ? collectCounts + 1 : collectCounts - 1
          _this.setData({
            isCollect: !isCollect,
            collectCounts: collectCounts
          })
        }
      })
    }
  },
  getUserVideoRelation: function() {
    let user = app.getGlobalUserInfo()
    let videoInfo = this.data.videoInfo,
      videoId = this.data.videoId,
      _this = this

    let userId = ''
    if (user != null && user != undefined && user != '') {
      userId = user.id
    }
    wx.request({
      url: `${this.data.serverUrl}/video/${videoId}?userId=${userId}&createUserId=${videoInfo.userId}`,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log("res.data:", res.data)
        let userLikeVideo = res.data.data.userLikeVideo,
          userCollectVideo = res.data.data.userCollectVideo,
          userFollowed = res.data.data.userFollowed
        _this.setData({
          isLike: userLikeVideo,
          isCollect: userCollectVideo,
          isFollowed: userFollowed
        })
      }
    })
  },
  showCreateUser: function() {
    console.log("click...")
    let user = app.getGlobalUserInfo(),
      videoInfo = this.data.videoInfo,
      realUrl = this.data.realUrl
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: `../login/login?redirectUrl=${realUrl}`,
      })
    } else {
      app.globalData.currentUserId = videoInfo.userId
      wx.switchTab({
        url: '../mine/mine',
      })
    }
  },
  addBrowseCount: function() {
    wx.request({
      url: this.data.serverUrl + '/video/addbrowsecounts?' + 'videoId=' + this.data.videoId,
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log("count+1:", res.data)
      }
    })
  }
})