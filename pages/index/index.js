const APP = getApp()
const UTIL = require('../../utils/util.js');
const AD_REWARD_NUM = 2;
let rewardedVideoAd = null;

Page({
    data: {
        videoUrl: 'https://v.douyin.com/'
    },

    onLoad() {
        // 激励广告
        if(wx.createRewardedVideoAd){
            rewardedVideoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-492966e7a80497b8'
            });
            rewardedVideoAd.onError(err => {});
            rewardedVideoAd.onClose(res => {
                if (res && res.isEnded) {
                    // 用户完整观看了视频，给予激励
                    APP.apiRequest({
                        url: 'user/reward.json',
                        method: 'POST',
                        data: {
                            userId: UTIL.fetchOpenId(),
                            rewardNum: AD_REWARD_NUM
                        },
                        success: () => {
                            wx.showToast({
                                title: '已获取' + AD_REWARD_NUM + '次解析次数',
                                icon: 'none'
                            });
                        },
                        fail: () => {
                            wx.showToast({
                                title: '系统异常，请重试~',
                                icon: 'none'
                            });
                        }
                    });
                } else {
                    wx.showToast({
                        title: '未完整观看广告，无法获得奖励',
                        icon: 'none'
                    });
                }
            });
        };
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
            content: '观看完广告可获取' + AD_REWARD_NUM + '次解析次数',
            confirmColor: "#00B269",
            cancelColor: "#858585",
            success: res => {
                if (res.confirm) {
                    rewardedVideoAd.show().catch(() => {
                        // 如果广告未加载成功，重新加载
                        rewardedVideoAd.load().then(() => {
                            rewardedVideoAd.show();
                        }).catch(() => {
                            wx.showToast({
                                title: '广告加载失败，请稍后重试~',
                                icon: 'none'
                            });
                        });
                    });
                }
            }
        });
    }
})
