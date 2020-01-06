// pages/search/search.js
var WxSearch = require('../wxSearchView/wxSearchView.js');
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {

    // 2 搜索栏初始化
    var that = this;

    // 查询热搜词
    let serverUrl = app.serverUrl
    wx.request({
      url: serverUrl + '/video/hot',
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log("hotRecords:", res)
        let hotList = res.data.data

        WxSearch.init(
          that, // 本页面一个引用,
          hotList,
          hotList, // 热点搜索推荐，[]表示不使用
          that.mySearchFunction, // 提供一个搜索回调函数
          that.myGobackFunction //提供一个返回回调函数
        );
      }
    })
  },

  // 3 转发函数，固定部分，直接拷贝即可
  wxSearchInput: WxSearch.wxSearchInput, // 输入变化时的操作
  wxSearchKeyTap: WxSearch.wxSearchKeyTap, // 点击提示或者关键字、历史记录时的操作
  wxSearchDeleteAll: WxSearch.wxSearchDeleteAll, // 删除所有的历史记录
  wxSearchConfirm: WxSearch.wxSearchConfirm, // 搜索函数
  wxSearchClear: WxSearch.wxSearchClear, // 清空函数

  // 4 搜索回调函数  
  mySearchFunction: function(value) {
    // do your job here
    // 示例：跳转
    console.log("enter...")
    // wx.switchTab不支持路径传参
    app.globalData.searchName = value
    app.globalData.isSaveRecord = 1
    wx.switchTab({
      url: '../index/index',
      // success: function(e) {
      //   var page = getCurrentPages().pop();
      //   if (page == undefined || page == null) return;
      //   page.onLoad();
      // }
    })
  },

  // 5 返回回调函数
  myGobackFunction: function() {
    // do your job here
    // 示例：返回
    app.globalData.searchName = ""
    wx.switchTab({
      url: '../index/index'
    })
  }
})