/**
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    var template = require('../common/module/template_native');

    var Feedback = {
        init: function() {
            this.reply($('[role="reply"]'));//回复
            this.ignore($('[role="ignore"]'));//忽略
            this.multiIgnore($('[role="multiIgnore"]'));//整页忽略
            this.viewLgPic($('[role="viewLgPic"]'));//查看大图
        },

        /**
         * 回复
         */
        reply: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                    $wrap=$this.closest("tr"),
                    $feedbackId = $wrap.find('.feedbackId'),
                    feedbackId = $feedbackId.val().trim();
                var createDialog = dialog({
                    id: 'createDialog',
                    title: '快速回复',
                    content: document.getElementById('createDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '发送',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form'),
                                    $text = dia.__popup.find('.reply'),
                                    $msg = $text.siblings('.msg');

                                $msg.hide();
                                if ($.trim($text.val()) == '') {
                                    $text.focus();
                                    return false;
                                }

                                var params={
                                    "feedbackId":feedbackId,
                                    "reply":$text.val().trim(),
                                    "status":1
                                };
                                ajax.post('/ajax/Feedback/update', params, function(result) {
                                    if(result.success){
                                        dia.close();
                                        dd.alert('已回复！');
                                        window.location.reload(false);
                                    }else{
                                        dd.alert(result.error);
                                    }
                                });

                                return false;
                            },
                            autofocus: true
                        }
                    ],
                    cancelValue: '关闭',
                    cancel: function() {

                    },
                    onshow: function() {
                        //this.__popup.find('form').append($feedbackId.clone());
                    }
                }).showModal();
            });
        },

        /**
         * 忽略
         */
        ignore: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $feedbackId = $wrap.find('.feedbackId'),
                    feedbackId = $feedbackId.val().trim();
                var params={
                    "feedbackId":feedbackId,
                    "reply":'已忽略',
                    "status":2
                };
                ajax.post('/ajax/Feedback/update', params, function(result) {
                    if(result.success){
                        dd.alert('已忽略！');
                        window.location.reload(false);
                    }else{
                        dd.alert(result.error);
                    }
                });

            });
        },

        /**
         * 整页忽略
         */
        multiIgnore: function(obj) {
            obj.click(function() {
                var $table=$("#tbFeedback"),
                    $td=$table.find(".feedbackId2"),
                    feedbackIds = new Array();

                for(var i=0;i<$td.length;i++){
                    //feedbackIds.push($td[i].val().trim());
                    feedbackIds.push($td[i].innerHTML.trim());
                }
                if(feedbackIds==null || feedbackIds.toString().length==0){
                    return;
                }

                var params={'feedbackIds':feedbackIds.toString()};
                ajax.post('/ajax/Feedback/multiUpdate',params, function(result) {
                    if(result.success){
                        dd.alert('批量忽略成功！');
                        window.location.reload(false);
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
                    title: '查看反馈大图',
                    content: document.getElementById('viewPicDialogTmpl').innerHTML,

                    cancelValue: '关闭',
                    cancel: function() {

                    },
                    onshow: function() {
                        var pic=this.__popup.find('.feedbackPic');
                        pic.attr("src",hrc);
                    }
                }).showModal();
            });
        }

    }

    Feedback.init();
});
