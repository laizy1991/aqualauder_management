define(function(require, exports, module) {
    var dd = require('./dialog');  // 弹窗插件
    
    exports.ajax = function(url, type, data, callback) {
        var loading;
        $.ajax({
            url: url,
            type: type,
            data: data,
            beforeSend: function() {
                loading = dd.loading();
            },
            complete: function() {
                loading.close();
            },
            dataType: 'json',
            error: function() {
                dd.alert('网络异常');
            },
            success: callback
        });
    }
    
    exports.post = function(url, data, callback) {
        this.ajax(url, 'post', data, callback);
    };
    
    exports.get = function(url, callback) {
        this.ajax(url, 'get', null, callback);
    };
});