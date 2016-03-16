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
    
    var Channel = {
        init: function() {
        	this.isBindFileUpload = false;  // 是否已经绑定上传组件
        	this.add($('[role="add"]'));
        	this.edit($('[role="edit"]'));
        },
        
        /**
         * 更新头像
         */
        fileUpload: function() {
            this.isBindFileUpload = true;
            var sid=$('#sid').val();
            var id = $('#id').val();
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/image/upload',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
                // use_query_string: true,  // 是否允许传递参数
                post_params: {sid:sid,type:1,path:'/game/channel/'+id},  // 传递给后台的参数

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
                	$('#cornerIconUrl').val(res.data.imgUrl);
                    $('#cornerImg').attr('src', res.data.imgUrl).next().val(res.data.imgUrl);
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

            obj.click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'addDialog',
                    title: '添加渠道',
                    content: document.getElementById('addDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $name =$form.find('#name'),
                                    $msg = this.__popup.find('.msg');

                                var name = $.trim($name.val());
                                $msg.hide();

                                if (_.isEmpty(name)) {
                                    $msg.html('名称不能为空!').show();
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
                        $msg = this.__popup.find('.msg');
                        if (!self.isBindFileUpload) {
                            self.fileUpload();
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

            obj.click(function() {
                var $this = $(this),
                id = $this.closest('[role="edit"]').attr("targetId"),
                modeName = $this.closest('tr').children('td').eq(1).text();
                var imgFileIcon = $('#img-'+id).attr("src");
                var editDialog = dialog({
                    id: 'editDialog',
                    title: '编辑渠道',
                    content: document.getElementById('editDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                $name = $form.find('#name'),
                                $id=$form.find('#id'),
                                $msg = this.__popup.find('.msg');

                            var name = $.trim($name.val());
                                $msg.hide();

                                if (_.isEmpty(name)) {
                                    $msg.html('名称不能为空!').show();
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
                    },
                    onshow: function() {
                    	$("#id").text(id);
                    	$("#name").val(modeName);
                    	$("#cornerImg").attr('src',imgFileIcon);
                        $msg = this.__popup.find('.msg');
                        if (!self.isBindFileUpload) {
                            self.fileUpload();
                        }
                    }

                }).showModal();
                
            });
        },

    };
    
    Channel.init();
});