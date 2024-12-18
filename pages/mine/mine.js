const UTIL = require('../../utils/util.js');
const APP = getApp();

Component({
    data: {
        availableNumber: '--',
        parsedNumber: '--',
        userInfo: null
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onShow() {
            if (!UTIL.isAlreadyLogin()) {
                return;
            }
            this.setData({
                userInfo: UTIL.fetchUserInfo()
            });
            APP.apiRequest({
                url: 'user/queryBizInfo.json',
                method: 'POST',
                data: {
                    userId: UTIL.fetchOpenId()
                },
                success: res => {
                    if (!UTIL.isNull(res)) {
                        this.setData({
                            availableNumber: res.data.resultData.availableNumber,
                            parsedNumber: res.data.resultData.parsedNumber
                        })
                    }
                }
            });
        },

        /**
         * 授权登录
         */
        authorizedLogin(e) {
            console.log("authorizedLogin");
            console.log(e);
            if (e.detail.errMsg != 'getUserInfo:ok') {
                wx.showToast({
                    title: '未授权，登录失败',
                    icon: 'none'
                });
                return false;
            }
            wx.showLoading({
                title: "正在登录",
                mask: true
            });
            // 登录
            APP.userLogin(() => {
                this.onShow();
                wx.hideLoading();
            });
        },

        /**
         * 展示客服照片
         */
        showCustomerImage() {
            const image = 'https://mdn.alipayobjects.com/huamei_jfklky/afts/img/A*dvWcRZqYOaoAAAAAAAAAAAAADqKkAQ/original';
            wx.previewImage({
                current: image,
                urls: [image]
            });
        },

        /**
         * 展示赞赏照片
         */
        showRewardImage() {
            const image = 'https://mdn.alipayobjects.com/huamei_jfklky/afts/img/A*HIJ2QZOVgE8AAAAAAAAAAAAADqKkAQ/original';
            wx.previewImage({
                current: image,
                urls: [image]
            });
        },

        /**
         * 分享小程序
         */
        onShareAppMessage() {
            return {
                title: '推荐一款超好用的短视频水印一键清理宝工具，赶快试试吧～',
                path: '/pages/index/index',
                imageUrl: '/images/share.jpg',
                success: () => {
                    wx.showToast({
                        title: "分享成功",
                        icon: "success",
                        duration: 1500
                    });
                },
                fail: () => {
                    wx.showToast({
                        title: "分享失败，请重试",
                        icon: "none",
                        duration: 1500
                    });
                }
            }
        },
    }
})