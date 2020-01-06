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
    isLike: false,
    isCollect: false
  },
  videoCtx: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(params) {
    this.videoCtx = wx.createVideoContext("video-container", this)

    // 获取上一个页面传过来的数据
    let videoInfo = JSON.parse(params.videoInfo)
    this.setData({
      videoId: videoInfo.id,
      videoSrc: app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
      videoInfoStr: params.videoInfo,
      /**
       * 因为JSON.parse解析会覆盖，所以把参数里的?和=换成#和@
       */
      realUrl: '../video-detail/video-detail#videoInfo@' + params.videoInfo
    })
    this.getUserVideoRelation()
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
    let user = app.getGlobalUserInfo()
    // // 相对于login.js文件的路径
    // let videoInfo = JSON.stringify(this.data.videoInfo)
    // // 因为JSON.parse解析会覆盖，所以把参数里的?和=换成#和@
    // let realUrl = '../video-detail/video-detail#videoInfo@' + videoInfo
    if (user == null || user == undefined || user == '') {
      wx.navigateTo({
        url: '../login/login?redirectUrl=' + this.data.realUrl,
      })
    } else {
      console.log("关注了~")
    }
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
          console.log("res:", res.data)
          _this.setData({
            isLike: !isLike
          })
        }
      })
    }
  },
  collectVideoOrNot: function() {
    let user = app.getGlobalUserInfo()
    let videoInfo = this.data.videoInfo
    let serverUrl = app.serverUrl
    let isCollect = this.data.isLike
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
          _this.setData({
            isCollect: !isCollect
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
          userCollectVideo = res.data.data.userCollectVideo
        _this.setData({
          isLike: userLikeVideo
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
  }
})