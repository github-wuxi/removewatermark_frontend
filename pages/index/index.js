const APP = getApp()
const UTIL = require('../../utils/util.js');

Page({
    data: {
        videoUrl: 'https://v.douyin.com/'
    },

    onShow() {
        wx.getClipboardData({
            success: res => {
                let str = res.data.trim();
                let history = this.data.videoUrl.trim();
                if (this.regUrl(str) && str != history) {
                    wx.showModal({
                        title: '检测到剪切板有链接，是否自动填入？',
                        success: res => {
                            if (res.confirm) {
                                this.setData({
                                    videoUrl: str
                                })
                            }
                        }
                    })
                }
            }
        })
    },

    inputClear() {
        this.setData({
            videoUrl: ''
        })
    },

    regUrl(t) {
        return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(t)
    },

    submit: function() {
        if (!UTIL.isAlreadyLogin()) {
            wx.showToast({
                title: '请先登录～',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        this.parseVideo();

    //   wx.showToast({
    //     title: '免费解析次数已用完！',
    //     icon: 'none'
    //   })




      // // 超免费次数需要观看激励广告
      // wx.showModal({
      //   title: "解析视频",
      //   content: "免费解析次数已用完，需观看完广告才可继续解析！",
      //   confirmColor: "#00B269",
      //   cancelColor: "#858585",
      //   success: (res) => {
      //     if (res.confirm) {
      //       videoAd.show().catch(() => {
      //         // 失败重试
      //         videoAd.load()
      //           .then(() => videoAd.show())
      //           .catch(err => {
      //             console.log('激励视频 广告显示失败')
      //           })
      //       })
      //     } else if (res.cancel) {
      //       wx.showToast({
      //         title: '广告观看完才可继续解析！',
      //         icon: 'none'
      //       })
      //     }
      //   }
      // })
  },

    parseVideo: function () {
        APP.apiRequest({
            url: 'video/parseVideo.json',
            method: 'POST',
            data: {
                url: this.data.videoUrl,
                userId: UTIL.fetchOpenId()
            },
            success: () => {
                wx.navigateTo({
                    url: "/pages/mine/history"
                });
            }
    })
  }
})
