define(function(require, exports, module) {
    require('../../thirdParty/dialog');  // 弹窗插件
    
    /**
     * 确认框
     * @param {Object} msg
     * @param {Object} callback 确定后的回调操作
     */
    exports.confirm = function(msg, callback) {
        var noticeMsg = '<div class="dialog dialog-tips"><p class="text weak-text">'+ msg +'</p></div>';
        dialog({
            title: '提示',
            content: noticeMsg,
            button: [{
                value: '确定',
                autofocus: true,
                callback: callback
            },{
                value: '取消',
            }]
        }).showModal();
    };
    
    /**
     * 提示框
     * @param {Object} msg
     * @param {Object} callback 确定后的回调操作
     */
    exports.alert = function(msg, callback) {
        var noticeMsg = '<div class="dialog dialog-blacklist"><p class="text">'+ msg +'</p></div>';
        var setAdminConfirmDialog = dialog({
            title: '提示',
            content: noticeMsg,
            button: [{
                value: '确定',
                autofocus: true,
                callback: callback
            }]
        }).showModal();
    };
    
    /**
     * 加载中...
     */
    exports.loading = function() {
        return dialog().showModal();
    };
});