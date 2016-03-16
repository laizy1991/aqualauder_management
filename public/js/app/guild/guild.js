/**
 * @description: 公会资料页面交互
 * @author: chenxx
 * @date: 2014-09-02
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/underscore');
    
    var UtrialAvatarCutter = require('../common/module/utrialAvatarCutter');
    
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');
    var firstClickIntro = false;
    
    var Guild = {
        init: function () {
            this.switchTab();
            this.initIntro();
            this.initSetting();
            this.initImgUpload();
        },
        
        /**
         * 选项卡切换
         */
        switchTab: function() {
            $('.tab-item a').click(function() {
                var $this = $(this),
                    $tabItem = $this.closest('.tab-item'),
                    id = $this.attr('href');

                $tabItem.addClass('current').siblings().removeClass('current');
                $('#' + id).show().siblings('.flag').hide();
                
                if(id == 'intro' && !firstClickIntro) {
                    $('#btnCopy').zclip({
                        path: "/public/js/thirdParty/jquery.zclip/ZeroClipboard.swf",
        
                        copy: function(){
                            return $(this).parent().find('.gh-url').text();
                        },
        
                        afterCopy:function(){
                            dd.alert('复制成功！');
                        }
                    });
                    firstClickIntro = true;
                }
                return false;
            });
        },
        
        initIntro: function() {
            var maxSlogan = 30,
                maxSummary = 500;
            var sloganEditor = UM.getEditor('slogan', {
                toolbar:[],
                wordCount: maxSlogan
            });
            
            var summaryEditor = UM.getEditor('summary', {
                toolbar:[],
                wordCount: maxSummary
            });
            
            $('#submitIntro').click(function(){
                var $form = $('#intro').find('form'),
                    sloganContentLen = sloganEditor.getContentLength(true),
                    summaryContentLen = summaryEditor.getContentLength(true);
                    
                if(sloganContentLen > maxSlogan) {
                    $form.find('[role="errorSlogan"]').text('公会宣言字数过长');
                    return false;
                } else {
                    $form.find('[role="errorSlogan"]').text('');
                }
                
                if(summaryContentLen > maxSummary) {
                    $form.find('[role="errorSummary"]').text('公会简介字数过长');
                    return false;
                } else {
                    $form.find('[role="errorSummary"]').text('');
                }
                
                ajax.post($form.attr('action'), {slogan: sloganEditor.getContentTxt(), summary: summaryEditor.getContentTxt()}, function(result) {
                    if(result.success){
                        dd.alert('修改成功！');
                    }else{
                        dd.alert(result.error);
                    }
                });
                
                return false;
            });
            
        },
        
        initSetting: function() {
            $('#submitSetting').click(function(){
                var $form = $('#setting').find('form'),
                    $name = $form.find('[name="name"]');
                
                if(_.isEmpty($name.val())) {
                    $name.next().text('公会名称为必填项');
                    return false;
                } else {
                    $name.next().text('');
                }
                
                if($name.val().length > 25) {
                    $name.next().text('公会名称字数过长');
                    return false;
                } else {
                    $name.next().text('');
                }
                
                ajax.post($form.attr('action'), $form.serialize(), function(result) {
                    if(result.success){
                        dd.alert('修改成功！');
                    }else{
                        dd.alert(result.error);
                    }
                });
                
                return false;
            });
        },

        initImgUpload: function() {
            var self = this,
                sid=$('#sid').val(),
                cutter = null;

            var swfUpload = new SWFUpload({
                upload_url: '/ajax/image/upload',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
                post_params:{sid:sid},

                file_types: "*.jpg;*.jpeg;*.gif;*.png;",
                file_types_description: '图片',
                file_size_limit: '102400',
                // file_upload_limit: 5,
                // file_queue_limit: 3,

                // handlers
                // file_dialog_start_handler: fileDialogStart,  // 打开文件对话框时触发
                // file_queued_handler: fileQueued,  // 文件被加入上传队列时触发
                file_queue_error_handler: fileQueueError,  // 文件加入上传队列失败时触发
                file_dialog_complete_handler: fileDialogComplete,  // 选择文件对话框关闭时触发
                // upload_start_handler: uploadStart,  // 文件开始上传时触发
                // upload_progress_handler: uploadProgress,  // 文件上传过程中定时触发，显示文件上传进度
                upload_success_handler: uploadSuccess,  // 文件上传成功后触发
                upload_error_handler: uploadError,  //文件上传出错时触发

                button_placeholder_id: 'upload',
                button_text: '<span class="button-text">上传新头像</span>',
                button_text_style: '.button-text{color: #333333; font-family: "微软雅黑"; font-size:16px;}',
                button_text_left_padding: 12,
                button_text_top_padding: 4,
                button_width: 110,
                button_height: 34,
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
            }

            /**
             * 文件上传成功后的回调
             * @param file 上传的文件
             * @param serverData 服务器在执行完接收文件方法后返回的数据
             * @param response{Boolean}, 表示是否服务器返回数据
             */
            var cutter = null;
            function uploadSuccess(file, serverData, response) {
                var res = JSON.parse(serverData);
                if(res.state != undefined && res.state == 'SUCCESS') {
                    var $logoUrl = $('#logo').find('[name="logoUrl"]');
                    $logoUrl.val(res.oriUrl);
                    $logoUrl.next().text('');
                    cutter.reload(res.oriUrl);
                }
            }
            
            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
            
            cutter = new UtrialAvatarCutter({
                    //主图片所在容器ID
                    content : "picture_original",

                    //缩略图配置,ID:所在容器ID;width,height:缩略图大小
                    purviews : [{id:"picture_118",width:118,height:118}],

                    //选择器默认大小
                    selector : {width:118,height:118}
                }
            );
            
            $('#submitLogo').click(function() {
                var $form = $('#logo').find('form'),
                    $logoUrl = $form.find('[name="logoUrl"]');
                
                if(_.isEmpty($logoUrl.val())) {
                    $logoUrl.next().text('请先选择公会头像');
                    return false;
                } else {
                    $logoUrl.next().text('');
                }
                ajax.post($form.attr('action'), cutter.submit(), function(result) {
                    if(result.success){
                        dd.alert('修改成功！', function() {
                            window.location.reload(false);
                        });
                    }else{
                        dd.alert(result.error);
                    }
                });
                return false;
            });
        },
    };
    
    Guild.init();
});