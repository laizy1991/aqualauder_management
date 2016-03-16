/**
 * @description: 英雄管理页面交互
 * @author: lox@warthog.cn
 * @date: 2015-05-05
 */

define(function(require) {
    require('../common/common');
    require('../../thirdParty/chosen');  // 下拉选择框插件
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    
    var ChannelPack = {
        init: function() {
        	this.initChosen();
        	this.add($('[role="add"]'));
        	this.edit($('[role="edit"]'));
        	this.deleted($('[role="deleted"]'));
        	this.isBindFileUpload = false;  // 是否已经绑定上传组件
        },
        
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        },
        
        /**
         * 添加
         */
        add: function(obj) {
            var self = this;
            obj.click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'addDialog',
                    title: '添加渠道包',
                    content: document.getElementById('addDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $packName = $form.find('#packName'),
                                    $reChargeDisc = $form.find('#reChargeDisc'),
                                    gameId=$('#gameId').val(),
                                    $msg = this.__popup.find('.msg');
                                    $msg.hide();	
                                
                                var packName = $.trim($packName.val());  // 
                                if (_.isEmpty(packName)) {
                                	$msg.html('渠道包名不能为空!').show();
                                	return false;
                                }                            
                                var reChargeDisc = $.trim($reChargeDisc.val());  // 
                                if (_.isEmpty(reChargeDisc)) {
                                    $msg.html('续充折扣不能为空!').show();
                                    return false;
                                }                            
                                
                                ajax.post($form.attr('action'), $form.serialize()+"&gameId="+gameId, function(result){
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
                    	self.isBindImgUpload = false;
                    },
                    onshow: function() {
                        $msg = this.__popup.find('.msg');
                        if (!self.isBindFileUpload) {
                            self.fileUpload();
                        }
                        if (!self.isBindImgUpload) {
                            self.imgUpload();
                        }
                    }

                }).showModal();
            });
        },
        
        /**
         * 编辑
         */
        edit: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                id = $this.closest('[role="edit"]').attr("targetId"),
                channelName = $this.closest('tr').children('td').eq(1).text();
                packName = $this.closest('tr').children('td').eq(2).text();
                reChargeDisc = $this.closest('tr').children('td').eq(3).text();
                reChargePos = $this.closest('tr').children('td').eq(5).text();
                imgFileIcon = $('#img-'+id).attr("src");
                var editDialog = dialog({
                    id: 'editDialog',
                    title: '编辑渠道',
                    content: document.getElementById('editDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                	$reChargeDisc = $form.find('#reChargeDisc'),
                                    $msg = this.__popup.find('.msg');

                                $msg.hide();

                                var reChargeDisc = $.trim($reChargeDisc.val());  // 
                                if (_.isEmpty(reChargeDisc)) {
                                    $msg.html('续充折扣不能为空!').show();
                                    return false;
                                }   
                                
                                ajax.post($form.attr('action'), $form.serialize()+"&id="+id, function(result){
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
                    	self.isBindImgUpload = false;
                    },
                    onshow: function() {
                    	$("#id").text(id);
                    	$("#channelName").text(channelName);
                    	$("#packName").val(packName);
                    	$("#reChargeDisc").val(reChargeDisc);
                    	$("#reChargePos").val(reChargePos);
                    	console.log(imgFileIcon);
                    	$("#apkImg").attr('src',imgFileIcon);
                    	$msg = this.__popup.find('.msg');
                    	if (!self.isBindFileUpload) {
                            self.fileUpload();
                        }
                    	if (!self.isBindImgUpload) {
                            self.imgUpload();
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
                var id = $this.closest('[role="deleted"]').attr("targetId");
                var deletedDialog = dialog({
                    id: 'deletedDialog',
                    title: '删除渠道',
                    content: document.getElementById('deletedDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                            	 var $form = this.__popup.find('form');
                                ajax.post($form.attr('action'), "&id="+id, function(result){
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
        
        /**
         * 更新APK
         */
        fileUpload: function() {
            this.isBindFileUpload = true;
            var sid=$('#sid').val();
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/commonfile/upload',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
                // use_query_string: true,  // 是否允许传递参数
                post_params: {sid:sid},  // 传递给后台的参数

                file_types: "*.apk",
                file_types_description: 'APK',
                file_size_limit: '0',
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
                button_text: '<span class="button-text">上传APK</span>',
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
            	console.log("start upload file");
            }

            // 文件上传过程中的回调
            function uploadProgress(file, bytesCompleted, bytesTotal) {
            	//正在上传时，需要显示上传的进度
            	if(bytesCompleted < bytesTotal)
            	{
            		var percent = Math.ceil((bytesCompleted / bytesTotal) * 100);
            		$msg.html('正在上传...: '+percent+'%').show();
            	}else
            	{
            		$msg.hide();
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
                    if(res.data.packName != '')
                    {
                    	$('#packName').val(res.data.packName);
                    }
                    $('#apkIconUrl').val(res.data.iconUrl);
                    $('#apkImg').attr('src',res.data.iconUrl);
                }
            }

            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        },
        
        
        /**
         * 更新IMG
         */
        imgUpload: function() {
            this.isBindImgUpload = true;
            var sid=$('#sid').val();
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/commonfile/upload',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
                // use_query_string: true,  // 是否允许传递参数
                post_params: {sid:sid},  // 传递给后台的参数

                file_types: '*.jpg;*.jpeg;*.gif;*.png;',
                file_types_description: '图片',
                file_size_limit: '0',
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
                button_text: '<span class="button-text">上传图片</span>',
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
            	console.log("start upload file");
            }

            // 文件上传过程中的回调
            function uploadProgress(file, bytesCompleted, bytesTotal) {
            	//正在上传时，需要显示上传的进度
            	if(bytesCompleted < bytesTotal)
            	{
            		var percent = Math.ceil((bytesCompleted / bytesTotal) * 100);
            		$msg.html('正在上传...: '+percent+'%').show();
            	}else
            	{
            		$msg.hide();
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
                    if(res.data.packName != '')
                    {
                    	$('#packName').val(res.data.packName);
                    }
                    $('#apkIconUrl').val(res.data.iconUrl);
                    $('#apkImg').attr('src',res.data.iconUrl);
                }
            }

            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        },
        
    };
    
    ChannelPack.init();
});