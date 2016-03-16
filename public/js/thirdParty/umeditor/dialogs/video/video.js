(function(){
    var utils = UM.utils;
    function hrefStartWith(href, arr) {
        href = href.replace(/^\s+|\s+$/g, '');
        for (var i = 0, ai; ai = arr[i++];) {
            if (href.indexOf(ai) == 0) {
                return true;
            }
        }
        return false;
    }

    UM.registerWidget('video', {
        tpl: "<style type=\"text/css\">" +
            ".edui-dialog-link ,.edui-link-table{font-size: 12px;margin: 10px;line-height: 30px;}" +
            ".edui-dialog-link ,.edui-link-txt{width:300px;height:21px;line-height:21px;border:1px solid #d7d7d7;}" +
            "</style>" +
            "<table class=\"edui-link-table\">" +
            "<tr>" +
            "<td><label for=\"href\"><%=lang_video_url%></label>：</td>" +
            "<td><input class=\"edui-link-txt\" id=\"edui-link-Jhref\" type=\"text\" /></td>" +
            "</tr>" +
            "</table>"+
            "<span>&nbsp;&nbsp;&nbsp;目前只支持优酷通用分享地址</span><br>" +
            "<span>&nbsp;&nbsp;&nbsp;例如:&lt;iframe src=&quot;http://xxxx&quot;&gt;&lt;/iframe&gt;</span>" ,
        initContent: function (editor) {
            var lang = editor.getLang('video');
            if (lang) {
                var html = $.parseTmpl(this.tpl, lang.static);
            }
            this.root().html(html);
        },
        initEvent: function (editor, $w) {
            var link = editor.queryCommandValue('video');
            if(link){
                $('#edui-link-Jhref',$w).val(utils.html($(link).attr('href')));
                $(link).attr('target') == '_blank' && $('#edui-link-Jtarget').attr('checked',true)
            }
            $('#edui-link-Jhref',$w).focus();
        },
        buttons: {
            'ok': {
                exec: function (editor, $w) {

                    var href = $('#edui-link-Jhref').val().replace(/^\s+|\s+$/g, '');
                    if (href) {
                        href=$(href).attr("src")==undefined?$(href).attr("href"):$(href).attr("src");
                        if(href==undefined){
                            alert("视频路径无效，请使用优酷通用分享代码。");
                            return;
                        }
                        editor.execCommand('insertvideo', {
                            'url': href,
                            'height': 'auto',
                            'width': 'auto',
                            '_href': href
                        });
                    }
                }
            },
            'cancel':{}
        },
        width: 400
    })
})();

