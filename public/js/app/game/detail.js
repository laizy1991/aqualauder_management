/**
 * @description: 游戏数据页面交互
 * @author: lox@warthog.cn
 * @date: 2015-04-30
 */

define(function(require) {
	require('../common/common');  // 公共模块
    require('../../thirdParty/underscore');
    require('../common/module/selectRange');  // 设置光标
    
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');

    var pagination = require('../common/module/pagination');  // ajax分页插件
    var template = require('../common/module/template_native');  // js模板引擎
    var topicDialog = require('../common/module/postsDialog');
    
    var firstClickIntro = false;
    
    var Detail = {
    		init: function () {
                this.switchTab();
                this.initIntro();
                this.initSetting();
                this.initExtend();
                this.initImgUpload();
                this.initMobileBannerUpload();
                this.initPcBannerUpload();
                this.initscreenshotEditor();
                this.initHScreenshotEditor();
                this.initPosts();
                this.addTopic();
                this.deleteTopic($('[role="delete"]'));
                this.moveUp($('[role="moveUp"]'));
                this.moveDown($('[role="moveDown"]'));
                this.updateCover($('[role="updateCover"]'));
                this.btnUpdateGame($('[role="updateGame"]'));
            },
            
            /**
             * 选项卡切换
             */
            switchTab: function() {
                $('.tab-item a').click(function() {
                    var $this = $(this),
                        $tabItem = $this.closest('.tab-item'),
                        id = $this.attr('_href');

                    $tabItem.addClass('current').siblings().removeClass('current');
                    $('#' + id).show().siblings('.flag').hide();
                    
                    if(id == 'intro' && !firstClickIntro) {
                       
                        firstClickIntro = true;
                    }
                    return false;
                });
            },
            
            initIntro: function() {
                var maxSummary = 500;
                
                var summaryEditor = UM.getEditor('summary', {
                    toolbar:[],
                    wordCount: maxSummary
                });
                
                $('#submitIntro').click(function(){
                    var $form = $('#intro').find('form'),
                        summaryContentLen = summaryEditor.getContentLength(true),
                        gameId=$('#gameId').val();
                    
                    if(summaryContentLen > maxSummary) {
                        $form.find('[role="errorSummary"]').text('游戏简介字数过长');
                        return false;
                    } else {
                        $form.find('[role="errorSummary"]').text('');
                    }
                    
                    ajax.post($form.attr('action'), {gameId: gameId,summary: summaryEditor.getContentTxt()}, function(result) {
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
                        $name = $form.find('[name="name"]'),
                        gameId=$('#gameId').val();
                    
                    if(_.isEmpty($name.val())) {
                        $name.next().text('游戏名称为必填项');
                        return false;
                    } else {
                        $name.next().text('');
                    }
                    
                    if($name.val().length > 25) {
                        $name.next().text('游戏名称字数过长');
                        return false;
                    } else {
                        $name.next().text('');
                    }
                    
                    ajax.post($form.attr('action'), $form.serialize() + "&gameId="+gameId, function(result) {
                        if(result.success){
                            dd.alert('修改成功！');
                        }else{
                            dd.alert(result.error);
                        }
                    });
                    
                    return false;
                });
            },
            
            initExtend: function() {
                var maxExtend = 500;
                
                var extendEditor = UM.getEditor('extAttrs', {
                    toolbar:[],
                    wordCount: maxExtend
                });
                
                $('#submitExtend').click(function(){
                    var $form = $('#extend').find('form'),
                    	extendContentLen = extendEditor.getContentLength(true),
                        gameId=$('#gameId').val();
                    
                    if(extendContentLen > maxExtend) {
                        $form.find('[role="errorExtend"]').text('游戏扩展字数过长');
                        return false;
                    } else {
                        $form.find('[role="errorExtend"]').text('');
                    }
                    
                    ajax.post($form.attr('action'), {gameId: gameId, extend: extendEditor.getContentTxt()}, function(result) {
                        if(result.success){
                            dd.alert('修改成功！');
                        }else{
                            dd.alert(result.error);
                        }
                    });
                    
                    return false;
                });
                
            },
            
            /**
             * 初始化文本框插件
             */
            initscreenshotEditor: function() {
                var screenshotEditor = UM.getEditor('screenshotEditor', {
                    toolbar:[
                        'redo undo ',
                        'image fullscreen | cleardoc selectall source'
                    ],
                });

                var tempContent=$("#tempContent").val();
                var urls = tempContent.split(",");
                var tempContent2 = "";
                for (var i = 0; i < urls.length; i++) {
                	var tmpImg = "<p><img src='" + urls[i] + "' ></p>";
                	tempContent2 += tmpImg;
                }
                
                screenshotEditor.setContent(tempContent2);

                $('#submitScreenshot').click(function(){
                    var content = screenshotEditor.getContent(),
                        contentLen = screenshotEditor.getContentLength(true);

                    if(_.isEmpty(content)) {
                        $('.editor-wrap').find('.error-msg').text('随便说点什么吧');
                        return false;
                    } else {
                        $('.editor-wrap').find('.error-msg').text('');
                    }
                    
                    var $form=$("#screenshotForm");
                    var gameId=$('#gameId').val();
                    ajax.post($form.attr('action'), $form.serialize()+"&gameId="+gameId, function(result){
                        if(result.success){
                            dd.alert('更新成功！', function(){
                            });
                        }else{
                            dd.alert(result.error);
                        }
                    });
                    return false;
                });

            },
            
            /**
             * 初始化横屏截图编辑插件
             */
            initHScreenshotEditor: function() {
                var screenshotEditor = UM.getEditor('hScreenshotEditor', {
                    toolbar:[
                        'redo undo ',
                        'image fullscreen | cleardoc selectall source'
                    ],
                });

                var tempContent=$("#hTempContent").val();
                var urls = tempContent.split(",");
                var hTempContent2 = "";
                for (var i = 0; i < urls.length; i++) {
                	var tmpImg = "<p><img src='" + urls[i] + "' ></p>";
                	hTempContent2 += tmpImg;
                }
                
                screenshotEditor.setContent(hTempContent2);

                $('#submitHScreenshot').click(function(){
                	var content = screenshotEditor.getContent(),
                    	contentLen = screenshotEditor.getContentLength(true);

                    if(_.isEmpty(content)) {
                        $('.editor-wrap').find('.error-msg').text('随便说点什么吧');
                        return false;
                    } else {
                        $('.editor-wrap').find('.error-msg').text('');
                    }
                    
                    var $form=$("#hScreenshotForm");
                    var gameId=$('#gameId').val();
                    ajax.post($form.attr('action'), $form.serialize()+"&gameId="+gameId, function(result){
                        if(result.success){
                            dd.alert('更新成功！', function(){
                            });
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
                    button_text: '<span class="button-text">上传新图标</span>',
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
                	var id = $('#gameId').val();
                	
                	if(id == '') {
                		dd.alert('请先填写ID ！');
                		return false;
                	}
                	
                	//提交图片类型与id
                	this.setPostParams({sid:sid, path:'/game/'+id,type:1 });
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
                    if(res.data.state != undefined && res.data.state == 'SUCCESS') {
                        var $logoUrl = $('#logo').find('[name="logoUrl"]');
                        $logoUrl.val(res.data.imgUrl);
                        $logoUrl.next().text('');
                        var $picture = $('#logo').find('#picture_original');
                        $picture.attr("src", res.data.imgUrl);
                        //cutter.reload(res.data.imgUrl);
                    }
                }
                
                function uploadError() {
                    dd.alert('上传失败，请重试！');
                }
                
                $('#submitLogo').click(function() {
                    var $form = $('#logo').find('form'),
                        $logoUrl = $form.find('[name="logoUrl"]'),
                        gameId=$('#gameId').val();
                    
                    if(_.isEmpty($logoUrl.val())) {
                        $logoUrl.next().text('请先选择图标');
                        return false;
                    } else {
                        $logoUrl.next().text('');
                    }
                    
                    var submit = "gameId=" + gameId + "&logoUrl=" + $logoUrl.val();
                    
                    ajax.post($form.attr('action'), submit, function(result) {
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

            initPosts: function () {

            },
            /**
             * 添加视频帖子
             */
            addTopic: function() {
                var self = this,
                    gameId = $("#gameId").val();

                $('[role="addTopic"]').click(function() {
                    var $this = $(this);
                    var url='/ajax/posts/list?hasVideo=2&gameId='+gameId;
                    topicDialog.create({
                        limit: 3,
                        postsDataUrl:url,
                        onAccept: function(sortedList, selectedList) {
                            $('.topic-list').html(template('selectedTopicTmpl', {'list': sortedList, 'selectedList': selectedList}));
                            self.deleteTopic($('.topic-wrap').find('[role="delete"]'));
                            self.moveUp($('.topic-wrap').find('[role="moveUp"]'));
                            self.moveDown($('.topic-wrap').find('[role="moveDown"]'));
                            self.updateCover($('.topic-wrap').find('[role="updateCover"]'));

                            $('#selectedId').val(sortedList.join(','));
                            $('#topic').find('.error-msg').text('');
                            $('.topic-wrap').removeClass('none-topic');
                        }
                    }).showModal();
                });
            },

        /**
         * 删除话题
         */
        deleteTopic: function(obj) {
            var self = this,
                $obj = obj;

            $obj.click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    length = $('.topic-list li').length;

                if (length === 1) {
                    $this.closest('.topic-wrap').addClass('none-topic');

                } else if (length === 2) {
                    $('.topic-list li:first').find('[role="moveDown"]').remove();
                }

                if ($li.index() === 0) {
                    //$li.next('li').prepend($li.find('.pic').clone()).addClass('first');
                    $li.next('li').prepend($li.find('.pic').clone());
                    $li.next('li').find('.opt-btns').remove().end().append($li.find('.opt-btns').clone(true));

                } else if (length > 2 && $li.index() === length - 1) {
                    $li.prev('li').find('.opt-btns').replaceWith($li.find('.opt-btns').detach());
                }

                topicDialog.deleteSelectedData($li.attr('data-id'));

                $('#selectedId').val(topicDialog.getSortedList().join(','));
                $li.remove();
            });
        },

        /**
         * 上移话题
         */
        moveUp: function(obj) {
            var self = this,
                $obj = obj;

            $obj.click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    $prevLi = $li.prev('li'),
                    length = $('.topic-list li').length;

                if ($prevLi.index() === 0) {
                    var $liOptBtns = $li.find('.opt-btns').clone(true);
                    //$li.addClass('first').find('.opt-btns').replaceWith($prevLi.find('.opt-btns').clone(true));
                    $li.find('.opt-btns').replaceWith($prevLi.find('.opt-btns').clone(true));
                    $prevLi.removeClass('first').find('.opt-btns').replaceWith($liOptBtns);

                } else if ($li.index() === length - 1) {
                    var $liOptBtns = $li.find('.opt-btns').clone(true);
                    $li.find('.opt-btns').replaceWith($prevLi.find('.opt-btns').clone(true));
                    $prevLi.find('.opt-btns').replaceWith($liOptBtns);
                }

                topicDialog.moveTopic($li.attr('data-id'), true);
                $('#selectedId').val(topicDialog.getSortedList().join(','));
                $li.detach().insertBefore($prevLi);
            });
        },

        /**
         * 下移话题
         */
        moveDown: function(obj) {
            var self = this,
                $obj = obj;

            $obj.click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    $nextLi = $li.next('li')
                length = $('.topic-list li').length;

                if ($nextLi.index() === 1) {
                    var $liOptBtns = $li.find('.opt-btns').clone(true);
                    //$li.removeClass('first').find('.opt-btns').replaceWith($nextLi.find('.opt-btns').clone(true));
                    //$nextLi.addClass('first').find('.opt-btns').replaceWith($liOptBtns);
                    $li.find('.opt-btns').replaceWith($nextLi.find('.opt-btns').clone(true));
                    $nextLi.find('.opt-btns').replaceWith($liOptBtns);

                } else if ($nextLi.index() === length - 1) {
                    var $liOptBtns = $li.find('.opt-btns').clone(true);
                    $li.find('.opt-btns').replaceWith($nextLi.find('.opt-btns').clone(true));
                    $nextLi.find('.opt-btns').replaceWith($liOptBtns);
                }

                topicDialog.moveTopic($li.attr('data-id'), false);
                $('#selectedId').val(topicDialog.getSortedList().join(','));
                $li.detach().insertAfter($nextLi);
            });
        },

        /**
         * 修改帖子视频封面
         */
        updateCover: function(obj) {
            var self = this,
                $upfile = $("#upfile"),
                $obj = obj;

            $obj.click(function() {
                var $this = $(this),
                    $li = $this.closest('li');


                $upfile.trigger("click");
                $upfile.change(function () {
                    if($upfile.val()!=""){
                        $("#updateVideocoverForm").ajaxSubmit({
                            url: "/ajax/image/upload",
                            dataType: "json",
                            success: function(result) {
                                $upfile.unbind("change");
                                $upfile.val('');
                                var imgUrl=result.data.imgUrl;
                                var params = {
                                    "postsId":$li.attr("data-id"),
                                    "videoCover":imgUrl
                                };
                                ajax.post("/ajax/Posts/updateVideocover",params, function (result) {
                                    if(result.success){
                                        var $cover = $li.find(".face");
                                        $cover.attr("src",imgUrl);
                                    }else{
                                        dd.alert("视频封面更新失败！");
                                    }
                                });
                            },error: function () {
                                dd.alert("视频封面更新失败！");
                            }
                        });
                    }
                });
            });
        },

        /**
         * 修改game视频帖子
         */
        btnUpdateGame: function (obj) {
            var self = this,
                errMsg = $(".error-msg"),
                $obj = obj;

            $obj.click(function () {
                var length = $(".topic-list").find("li").length;
                var errTxt = "请选择3个帖子！"
                if(length!=3){
                    errMsg.text("请选择3个帖子！");
                }else{
                    errMsg.text("");
                    errTxt = "";
                }
                var index = 0;
                var ids = new Array();
                $(".topic-list").find("li").each(function () {
                    index ++;
                    var imgUrl = $(this).find(".face").attr("src");
                    if(imgUrl=="" || imgUrl=="null"){
                        errMsg.html(errTxt+"<br>第"+index+"个帖子视频封面不能为空!");
                    }
                    var postsId = $(this).attr("data-id");
                    ids.push(postsId);
                });
                var params = {
                    "gameId":$("#gameId").val(),
                    "postsIds":ids.toString()
                }
                ajax.post("/ajax/Game/updateVideocover",params, function (result) {
                    if(result.success){
                        dd.alert("更新成功!");
                        window.location.reload(false);
                    }else{
                        dd.alert("更新失败!");
                    }
                });
            });
        },
        
        initPcBannerUpload: function() {
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
                file_queue_error_handler: fileQueueError,  // 文件加入上传队列失败时触发
                file_dialog_complete_handler: fileDialogComplete,  // 选择文件对话框关闭时触发
                upload_success_handler: uploadSuccess,  // 文件上传成功后触发
                upload_error_handler: uploadError,  //文件上传出错时触发

                button_placeholder_id: 'upload_pc_b',
                button_text: '<span class="button-text">上传PC banner</span>',
                button_text_style: '.button-text{color: #333333; font-family: "微软雅黑"; font-size:16px;}',
                button_text_left_padding: 4,
                button_text_top_padding: 4,
                button_width: 130,
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
            	var id = $('#gameId').val();
            	
            	if(id == '') {
            		dd.alert('请先填写ID ！');
            		return false;
            	}
            	
            	//提交图片类型与id
            	this.setPostParams({sid:sid, path:'/game/'+id,type:1 });
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
                if(res.data.state != undefined && res.data.state == 'SUCCESS') {
                    var $bannerUrl = $('#banner').find('[name="pcBannerUrl"]');
                    $bannerUrl.val(res.data.imgUrl);
                    $bannerUrl.next().text('');
                    var $picture = $('#banner').find('#pc_picture_original');
                    $picture.attr("src", res.data.imgUrl);
                    //cutter.reload(res.data.imgUrl);
                }
            }
            
            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
            
        },
        initMobileBannerUpload: function() {
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
                file_queue_error_handler: fileQueueError,  // 文件加入上传队列失败时触发
                file_dialog_complete_handler: fileDialogComplete,  // 选择文件对话框关闭时触发
                upload_success_handler: uploadSuccess,  // 文件上传成功后触发
                upload_error_handler: uploadError,  //文件上传出错时触发

                button_placeholder_id: 'upload_m_b',
                button_text: '<span class="button-text">上传手机banner</span>',
                button_text_style: '.button-text{color: #333333; font-family: "微软雅黑"; font-size:16px;}',
                button_text_left_padding: 4,
                button_text_top_padding: 4,
                button_width: 130,
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
            	var id = $('#gameId').val();
            	
            	if(id == '') {
            		dd.alert('请先填写ID ！');
            		return false;
            	}
            	
            	//提交图片类型与id
            	this.setPostParams({sid:sid, path:'/game/'+id,type:1 });
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
                if(res.data.state != undefined && res.data.state == 'SUCCESS') {
                    var $bannerUrl = $('#banner').find('[name="mBannerUrl"]');
                    $bannerUrl.val(res.data.imgUrl);
                    $bannerUrl.next().text('');
                    var $picture = $('#banner').find('#m_picture_original');
                    $picture.attr("src", res.data.imgUrl);
                    //cutter.reload(res.data.imgUrl);
                }
            }
            
            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
            
            $('#submitBanner').click(function() {
                var $form = $('#banner').find('form'),
                $pcBannerUrl = $form.find('[name="pcBannerUrl"]'),
                $mobileBannerUrl = $form.find('[name="mBannerUrl"]'),
                    gameId=$('#gameId').val();
                if(_.isEmpty($pcBannerUrl.val())) {
                    $pcBannerUrl.next().text('请先选择图标');
                    return false;
                }
                if(_.isEmpty($mobileBannerUrl.val())) {
                    $mobileBannerUrl.next().text('请先选择图标');
                    return false;
                }

                $pcBannerUrl.next().text('');
                $mobileBannerUrl.next().text('');
                    
                
                var submit = "gameId=" + gameId + "&pcBannerUrl=" + $pcBannerUrl.val() + "&mobileBannerUrl=" + $mobileBannerUrl.val();
                console.log(submit);
                ajax.post($form.attr('action'), submit, function(result) {
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
        }
    };
    
    Detail.init();
});