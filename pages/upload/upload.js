// pages/upload/upload.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnDisable: true,
    serverUrl: "",
    songList: [],
    videoParams: {
      desc: ""
    }
  },
  onLoad: function() {
    this.showBgmList()
  },
  showBgmList: function() {
    let _this = this
    wx.showLoading({
      title: '请等待...',
    })
    let serverUrl = app.serverUrl
    // 申请调用所有BGM信息接口
    wx.request({
      url: serverUrl + '/bgm/list',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        wx.hideLoading()
        console.log("show bgmList:", res.data)
        let songList = res.data.data
        _this.setData({
          songList: songList,
          serverUrl: serverUrl
        })
      }
    })
  },
  chooseVideo: function() {
    let _this = this
    let videoParams = this.data.videoParams
    let btnDisable = this.data.btnDisable
    console.log("videoParams:", videoParams)
    wx.chooseVideo({
      sourceType: ['album'],
      success: function(res) {
        console.log("res:", res)
        videoParams.dutation = res.duration
        videoParams.height = res.height
        videoParams.width = res.width
        videoParams.tempFilePath = res.tempFilePath
        videoParams.thumbTempFilePath = res.thumbTempFilePath
        // 监听input框的值用来设置按钮的DISABLE值
        btnDisable = (_this.data.videoParams.name == "") ? true : false,
          _this.setData({
            videoParams: videoParams,
            btnDisable: btnDisable
          })
      },
    })
  },
  upload: function(e) {
    let _this = this
    let bgmId = e.detail.value.bgmId,
      desc = e.detail.value.desc,
      videoName = this.data.videoParams.name,
      duration = this.data.videoParams.dutation,
      tmpHeight = this.data.videoParams.height,
      tmpWidth = this.data.videoParams.width,
      tmpvideoUrl = this.data.videoParams.tempFilePath,
      tmpcoverUrl = this.data.videoParams.thumbTempFilePath

    // 上传视频
    wx.showLoading({
      title: '上传中...'
    })
    let serverUrl = app.serverUrl
    wx.uploadFile({
      url: serverUrl + '/video/upload',
      filePath: tmpvideoUrl,
      formData: {
        // app.userInfo.id
        userId: app.getGlobalUserInfo().id,
        bgmId,
        videoName: videoName,
        desc,
        videoSeconds: duration,
        videoHeight: tmpHeight,
        videoWidth: tmpWidth,
      },
      header: {
        'content-type': 'application/json'
      },
      name: 'file',
      success: function(res) {
        let data = JSON.parse(res.data)
        wx.hideLoading()
        console.log("upload return:", data)
        wx.showToast({
          title: '上传成功...',
          icon: 'success',
          duration: 2000,
          success: function() {
            // 页面跳转到个人主页
            wx.switchTab({
              url: '../index/index',
            })
          }
        })
        // 因为在手机端封面信息获取不到所以重新选择方法
        // let videoId = data.data.obj
        // wx.uploadFile({
        //   url: serverUrl + '/video/uploadcover',
        //   formData: {
        //     userId: app.userInfo.id,
        //     videoId: videoId
        //   },
        //   filePath: tmpcoverUrl,
        //   name: 'file',
        //   header: {
        //     'content-type': 'application/json'
        //   }
        // })
      }
    })
  },
  getvideoDesc: function(e) {
    let videoParams = this.data.videoParams
    videoParams.videodesc = e.detail.value
    this.setData({
      videoParams: videoParams
    })
  },
  reset: function(e) {
    console.log("viedeoParams:", this.data.videoParams)
  },
  // 监听input框的值用来设置按钮的DISABLE值
  inputWatch: function(e) {
    let btnDisable = this.data.btnDisable
    let videoParams = this.data.videoParams
    console.log(this.data.videoParams.tempFilePath)
    btnDisable = (e.detail.value == "" || this.data.videoParams.tempFilePath == undefined) ? true : false
    videoParams.name = e.detail.value
    this.setData({
      btnDisable: btnDisable,
      videoParams: videoParams
    })
  }
})