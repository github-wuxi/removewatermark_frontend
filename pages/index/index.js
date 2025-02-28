const APP = getApp()
const UTIL = require('../../utils/util.js');
const AD_REWARD_NUM = 2;
let rewardedVideoAd = null;

Page({
    data: {
        videoUrl: 'https://v.douyin.com/'
    },

    onLoad() {
        rewardedVideoAd = APP.createRewardedAdInstance('adunit-492966e7a80497b8', AD_REWARD_NUM);
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
            },
            fail: res => {
                if (res.data.errorCode == 'NONE_AVAILABLE_PARSE_COUNT') {
                    this.guideShowRewardedVideoAd();
                } else {
                    wx.showToast({
                        title: res.data.errorMsg,
                        icon: 'none'
                    });
                }
            }
        });
    },
    
    /**
     * 引导展示激励广告
     */
    guideShowRewardedVideoAd: function () {
        wx.showModal({
            title: '可用解析次数不足',
            content: '观看广告可获取' + AD_REWARD_NUM + '次解析次数',
            confirmColor: "#00B269",
            cancelColor: "#858585",
            success: res => {
                if (res.confirm) {
                    APP.showRewardedAd(rewardedVideoAd);
                }
            }
        });
    }
})
