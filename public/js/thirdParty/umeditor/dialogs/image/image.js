(function () {
    var utils = UM.utils,
        browser = UM.browser,
        Base = {
        checkURL: function (url) {
            if(!url)    return false;
            url = utils.trim(url);
            if (url.length <= 0) {
                return false;
            }
            if (url.search(/http:\/\/|https:\/\//) !== 0) {
                url += 'http://';
            }

            url=url.replace(/\?[\s\S]*$/,"");

            if (!/(.gif|.jpg|.jpeg|.png)$/i.test(url)) {
                return false;
            }
            return url;
        },
        getAllPic: function (sel, $w, editor) {
            var me = this,
                arr = [],
                $imgs = $(sel, $w);

            $.each($imgs, function (index, node) {
                var $node = $(node);
                $node.removeAttr("width").removeAttr("height");

//                if (node.width > editor.options.initialFrameWidth) {
//                    me.scale(node, editor.options.initialFrameWidth -
//                        parseInt($(editor.body).css("padding-left"))  -
//                        parseInt($(editor.body).css("padding-right")));
//                }
                return arr.push({
                    _src: $node.attr("lsrc"),
                    src: $node.attr("lsrc")
                });
            });

            return arr;
        },
        scale: function (img, max, oWidth, oHeight) {
            var width = 0, height = 0, percent, ow = img.width || oWidth, oh = img.height || oHeight;
            if (ow > max || oh > max) {
                if (ow >= oh) {
                    if (width = ow - max) {
                        percent = (width / ow).toFixed(2);
                        img.height = oh - oh * percent;
                        img.width = max;
                    }
                } else {
                    if (height = oh - max) {
                        percent = (height / oh).toFixed(2);
                        img.width = ow - ow * percent;
                        img.height = max;
                    }
                }
            }

            return this;
        },
        close: function ($img) {
            $img.css({
                top: ($img.parent().height() - $img.height()) / 2,
                left: ($img.parent().width()-$img.width())/2
            }).prev().on("click",function () {

                if ( $(this).parent().remove().hasClass("edui-image-upload-item") ) {
                    //显示图片计数-1
                    Upload.showCount--;
                    Upload.updateView();
                }

            });

            return this;
        },
        createImgBase64: function (img, file, $w) {
            if (browser.webkit) {
                //Chrome8+
                img.src = window.webkitURL.createObjectURL(file);
            } else if (browser.gecko) {
                //FF4+
                img.src = window.URL.createObjectURL(file);
            } else {
                //实例化file reader对象
                var reader = new FileReader();
                reader.onload = function (e) {
                    img.src = this.result;
                    $w.append(img);
                };
                reader.readAsDataURL(file);
            }
        },
        callback: function (editor, $w, url, state) {

            if (state == "SUCCESS") {
                //显示图片计数+1
                Upload.showCount++;

                //var $img = $("<img src='" + editor.options.imagePath + url['200'] + "' lsrc='" + editor.options.imagePath + url['720'] + "' class='edui-image-pic' />"),
                var $img = $("<img src='" + url + "' lsrc='" +  url + "' class='edui-image-pic' />"),
                    $item = $("<div class='edui-image-item edui-image-upload-item'><div class='edui-image-close'></div></div>").append($img);

                if ($(".edui-image-upload2", $w).length < 1) {
                    $(".edui-image-content", $w).append($item);

                    Upload.render(".edui-image-content", 2)
                        .config(".edui-image-upload2");
                } else {
                    $(".edui-image-upload2", $w).before($item).show();
                }

                $img.on("load", function () {
                    Base.scale(this, 120);
                    Base.close($(this));
                    $(".edui-image-content", $w).focus();
                });

            } else {
                currentDialog.showTip( state );
                window.setTimeout( function () {

                    currentDialog.hideTip();

                }, 3000 );
            }

            Upload.toggleMask();

        }
    };

    /*
     * 本地上传
     * */
    var Upload = {
        showCount: 0,
        uploadTpl: '<div class="edui-image-upload%%">' +
            '<span class="edui-image-icon"></span>' +
            '<form class="edui-image-form" method="post" enctype="multipart/form-data" target="up">' +
            '<input style=\"filter: alpha(opacity=0);\" class="edui-image-file" type="file" hidefocus name="upfile" accept="image/gif,image/jpeg,image/png,image/jpg,image/bmp"/>' +
            '<input style=\"filter: alpha(opacity=0);\"  id="uid"  type="hidden" hidefocus name="uid"/>' +
            '<input style=\"filter: alpha(opacity=0);\"  value="1"  type="hidden" hidefocus name="type"/>' +
            '</form>' +

            '</div>',
        init: function (editor, $w) {
            var me = this;
            me.editor = editor;
            me.dialog = $w;
            me.render(".edui-image-local", 1);
            me.config(".edui-image-upload1");
            me.submit();
            me.drag();

            $(".edui-image-upload1").hover(function () {
                $(".edui-image-icon", this).toggleClass("hover");
            });

            if (!(UM.browser.ie && UM.browser.version <= 9)) {
                $(".edui-image-dragTip", me.dialog).css("display", "block");
            }


            return me;
        },
        render: function (sel, t) {
            var me = this;

            $(sel, me.dialog).append($(me.uploadTpl.replace(/%%/g, t)));

            return me;
        },
        config: function (sel) {
            var me = this,
                url=me.editor.options.imageUrl;

            url=url + (url.indexOf("?") == -1 ? "?" : "&") + "editorid="+me.editor.id;//初始form提交地址;

            $("form", $(sel, me.dialog)).attr("action", url);

            return me;
        },
        uploadComplete: function(r){
            var me = this;
            try{
                var json = eval('('+r+')');
                Base.callback(me.editor, me.dialog, json.data.imgUrl, json.data.state);
            }catch (e){
                var lang = me.editor.getLang('image');
                Base.callback(me.editor, me.dialog, '', (lang && lang.uploadError) || 'Error!');
            }
        },
        submit: function (callback) {

            var me = this,
                input = $( '<input style="filter: alpha(opacity=0);" class="edui-image-file" type="file" hidefocus="" name="upfile" accept="image/gif,image/jpeg,image/png,image/jpg,image/bmp">'),
                input = input[0];

            $(me.dialog).delegate( ".edui-image-file", "change", function ( e ) {
                if ( !this.parentNode ) {
                    return;
                }

                $('<iframe name="up"  style="display: none"></iframe>').insertBefore(me.dialog).on('load', function(){
                    var r = this.contentWindow.document.body.innerHTML;
                    if(r == '')return;
                    me.uploadComplete(r);
                    $(this).unbind('load');
                    $(this).remove();

                });

                var id=0;
                //马甲动态
                //if($("#userId").length>0){
                //    if($("#userId").val().trim().length==0){
                //        $(".edui-close").trigger("click");
                //        $("#userId").next().html("请先输入用户ID");
                //        $("#userId").focus();
                //        return;
                //    }
                //    id=$("#userId").attr("data-uid");
                //    if( !id ){
                //    	id = $("#userId").val();
                //    }
                //
                //    if( !Number(id) ){
                //    	  $("#userId").next().html("请先输入用户ID");
                //    	  return;
                //    }
                //}
                //
                ////公众号动态
                //if($("#pid").length>0){
                //    if($("#pid").val().trim().length==0){
                //        $(".edui-close").trigger("click");
                //        $("#pid").next().html("请先输入公众号ID");
                //        $("#pid").focus();
                //        return;
                //    }else{
                //        if(!Number($("#pid").val())){
                //            $(".edui-close").trigger("click");
                //            $("#pid").next().html("公众号ID必须为整数");
                //            $("#pid").focus();
                //            return;
                //        }
                //    }
                //
                //    id=$("#pid").val();
                //}



                //$(this).parent().find("#uid").val($("#userId").val());
                //$(this).parent().find("#uid").val(id);
                $(this).parent()[0].submit();
                Upload.updateInput( input );
                me.toggleMask("Loading....");
                callback && callback();

            });

            return me;
        },
        //更新input
        updateInput: function ( inputField ) {

            $( ".edui-image-file", this.dialog ).each( function ( index, ele ) {

                ele.parentNode.replaceChild( inputField.cloneNode( true ), ele );

            } );

        },
        //更新上传框
        updateView: function () {
            if ( Upload.showCount !== 0 ) {
                return;
            }

            $(".edui-image-upload2", this.dialog).hide();
            $(".edui-image-dragTip", this.dialog).show();
            $(".edui-image-upload1", this.dialog).show();

        },
        drag: function () {
            var me = this;
            //做拽上传的支持
            if (!UM.browser.ie9below) {
                me.dialog.find('.edui-image-content').on('drop',function (e) {

                    //获取文件列表
                    var fileList = e.originalEvent.dataTransfer.files;
                    var img = document.createElement('img');
                    var hasImg = false;
                    $.each(fileList, function (i, f) {
                        if (/^image/.test(f.type)) {
                            //创建图片的base64
                            Base.createImgBase64(img, f, me.dialog);

                            var xhr = new XMLHttpRequest();
                            xhr.open("post", me.editor.getOpt('imageUrl') + "?type=ajax", true);
                            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

                            //模拟数据
                            var fd = new FormData();
                            fd.append(me.editor.getOpt('imageFieldName'), f);
                            xhr.send(fd);
                            xhr.addEventListener('load', function (e) {
                                var r = e.target.response, json;
                                me.uploadComplete(r);
                                if (i == fileList.length - 1) {
                                    $(img).remove()
                                }
                            });
                            hasImg = true;
                        }
                    });
                    if (hasImg) {
                        e.preventDefault();
                        me.toggleMask("Loading....");
                    }

                }).on('dragover', function (e) {
                        e.preventDefault();
                    });
            }
        },
        toggleMask: function (html) {
            var me = this;
            var $mask = $(".edui-image-mask", me.dialog);
            if (html) {
                if (!(UM.browser.ie && UM.browser.version <= 9)) {
                    $(".edui-image-dragTip", me.dialog).css( "display", "none" );
                }
                $(".edui-image-upload1", me.dialog).css( "display", "none" );
                $mask.addClass("edui-active").html(html);
            } else {

                $mask.removeClass("edui-active").html();

                if ( Upload.showCount > 0 ) {
                    return me;
                }

                if (!(UM.browser.ie && UM.browser.version <= 9) ){
                    $(".edui-image-dragTip", me.dialog).css("display", "block");
                }
                $(".edui-image-upload1", me.dialog).css( "display", "block" );
            }

            return me;
        }
    };

    /*
     * 网络图片
     * */
    var NetWork = {
        init: function (editor, $w) {
            var me = this;

            me.editor = editor;
            me.dialog = $w;

            me.initEvt();
        },
        initEvt: function () {
            var me = this,
                url,
                $ele = $(".edui-image-searchTxt", me.dialog);

            $(".edui-image-searchAdd", me.dialog).on("click", function () {
                url = Base.checkURL($ele.val());

                if (url) {

                    $("<img src='" + url + "' class='edui-image-pic' />").on("load", function () {



                        var $item = $("<div class='edui-image-item'><div class='edui-image-close'></div></div>").append(this);

                        $(".edui-image-searchRes", me.dialog).append($item);

                        Base.scale(this, 120);

                        $item.width($(this).width());

                        Base.close($(this));

                        $ele.val("");
                    });
                }
            })
                .hover(function () {
                    $(this).toggleClass("hover");
                });
        }
    };

    var $tab = null,
        currentDialog = null;

    UM.registerWidget('image', {
        tpl: "<link rel=\"stylesheet\" type=\"text/css\" href=\"<%=image_url%>image.css\">" +
            "<div class=\"edui-image-wrapper\">" +
            "<ul class=\"edui-tab-nav\">" +
            "<li class=\"edui-tab-item edui-active\"><a data-context=\".edui-image-local\" class=\"edui-tab-text\"><%=lang_tab_local%></a></li>" +
            "</ul>" +
            "<div class=\"edui-tab-content\">" +
            "<div class=\"edui-image-local edui-tab-pane edui-active\">" +
            "<div class=\"edui-image-content\"></div>" +
            "<div class=\"edui-image-mask\"></div>" +
            "<div class=\"edui-image-dragTip\"><%=lang_input_dragTip%></div>" +
            "</div>" +
            "<div class=\"edui-image-JimgSearch edui-tab-pane\">" +
            "<div class=\"edui-image-searchBar\">" +
            "<table><tr><td><input class=\"edui-image-searchTxt\" type=\"text\"></td>" +
            "<td><div class=\"edui-image-searchAdd\"><%=lang_btn_add%></div></td></tr></table>" +
            "</div>" +
            "<div class=\"edui-image-searchRes\"></div>" +
            "</div>" +
            "</div>" +
            "</div>",
        initContent: function (editor, $dialog) {
            var lang = editor.getLang('image')["static"],
                opt = $.extend({}, lang, {
                    image_url: UMEDITOR_CONFIG.UMEDITOR_HOME_URL + 'dialogs/image/'
                });

            Upload.showCount = 0;

            if (lang) {
                var html = $.parseTmpl(this.tpl, opt);
            }

            currentDialog = $dialog.edui();

            this.root().html(html);

        },
        initEvent: function (editor, $w) {
            $tab = $.eduitab({selector: ".edui-image-wrapper"})
                .edui().on("beforeshow", function (e) {
                    e.stopPropagation();
                });

            Upload.init(editor, $w);

            NetWork.init(editor, $w);
        },
        buttons: {
            'ok': {
                exec: function (editor, $w) {
                    var sel = "",
                        index = $tab.activate();

                    if (index == 0) {
                        sel = ".edui-image-content .edui-image-pic";
                    } else if (index == 1) {
                        sel = ".edui-image-searchRes .edui-image-pic";
                    }

                    var list = Base.getAllPic(sel, $w, editor);
                    $("#photoUrls").val("");

                    if (index != -1) {
                        var count=$(".img-wrap").children('.uploadPreview').length;
                        var limit=$("#picLimit").val();
                        if($("#pid").length>0 && count>=1){
                            updateImageInput();
                            $("#picTips").show();
                            $("#picTips").html(' 每次最多只能发1张图片');
                            return;
                        }
                        if($("#picLimit").length>0){
                            if(count>limit){
                                updateImageInput();
                                $("#picTips").show();
                                $("#picTips").html(' 每次最多只能发'+limit+'张图片');
                                return;
                            }
                        }else{
                            //使用！big压缩图片
                            //for(var v in list){
                            //    list[v].src=list[v].src+'!big';
                            //    list[v]._src=list[v]._src;
                            //}
                            editor.execCommand('insertimage', list);
                            return;
                        }
                        //公众号 发图片消息
                        //if($("#contentType").length>0 && $("#contentType").val()==3){
                        //    editor.setContent('');
                        //    $("#picUrl").val(list[0].src);
                        //    if(list.length>1){
                        //        list=list[0];
                        //        $errorMsg = $('.editor-wrap').find('.error-msg');
                        //        $errorMsg.text('每次只能选择一张图片');
                        //    }
                        //    editor.execCommand('insertimage', list);
                        //    return;
                        //}

                        for(var v in list){
                            $("#picture").trigger("click");
                            var src=list[v].src;
                            var $img="<div dsrc='"+src+"' style='background-image: url("+src+")' id='img"+v+"' class='uploadPreview'><a href='javascript:;' class='img-remove' onclick='removeEleById("+v+");' title='移除图片'><p class='img-p'></p></a></div>";
                            if($("#pid").length>0 && v>=1){
                                updateImageInput();
                                $("#picTips").show();
                                $("#picTips").html(' 每次最多只能发1张图片');
                                return;
                            }else if(v<9){
                                var c=parseInt($("#picCount").html());
                                var num=Number(c)+Number(v);
                                if(num<9){
                                    $(".img-wrap").append($img);
                                }else{
                                    $("#picTips").html(' 每次最多只能发9张图片');
                                }
                            }else if(v>=9){
                                $("#picTips").show();
                                $("#picTips").html(' 每次最多只能发9张图片');
                            }else{
                                $("#picTips").hide();
                            }
                        }
                        updateImageInput();
                    }
                }
            },
            'cancel': {}
        },
        width: 700,
        height: 408
    }, function (editor, $w, url, state) {
        Base.callback(editor, $w, url, state)
    })
})();

function removeEleById(id){
    $("#img"+id).remove();
    updateImageInput();
}

var index=0;
function updateImageInput(){
    var imgUrls= new Array();
    var $imgs=$(".img-wrap").children('.uploadPreview').each(function(){
        imgUrls.push($(this).attr("dsrc"));
    });

    if(imgUrls.length==0){
        $(".img-wrap").hide();
    }else{
        $(".img-wrap").show();
    }
    $("#picCount").html(imgUrls.length);
    $("#photoUrls").val(imgUrls.toString());

}
