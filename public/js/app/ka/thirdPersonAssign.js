/**
 * @description: 个人礼包分配页面交互
 * @author: chenxx
 * @date: 2014-09-02
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/underscore');
    require('../../thirdParty/dialog');
    
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');
    var template = require('../common/module/template_native');
    
    var ThirdPersonAssign = {
        init: function() {
            this.bindSetCondition();
            this.bindSetAutoCount();
            this.bindAssignUser();
        },
        
        bindSetCondition: function() {
            $('#setCondition').click(function() {
                var conditionDialog = dialog({
                    id: 'conditionDialog',
                    title: '设置条件',
                    content: document.getElementById('conditionDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    url = $form.attr('action'),
                                    $kaId = $('#kaId');
                                
                                $form.append($kaId.clone());
                                ajax.post(url, $form.serialize(), function(result) {
                                    if(result.success){
                                        conditionDialog.close().remove();
                                        dd.alert('设置成功！', function(){
                                            window.location.reload(false);
                                        });
                                    }else{
                                        dd.alert(result.error);
                                    }
                                });
                                return false;
                            },
                            autofocus: true
                        },{value: '取消'}
                    ]
                }).showModal();
            });
        },
        
        bindSetAutoCount: function() {
            $('#btnSaveAuto').click(function() {
                var $this = $(this),
                    $autoCount = $this.closest('.con').find('[name="autoTotalCount"]'),
                    $kaId = $('#kaId');
                
                if(_.isEmpty($autoCount.val())) {
                    dd.alert('请输入自动领取个数');
                    return false;
                }
                var autoCount = parseInt($autoCount.val());
                if(autoCount != $autoCount.val()) {
                    dd.alert('自动领取个数必须为整数');
                    return false;
                }
                
                if((autoCount < parseInt($('#autoGotCount').text())) 
                    || (autoCount > parseInt($('#totalCount').text()) - parseInt($('#hasAssigned').text()))) {
                    dd.alert('自动领取个数设置有误');
                    return false;
                }
                
                ajax.post($this.data('url'), {kid:$kaId.val(), count:$autoCount.val()}, function(result) {
                    if(result.success){
                        window.location.reload(false);
                    }else{
                        dd.alert(result.error);
                    }
                });
                
                return false;
            });
        },
        
        bindAssignUser: function() {
            this.bindUserListUpload = false;
            var self = this;
            $('[role="sendMember"]').click(function() {
                 var $this = $(this),
                    url = $this.data('url');

                    var sendMemberDialog = dialog({
                        id: 'sendMemberDialog',
                        title: '选择分配成员',
                        skin: 'remove-body-padding',
                        content: document.getElementById('sendMemberDialogTmpl').innerHTML,
                        button: [
                            {
                                value: '保存',
                                callback: function () {
                                    var $dialog = this.__popup
                                    if(_.isEmpty($dialog.find(':hidden').val())) {
                                        $dialog.find('.error-msg').text('请导入KKID');
                                        return false;
                                    }
                                    
                                    ajax.post(url, {kid:$('#kaId').val()}, function(result){
                                        sendMemberDialog.close();
                                        if(result.success){
                                            dd.alert("分配成功！", function() {
                                                window.location.reload(false);
                                            });
                                        }else{
                                            if(result.error == '') {
                                                dialog({
                                                    title: '分配结果',
                                                    skin: 'remove-body-padding',
                                                    content: document.getElementById('assignResultDialogTmpl').innerHTML,
                                                    button: [
                                                        {
                                                            value: '确定',
                                                            callback: function () {
                                                                window.location.reload(false);
                                                                return false;
                                                            },
                                                            autofocus: true
                                                        }
                                                    ]
                                                }).showModal();
                                            } else {
                                                dd.alert(result.error, function() {
                                                    sendMemberDialog.show();
                                                });                                                
                                            }
                                        }
                                    });
                                    return false;
                                },
                                autofocus: true
                            }
                        ],
                        cancelValue: '取消',
                        cancel: function() {
                            self.bindUserListUpload = false;
                        },
                        onshow: function() {
                            if(!self.bindUserListUpload) {
                                self.bindUpload(this);
                            }
                        }
                    }).showModal();
            });
        },
        
        bindUpload: function(dialog) {
            this.bindUserListUpload = true;
            var sid=$('#sid').val(),
                kid=$('#kaId').val(),
                self = this;
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/ka/uploadKKId',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
                post_params:{sid:sid,kid:kid},

                file_types: "*.xls",
                file_types_description: 'XLS',
                file_size_limit: '102400',

                // handlers
                file_queue_error_handler: function(){},  // 文件加入上传队列失败时触发
                file_dialog_complete_handler: fileDialogComplete,  // 选择文件对话框关闭时触发
                upload_success_handler: uploadSuccess,  // 文件上传成功后触发
                upload_error_handler: uploadError,  //文件上传出错时触发

                button_placeholder_id: 'upload',
                button_text: '<span class="button-text">导入</span>',
                button_text_style: '.button-text{color: #333333; font-family: "微软雅黑"; font-size:16px;padding: 0 0 0 10px;}',
                button_text_left_padding: 10,
                button_text_top_padding: 5,
                button_width: 60,
                button_height: 36,
                button_cursor: SWFUpload.CURSOR.HAND,
                button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,  // 单文件上传

                debug: false,

                custom_settings: {}
            });
            
            // 选择文件对话框关闭时的回调
            function fileDialogComplete() {
                this.startUpload();
            }
            
            function uploadSuccess(file, serverData, response) {
                var result = JSON.parse(serverData);
                if(result.success){
                    var $dialog = dialog.__popup;
                    $dialog.find(':hidden').val(result.data.count);
                    $dialog.find('.error-msg').text('');
                    $('#fileName').text(file.name);
                    swfUpload.setButtonTextPadding(0, 5);
                    swfUpload.setButtonDimensions(70, 36);
                    swfUpload.setButtonText('<span class="button-text">重新选择</span>');
                }else{
                    dd.alert(result.error);
                }
            }
            
            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        },
    };
    
    ThirdPersonAssign.init();
});