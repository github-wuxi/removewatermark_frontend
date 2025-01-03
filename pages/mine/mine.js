const UTIL = require('../../utils/util.js');
const APP = getApp();

Component({
    data: {
        availableNumber: '--',
        parsedNumber: '--',
        avatarUrl: null,
        nickName: null
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onShow() {
            if (!UTIL.isAlreadyLogin()) {
                return;
            }
            APP.apiRequest({
                url: 'user/queryUserInfo.json',
                method: 'POST',
                data: {
                    userId: UTIL.fetchOpenId()
                },
                success: res => {
                    if (!UTIL.isNull(res)) {
                        this.setData({
                            availableNumber: res.data.resultData.availableNumber,
                            parsedNumber: res.data.resultData.parsedNumber,
                            avatarUrl: res.data.resultData.userAvatar,
                            nickName: res.data.resultData.userName
                        });
                    }
                }
            });
        },

        /**
         * 更新头像
         * @param {*} e 
         */
        onChooseAvatar(e) {
            if (!UTIL.isAlreadyLogin()) {
                wx.showToast({
                    title: '登陆失败，请重新进入小程序~',
                    icon: 'none'
                });
            }
            let tempAvatarUrl = e.detail.avatarUrl;
            if (UTIL.isEmpty(tempAvatarUrl)) {
                wx.showToast({
                    title: '头像为空，请重新更新~',
                    icon: 'none'
                });
            }
            var avatarUrlBase64 = wx.getFileSystemManager().readFileSync(tempAvatarUrl, 'base64');
            APP.apiRequest({
                url: 'user/uploadUserAvatar.json',
                method: 'POST',
                data: {
                    userId: UTIL.fetchOpenId(),
                    avatarUrlBase64: avatarUrlBase64
                },
                success: res => {
                    if (!UTIL.isEmpty(res.data.resultData)) {
                        this.setData({
                            avatarUrl : res.data.resultData
                        });
                        return;
                    }
                    wx.showToast({
                        title: '头像更新失败，请重新更新~',
                        icon: 'none'
                    });
                }
            });
        },

        /**
         * 更新昵称
         * @param {*} e 
         */
        onInputNickname(e) {
            if (!UTIL.isAlreadyLogin()) {
                wx.showToast({
                    title: '登陆失败，请重新进入小程序~',
                    icon: 'none'
                });
            }
            let nickName = e.detail.value;
            if (UTIL.isEmpty(nickName)) {
                wx.showToast({
                    title: '昵称为空，请重新更新~',
                    icon: 'none'
                });
            }
            this.setData({
                nickName : nickName
            });
            APP.apiRequest({
                url: 'user/updateUserInfo.json',
                method: 'POST',
                data: {
                    userId: UTIL.fetchOpenId(),
                    userName: nickName
                }
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