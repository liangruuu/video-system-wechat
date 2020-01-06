const app = getApp();
Component({

  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/pages/index/index",
      iconPath: "/resource/images/icon_component.png",
      selectedIconPath: "/resource/images/icon_component_HL.png",
      text: "首页",
      isSpecial: false
    }, {
      pagePath: "",
      iconPath: "/resource/images/icon_release.png",
      selectedIconPath: "/resource/images/icon_release.png",
      text: "",
      isSpecial: true
    }, {
      pagePath: "/pages/mine/mine",
      iconPath: "/resource/images/icon_API.png",
      selectedIconPath: "/resource/images/icon_API_HL.png",
      text: "我的",
      isSpecial: false
    }]
  },
  attached() {},
  methods: {
    switchTab(e) {
      const dataset = e.currentTarget.dataset
      const path = dataset.path
      const index = dataset.index
      //如果是特殊跳转界面(底部拍摄或者上传选项)
      if (this.data.list[index].isSpecial) {
        //弹出底部选项栏
        this.showActionSheet()
        console.log("Special")
      } else {
        //正常的tabbar切换界面
        console.log("path:" + path)
        wx.switchTab({
          url: path
        })
        this.setData({
          selected: index
        })
      }
    },
    upLoadfile: function() {
      let _this = this
      wx.chooseVideo({
        sourceType: ['album'],
        success: function(res) {
          console.log("res:", res)
        }
      })
    },
    showActionSheet: function() {
      let _this = this
      wx.showActionSheet({
        itemList: ['上传', '拍摄'],
        success(res) {
          if (res.tapIndex == 0) {
            // 若用户未登录则进行拦截处理重定向到登录界面
            const userInfo = app.getGlobalUserInfo()
            if (userInfo == null || userInfo == undefined || userInfo == '') {
              wx.navigateTo({
                url: '/pages/login/login',
              })
            }
            wx.navigateTo({
              url: '../upload/upload',
              fail: function(err) {
                console.log("err:", err)
              }
            })
          } else if (res.tapIndex == 1) {
            _this.upLoadfile()
          }
        }
      })
    }
  }
})