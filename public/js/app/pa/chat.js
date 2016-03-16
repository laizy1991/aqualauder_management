/**
 * @description: 公众号消息页面交互
 * @author: zhongna
 * @date: 2014-09-05
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../common/module/umeditor_custom');  // 自定义UMeditor控件
    require('../../thirdParty/underscore');

    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');

    var maxContentLen = 400;
    var Pa = {
        init: function() {
            //var pageSize=$("#pageSize").val();
            //if(pageSize==10){
                $('#msg-box').scrollTop( $('#msg-box')[0].scrollHeight );
            //}
            try {
                this.initChatForm();
            } catch(e) {}

            this.viewLgPic($('[role="viewLgPic"]'));//查看大图
            //this.getHistoryMessage($('[role="more"]'));
        },

        getHistoryMessage: function (obj) {
        },
        /**
         * 初始化文本框插件
         */
        initChatForm: function() {
            var toolbar =  ['emotion2 image'];//image emotion image fullscreen
            var um = null;
            um = UM.getEditor('chatEditor', {
                toolbar: toolbar,
                wordCount: maxContentLen,
                filterRules: function(){
                    return {
                        //直接删除及其字节点内容
                        '-' : 'script style object iframe embed input select',
                        'a': {$:{}}
                    }
                }()
            });


            $('#btnSend').click(function(){

                var content = um.getContent(),
                    contentLen = um.getContentLength(true),
                    contentType=1;
                if($("#photoUrls").val().length>0){
                    content=$("#photoUrls").val();
                    contentType=3;
                }
                if(_.isEmpty(content)) {
                    $('.editor-wrap').find('.error-msg').text('随便说点什么吧');
                    return false;
                } else {
                    $('.editor-wrap').find('.error-msg').text('');
                }
                if(contentLen > maxContentLen) {
                    $('.editor-wrap').find('.error-msg').text('内容字数过长');
                    return false;
                } else {
                    $('.editor-wrap').find('.error-msg').text('');
                }

                var params={
                    "pid":$("#pid").val(),
                    "uid":$("#uid").val(),
                    "contentType":contentType,
                    "content":content
                }

                content=$('<p>'+content+'</p>').text();
                //window.location.href=window.location.href;
                var msgBox=$("#msg-box");
                ajax.post('/ajax/pa/sendMsg', params, function(result) {
                    if(result.success){
                        um.setContent('');
                        //$('#msg-box').scrollTop( $('#msg-box')[0].scrollHeight );
                        var paMsgWrap='<div class="guild-group pa-msg-bg">';
                        var paName='<span class="name pa-name">游易团队</span>';
                        var paTime='<span class="time pa-time">'+getDatetime()+'</span>';
                        var con='<p class="con ">'+content+'</p>';
                        paMsgWrap+=paName;
                        paMsgWrap+=paTime;
                        paMsgWrap+=con;
                        paMsgWrap+='</div>';
                        msgBox.append(paMsgWrap);
                        $('#msg-box').scrollTop( $('#msg-box')[0].scrollHeight);
                        window.location.href=window.location.href;
                    }else{
                        dd.alert(result.error);
                    }
                });
            });
        },

        /**
         * 查看大图
         */
        viewLgPic: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    hrc=$(this).attr("hrc");

                var picDialog = dialog({
                    id: 'picDialog',
                    title: '查看大图',
                    content: document.getElementById('viewPicDialogTmpl').innerHTML,
                    cancelValue: '关闭',
                    cancel: function() {

                    },
                    onshow: function() {
                        var pic=this.__popup.find('.lgPic');
                        pic.attr("src",hrc);
                        var heigth=parseInt(($(".lgPic").css("height")))+20;
                        var width=parseInt(($(".lgPic").css("width")))+20;
                        $(".ui-dialog-body").css("height",heigth);
                        $(".ui-dialog-body").css("width",width);
                    }
                }).showModal();
            });
        }
    }

    Pa.init();
});

function getDatetime(){
    var now=new Date();
    var year=now.getFullYear();
    var month=now.getMonth()+1;
    var day=now.getDate();
    var hours=now.getHours();
    var minutes=now.getMinutes();
    var seconds=now.getSeconds();
    var datetime=year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds+"";
    return datetime;
}

