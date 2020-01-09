//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    totalPage: 1,
    page: 1,
    videoList: [],
    serverUrl: "",
    searchContent: ""
  },
  onLoad: function() {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log("我加載了")
    let page = this.data.page
    let searchContent = app.globalData.searchName
    let isSaveRecord = app.globalData.isSaveRecord

    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0
    }
    this.setData({
      searchContent: searchContent
    })
    this.getVideoList(page, isSaveRecord)
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },
  // 跳转到SEARCH页面
  toSearchPage: function() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  // 获取视频列表信息
  getVideoList: function(page, isSaveRecord) {
    let _this = this
    let serverUrl = app.serverUrl
    let searchContent = this.data.searchContent
    console.log("searchContent:", searchContent)

    wx.request({
      url: serverUrl + '/video/showvideolist?page=' + page + '&isSaveRecord=' + isSaveRecord,
      method: 'POST',
      data: {
        videoName: searchContent,
      },
      success: function(res) {
        // wx.hideLoading()
        // 判断当前page是否是第一页，如果是第一页，那么设置videoList为空
        if (page == 1) {
          _this.setData({
            videoList: []
          })
        }
        let videoInfo = res.data.data
        console.log("videoInfo:", videoInfo)
        let videoList = videoInfo.rows
        let newVideoList = _this.data.videoList
        _this.setData({
          videoList: newVideoList.concat(videoList),
          page: page,
          totalPage: videoInfo.total,
          serverUrl: serverUrl
        })
      }
    })
  },
  // 当滑动到最底部时触发事件
  lower: function() {
    console.log("触发底部事件")
    let currentPage = this.data.page
    let totalPage = this.data.totalPage
    if (currentPage == totalPage) {
      wx.showToast({
        title: '已经没有视频了...',
        icon: 'none'
      })
      return;
    }
    let page = currentPage + 1
    this.getVideoList(page, 0)
  },
  refresh: function() {
    app.globalData.searchName = ""
    this.getVideoList(1, 0)
  },
  showVideoInfo: function(e) {
    let videoList = this.data.videoList
    let arrIndex = e.target.dataset.arrindex
    let videoInfo = JSON.stringify(videoList[arrIndex])

    wx.redirectTo({
      url: "../video-detail/video-detail?videoInfo=" + videoInfo
    })
  }
})