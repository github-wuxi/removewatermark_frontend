const CACHE_OPEN_ID = "openId";

/**
 * 字符串是否为空，true代表空
 * @param {*} str 
 */
function isEmpty(str) {
    return (typeof str == "undefined" || str == null || str == "");
}

/**
 * 对象是否为空，true代表空
 * @param {*} obj 
 */
function isNull(obj) {
    return Object.keys(obj).length == 0;
}

/**
 * 是否已经登录，true代表是
 */
function isAlreadyLogin() {
    return !isEmpty(wx.getStorageSync(CACHE_OPEN_ID));
}

/**
 * 获取openId
 */
function fetchOpenId() {
    return wx.getStorageSync(CACHE_OPEN_ID);
}

/**
 * 存储openId
 * @param {*} openId 
 */
function saveOpenId(openId) {
    if (!isEmpty(openId)) {
        wx.setStorageSync(CACHE_OPEN_ID, openId);
    }
}

module.exports = {
    isEmpty: isEmpty,
    isNull: isNull,
    isAlreadyLogin: isAlreadyLogin,
    fetchOpenId: fetchOpenId,
    saveOpenId: saveOpenId,
}
