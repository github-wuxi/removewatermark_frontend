const UTIL = require('./utils/util.js');
App({
    onLaunch() {
	    this.userLogin();
    },
    
    /**
     * 用户登录
     */
    userLogin() {
        wx.login({
            success: res => {
                // 临时code，需要调用服务端获取用户唯一的openId
                this.signInAndSaveOpenId(res.code);
            },
            fail: () => {
                wx.showToast({
                    title: '登陆失败，请重新进入小程序~',
                    icon: 'none'
                });
            }
        });
    },

    /**
     * 跳转个人页去授权登录
     */
    jumpPersonalToLogin() {
        wx.switchTab({
            url: '/pages/mine/mine'
        });
    },

    /**
     * 签到和保存用户开放id
     */
    signInAndSaveOpenId(code) {
        // 调用后端登录接口，即签到
        this.apiRequest({
            url: 'user/login.json',
            method: 'POST',
            data: {
                code: code
            },
            success: res => {
                if (!UTIL.isEmpty(res.data.resultData.todayFirstTimeLoginText)) {
                    wx.showToast({
                        title: res.data.resultData.todayFirstTimeLoginText,
                        icon: 'none',
                        duration: 3000
                    });
                }
                UTIL.saveOpenId(res.data.resultData.openId);
            },
            fail: () => {
                UTIL.saveOpenId(null);
            }
        });
    },

    /**
     * 创建激励广告实例
     */
    createRewardedAdInstance(adUnitId, rewardNum, options) {
        let instance = null;
        if (wx.createRewardedVideoAd) {
            instance = wx.createRewardedVideoAd({
                adUnitId: adUnitId
            });
            instance.onError(err => {});
            instance.onClose(res => {
                if (res && res.isEnded) {
                    // 用户完整观看了视频，给予激励
                    this.apiRequest({
                        url: 'user/reward.json',
                        method: 'POST',
                        data: {
                            userId: UTIL.fetchOpenId(),
                            rewardNum: rewardNum
                        },
                        success: () => {
                            wx.showToast({
                                title: '已获取' + rewardNum +'次解析次数',
                                icon: 'none'
                            });
                            if (options) {
                                options();
                            }
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
        return instance;
    },

    /**
    * 展示短激励广告
    */
    showRewardedAd(instance) {
        if (!instance) {
            return;
        }
        instance.show().catch(() => {
            // 如果广告未加载成功，重新加载
            instance.load().then(() => {
                instance.show();
            }).catch(() => {
                wx.showToast({
                    title: '广告加载失败，请稍后重试~',
                    icon: 'none'
                });
            });
        });
    },

    /**
     * http请求，与服务端通信
     * @param {*} options 
     */
    apiRequest(options) {
        wx.request({
            url: 'https://www.ruirui.fun:19708/removewatermark/' + options.url,
            method: options.method ? options.method : 'GET',
            header: {
                'content-type': options.contentType ? options.contentType : 'application/x-www-form-urlencoded'
            },
            dataType: 'json',
            data: options.data,
            success: res => {
                switch (res.statusCode) {
                    case 200:
                        if (res.data.success) {
                            if (options.success) {
                                options.success(res);
                            }
                        } else {
                            if (options.fail) {
                                options.fail(res);
                            } else {
                                wx.showToast({
                                    title: res.data.errorMsg,
                                    icon: 'none',
                                    duration: 1200
                                });
                            }                         
                        }
                    break;
                    case 401:
                        this.jumpPersonalToLogin();
                    break;
                    case 422:
                        break;
                    case 404:
                        wx.showToast({
                            title: '请求地址不存在',
                            icon: 'none'
                        });
                    break;
                    default:
                        wx.showToast({
                            title: '出错了～请联系客服解决',
                            icon: 'none'
                        });
                }
            },
            fail: res => {
                if (options.fail) {
                    options.fail(res);
                }
            },
            complete: res => {
                if (options.complete) {
                    options.complete(res);
                }
            }
        });
    },

});
