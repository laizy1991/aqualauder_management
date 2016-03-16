define(function(require, exports, module) {

    /**
     * 设置cookie
     * @param {Object} name
     * @param {Object} value
     * @param {Object} hours
     * @param {Object} path
     */
    exports.setCookie = function(name, value, hours, path) {
        var name = escape(name);
        var value = escape(value);
        var expires = new Date();
        expires.setTime(expires.getTime() + hours * 3600000);
        path = path == "" ? "" : ";path=" + path;
        _expires = ( typeof hours) == "string" ? "" : ";expires=" + expires.toUTCString();
        document.cookie = name + "=" + value + _expires + path;
    }

    /**
     * 获取cookie值
     * @param {Object} name
     */
    exports.getCookie = function(name) {
        var name = escape(name);
        var allcookies = document.cookie;
        name += "=";
        var pos = allcookies.indexOf(name);
        if (pos != -1) {
            var start = pos + name.length;
            var end = allcookies.indexOf(";", start);
            if (end == -1)
                end = allcookies.length;
            var value = allcookies.substring(start, end);
            return unescape(value);
        } else {
            return "";
        }
    }     
});