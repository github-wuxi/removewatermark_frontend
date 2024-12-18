const UTIL = require('./utils/util.js');
App({
    onLaunch() {
	    this.userLogin();
    },
    
    /**
     * 用户登录
     */
    userLogin(callback = null) {
        console.log("userLogin" + callback);
        wx.login({
            success: res => {
                console.log("wx.login");
                console.log(res);
                // 临时code，需要调用服务端获取openId
                var code = res.code;
                wx.getSetting({
                    success: res => {
                        console.log("wx.getSetting");
                        console.log(res);
                        if (res.authSetting['scope.userInfo']) {
                            // 已经授权查询用户信息
                            wx.getUserInfo({
                                success: res => {
                                    console.log("wx.getUserInfo");
                                    console.log(res);
                                    UTIL.saveUserInfo(res.userInfo);
                                    this.signInAndSaveOpenId(code, res.userInfo.nickName, res.userInfo.avatarUrl, callback);
                                }
                            })
                        } else {
                            this.jumpPersonalToLogin();
                        }
                    }
                })
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
    signInAndSaveOpenId(code, nickName, avatarUrl, callback) {
        // 调用后端登录接口，即签到
        this.apiRequest({
            url: 'user/login.json',
            method: 'POST',
            data: {
                code: code,
                nickName: nickName,
                avatarUrl: avatarUrl
            },
            success: res => {
                console.log("signInAndSaveOpenId");
                console.log(res);
                if (!UTIL.isEmpty(res.data.resultData.todayFirstTimeLoginText)) {
                    wx.showToast({
                        title: res.data.resultData.todayFirstTimeLoginText,
                        icon: 'none',
                        duration: 3000
                    });
                }
                UTIL.saveOpenId(res.data.resultData.openId);
                callback && callback();
            }
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
                console.log("apiRequest success");
                console.log(res);
                switch (res.statusCode) {
                    case 200:
                        if (res.data.success) {
                            options.success(res);
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
                console.log("apiRequest fail");
                console.log(res);
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
