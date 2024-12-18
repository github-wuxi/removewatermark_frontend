const UTIL = require('../../utils/util.js');
const APP = getApp();

Component({
    data: {
        displayIndex: 1,
        pageNum: 1,
        pageSize: 4,
        records: [],
        hasNext: true
    },

    methods: {
        onLoad() {
            this.setData({
                displayIndex: 1,
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
                    this.setData({
                        records: res.data.resultData.videoList,
                        hasNext: res.data.resultData.hasNext
                    })
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
            let videoUrl = e.currentTarget.dataset.url;
            wx.getSetting({
                success: res => {
                    if (res.authSetting['scope.writePhotosAlbum']) {
                        this.downloadVideo(videoUrl);
                    } else {
                        wx.authorize({
                            scope: 'scope.writePhotosAlbum',
                            success: () => {
                                this.downloadVideo(videoUrl);
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
         * @param {*} originalVideoUrl 
         */
        downloadVideo(originalVideoUrl) {
            // let videoUrl = "https://www.ruirui.fun:443/removewatermark/download?url=" + originalVideoUrl;
            let videoUrl = "https://aweme.snssdk.com/aweme/v1/play/?video_id=v0300fg10000cshl3lqljhtcevrn1qjg&ratio=720p&line=0";
            let localFilePath = wx.env.USER_DATA_PATH + "/" + new Date().valueOf() + ".mp4";
            wx.showLoading({
                title: '保存中 0%'
            });
            const downloadTask = wx.downloadFile({
                url: videoUrl,
                filePath: localFilePath,
                header: {
                    'Content-Type': 'video/mp4'
                },
                success: res => {
                    wx.hideLoading();
                    wx.saveVideoToPhotosAlbum({
                        filePath: res.filePath,
                        success: () => {                         
                            wx.showToast({
                                title: '保存成功',
                                icon: 'success',
                                duration: 1500
                            });
                            // 删除本地文件
                            let fileMgr = wx.getFileSystemManager();
                            fileMgr.unlink({
                              filePath: localFilePath
                            });
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