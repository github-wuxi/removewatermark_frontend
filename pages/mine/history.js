const UTIL = require('../../utils/util.js');
const APP = getApp();

Component({
    data: {
        pageNum: 1,
        pageSize: 4,
        records: [],
        hasNext: true
    },

    methods: {
        onLoad() {
            this.setData({
                pageNum: 1,
                hasNext: true
            });
        },

        onShow() {
            this.queryRecords();
        },
        
        onReachBottom() {
            if (!this.data.hasNext) {
                return;
            }
            this.setData({
                pageNum: this.data.pageNum + 1
            })
            this.queryRecords();
        },

        /**
         * 预览封面
         * @param {*} e 
         */
        previewCover(e) {
            let currentUrl = e.currentTarget.dataset.src;
            wx.previewImage({
                current: currentUrl,
                urls: [currentUrl]
            });
        },

        /**
         * 查询解析记录
         */
        queryRecords() {
            if (!UTIL.isAlreadyLogin()) {
                wx.showToast({
                    title: '请先登录～',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }
            wx.showLoading({
                title: '加载中...',
            });
            APP.apiRequest({
                url: 'video/queryRecords.json',
                method: 'POST',
                contentType: 'application/json',
                data: {
                    pageNum: this.data.pageNum,
                    pageSize: this.data.pageSize,
                    userId: UTIL.fetchOpenId()
                },
                success: res => {
                    if (UTIL.isNull(res.data.resultData.videoList) || res.data.resultData.videoList.length <= 0) {
                        this.setData({
                            hasNext: false
                        });
                    } else {
                        this.setData({
                            records: this.data.records.concat(res.data.resultData.videoList),
                            hasNext: res.data.resultData.hasNext
                        });
                    }
                },
                complete: () => {
                    wx.hideLoading();
                }
            });
        },

        /**
         * 复制视频链接
         * @param {*} e
         */
        copyVideoUrl(e) {
            wx.setClipboardData({
                data: e.currentTarget.dataset.content,
                success: () => {
                    wx.showToast({
                        title: e.currentTarget.dataset.tip,
                        duration: 1200
                    });
                }
            });
        },
    
        /**
         * 校验并下载视频
         * @param {*} e 
         */
        checkAndDownloadVideo(e) {
            let videoId = e.currentTarget.dataset.videoid;
            wx.getSetting({
                success: res => {
                    if (res.authSetting['scope.writePhotosAlbum']) {
                        this.downloadVideo(videoId);
                    } else {
                        wx.authorize({
                            scope: 'scope.writePhotosAlbum',
                            success: () => {
                                this.downloadVideo(videoId);
                            },
                            fail: () => {
                                wx.showModal({
                                    title: '提示',
                                    content: '视频保存到相册需获取相册权限请允许开启权限',
                                    confirmText: '确认',
                                    cancelText: '取消',
                                    success: res => {
                                        if (res.confirm) {
                                            wx.openSetting();
                                        }
                                    }
                                })
                            }
                        })
                    }
                }
            })
        },

        /**
         * 视频下载
         */
        downloadVideo(videoId) {
            // 获取可以下载的视频地址
            APP.apiRequest({
                url: 'video/fetchDownloadUrl.json',
                method: 'POST',
                data: {
                    videoId: videoId
                },
                success: res => {
                    let videoDownloadUrl = res.data.resultData;
                    if (UTIL.isEmpty(videoDownloadUrl)) {
                        wx.showToast({
                            title: '视频下载失败，请重试~',
                            icon: 'none'
                        });
                        return;
                    }
                    this.doDownloadVideo(videoDownloadUrl);
                }
            });
        },

        /**
         * 执行视频下载
         * @param {*} videoDownloadUrl 
         */
        doDownloadVideo(videoDownloadUrl) {
            // 由后端nginx代理转发，不需要小程序后台配置很多合法下载链接域名
            let videoUrl = "https://www.ruirui.fun:443/removewatermark/download?url=" + videoDownloadUrl;
            // let localFilePath = wx.env.USER_DATA_PATH + "/" + new Date().valueOf() + ".mp4";
            wx.showLoading({
                title: '保存中 0%'
            });
            const downloadTask = wx.downloadFile({
                url: videoUrl,
                // filePath: localFilePath,
                header: {
                    'Content-Type': 'video/mp4'
                },
                success: res => {
                    wx.hideLoading();
                    wx.saveVideoToPhotosAlbum({
                        // filePath: res.filePath,
                        filePath: res.tempFilePath,
                        success: () => {
                            wx.showToast({
                                title: '保存成功',
                                icon: 'success',
                                duration: 1500
                            });
                            // 删除本地文件
                            // let fileMgr = wx.getFileSystemManager();
                            // fileMgr.unlink({
                            //   filePath: localFilePath
                            // });
                        },
                        fail: () => {
                            wx.showToast({
                                title: '保存失败',
                                icon: 'none',
                                duration: 1500
                            });
                        }
                    })
                },
                fail: () => {
                    wx.hideLoading();
                    wx.showToast({
                        title: '下载失败',
                        icon: 'none',
                        duration: 1500
                    });
                }
            });
            downloadTask.onProgressUpdate(res => {
                if (res.progress < 100) {
                    wx.showLoading({
                        title: '保存中 ' + res.progress + '%'
                    });
                }
            });
        }
    }
})