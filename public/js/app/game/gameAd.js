/**
 * @description: 游戏模式管理页面交互
 * @author: lox@warthog.cn
 * @date: 2015-05-06
 */

define(function(require) {
    require('../common/common');
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    
    var GameAd = {
        init: function() {
        	this.add($('[role="add"]'));
        	this.edit($('[role="edit"]'));
            this.deleted($('[role="delete"]'));
        },
        
        /**
         * 更新头像
         */
        fileUpload: function(obj) {
            var sid=$('#sid').val();
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/image/upload',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',
                file_post_name: 'upfile',  // POST信息中上传文件的name值
                // use_query_string: true,  // 是否允许传递参数
                post_params: {sid:sid,type:1,path:'/game/ad/'},  // 传递给后台的参数

                file_types: "*.jpg;*.jpeg;*.gif;*.png;",
                file_types_description: '图片',
                file_size_limit: '2MB',
                // file_upload_limit: 5,
                // file_queue_limit: 3,

                // handlers
                // file_dialog_start_handler: fileDialogStart,  // 打开文件对话框时触发
                // file_queued_handler: fileQueued,  // 文件被加入上传队列时触发
                file_queue_error_handler: fileQueueError,  // 文件加入上传队列失败时触发
                file_dialog_complete_handler: fileDialogComplete,  // 选择文件对话框关闭时触发
                // upload_start_handler: uploadStart,  // 文件开始上传时触发
                upload_progress_handler: uploadProgress,  // 文件上传过程中定时触发，显示文件上传进度
                upload_success_handler: uploadSuccess,  // 文件上传成功后触发
                upload_error_handler: uploadError,  //文件上传出错时触发

                button_placeholder_id: 'upload',
                button_text: '<span class="button-text">更新图片</span>',
                button_text_style: '.button-text{color: #59a4ff; font-family: "微软雅黑"; font-size:14px;}',
                button_text_left_padding: 0,
                button_text_top_padding: 0,
                // button_image_url: '../js/thirdParty/swfupload/swfupload_btn.png',
                button_width: 110,
                button_height: 38,
                button_cursor: SWFUpload.CURSOR.HAND,
                button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,  // 单文件上传

                debug: false,

                custom_settings: {}
            });

            // 打开文件对话框时的回调
            function fileDialogStart() {
            }

            // 文件加入上传队列失败时的回调
            function fileQueued() {
            }

            // 打开文件对话框时的回调
            function fileQueueError() {
            }

            // 选择文件对话框关闭时的回调
            function fileDialogComplete() {
                this.startUpload();
            }

            /**
             * 文件开始上传时的回调
             * @param file 开始上传目标文件
             */
            function uploadStart(file) {
            }

            // 文件上传过程中的回调
            function uploadProgress(file, bytesCompleted, bytesTotal) {
            	var msgEle = $("#upload-msg");
            	//正在上传时，需要显示上传的进度
            	if(bytesCompleted < bytesTotal)
            	{
            		var percent = Math.ceil((bytesCompleted / bytesTotal) * 100);
                    msgEle.html('正在上传...: '+percent+'%').show();
            	}else
            	{
                    msgEle.hide();
            	}
            }

            /**
             * 文件上传成功后的回调
             * @param file 上传的文件
             * @param serverData 服务器在执行完接收文件方法后返回的数据
             * @param response{Boolean}, 表示是否服务器返回数据
             */
            function uploadSuccess(file, serverData, response) {
                var res = JSON.parse(serverData);
                if(res.data.state != undefined && res.data.state == 'SUCCESS') {
                    //根据具体上传的数据，更新对应的字段
                    if(obj.attr("id") === 'pcBannerUrl')
                    {
                        //PC大图
                        $('#pcBannerUrl').val(res.data.imgUrl);
                        $('#pcBanner').attr('src',res.data.imgUrl);
                    }else
                    {
                        $('#pcBannerSmallUrl').val(res.data.imgUrl);
                        $('#pcBannerSmall').attr('src',res.data.imgUrl);
                    }
                }
            }

            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        },
        
        /**
         * 添加
         */
        add: function(obj) {
            var self = this;
            var isBindFileUpload = false;
            obj.click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'addDialog',
                    title: '添加',
                    content: document.getElementById('addDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form');
                                var title = $.trim($('#title').val());

                                var $msg = this.__popup.find('.msg');
                                $msg.hide();
                                if (_.isEmpty(title)) {
                                    $msg.html('标题不能为空!').show();
                                    return false;
                                }
                                var pcBanner = $.trim($('#pcBannerUrl').val());
                                var pcBannerSmall = $.trim($('#pcBannerSmallUrl').val());
                                if (_.isEmpty(pcBanner) || _.isEmpty(pcBannerSmall)) {
                                    $msg.html('请选择广告图片!').show();
                                    return false;
                                }

                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，添加成功！', function(){
                                            window.location.reload(false);
                                        });
                                    }else{
                                        dd.alert(result.error);
                                    }
                                });
                                return false;
                            },
                            autofocus: true
                        }
                    ],
                    cancelValue: '取消',
                    cancel: function() {
                        self.isBindFileUpload = false;
                    },
                    onshow: function() {
                        if(!self.isBindFileUpload)
                        {
                            self.fileUpload($('#pcBannerUrl'));
                            self.fileUpload($('#pcBannerSmallUrl'));
                        }
                    }
                }).showModal();
                
            });
        },
        
        /**
         * 编辑装备
         */
        edit: function(obj) {
            var self = this;
            var isBindFileUpload = false;
            obj.click(function() {
                var $this = $(this),
                id = $this.closest('[role="edit"]').attr("targetId"),
                gameName = $this.closest('tr').children('td').eq(1).text(),
                title = $this.closest('tr').children('td').eq(2).text(),
                pos = $this.closest('tr').children('td').eq(4).text();
                var pcBannerSmall = $('#img-small-'+id).attr("src");
                var pcBanner = $('#img-'+id).val();
                var editDialog = dialog({
                    id: 'editDialog',
                    title: '编辑',
                    content: document.getElementById('editDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form');
                                var title = $.trim($('#title').val());
                                var $msg = this.__popup.find('.msg');
                                $msg.hide();
                                if (_.isEmpty(title)) {
                                    $msg.html('标题不能为空!').show();
                                    return false;
                                }
                                var pcBanner = $.trim($('#pcBannerUrl').val());
                                var pcBannerSmall = $.trim($('#pcBannerSmallUrl').val());
                                if (_.isEmpty(pcBanner) || _.isEmpty(pcBannerSmall)) {
                                    $msg.html('请选择广告图片!').show();
                                    return false;
                                }

                                ajax.post($form.attr('action'), $form.serialize()+"&adId="+id, function(result){
                                    if(result.success){
                                    	editDialog.close();
                                        dd.alert('恭喜，更新成功！', function(){
                                            window.location.reload(false);
                                        });
                                    }else{
                                        dd.alert(result.error);
                                    }
                                });
                                return false;
                            },
                            autofocus: true
                        }
                    ],
                    cancelValue: '取消',
                    cancel: function() {
                    	self.isBindFileUpload = false;
                    },
                    onshow: function() {
                    	$("#adId").text(id);
                    	$("#gameName").text(gameName);
                        $("#title").val(title);
                        $("#pos").val(pos);
                    	$("#pcBanner").attr('src',pcBanner);
                        $("#pcBannerSmall").attr('src',pcBannerSmall);
                        $("#pcBannerUrl").val(pcBanner);
                        $("#pcBannerSmallUrl").val(pcBannerSmall);
                        if(!self.isBindFileUpload)
                        {
                            self.fileUpload($('#pcBannerUrl'));
                            self.fileUpload($('#pcBannerSmallUrl'));
                        }
                    }
                }).showModal();
                
            });
        },
        /**
         * 删除
         */
        deleted: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this);
                var id = $this.closest('[role="delete"]').attr("targetId");
                var deletedDialog = dialog({
                    id: 'deletedDialog',
                    title: '删除渠道',
                    content: document.getElementById('deletedDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var $form = this.__popup.find('form');
                                ajax.post($form.attr('action'), "&adId="+id, function(result){
                                    if(result.success){
                                        deletedDialog.close();
                                        dd.alert('恭喜，删除成功！', function(){
                                            window.location.reload(false);
                                        });
                                    }else{
                                        dd.alert(result.error);
                                    }
                                });
                                return false;
                            },
                            autofocus: true
                        }
                    ],
                    cancelValue: '取消',
                    cancel: function() {
                    },
                    onshow: function() {
                    }

                }).showModal();
            });
        },
    };

    GameAd.init();
});