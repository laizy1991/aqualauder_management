/**
 * @description: 英雄管理页面交互
 * @author: lox@warthog.cn
 * @date: 2015-05-05
 */

define(function(require) {
    require('../common/common');
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    
    var Hero = {
        init: function() {
        	this.isBindFileUpload = false;  // 是否已经绑定上传组件
        	this.addHero($('[role="add"]'));
        	this.editHero($('[role="edit"]'));
        	this.extendHero($('[role="extend"]'));
        },
        
        /**
         * 添加英雄
         */
        addHero: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'addDialog',
                    title: '添加英雄',
                    content: document.getElementById('addDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $shortName = $form.find('#shortName'),
                                    $fullName = $form.find('#fullName'),
                                    gameId=$('#gameId').val(),
                                    $msg = this.__popup.find('.msg');

                                var shortName = $.trim($shortName.val());  // 游戏名称
                                $msg.hide();

                                if (_.isEmpty(shortName)) {
                                    $msg.html('英雄名称不能为空!').show();
                                    return false;
                                }                            
                                
                                ajax.post($form.attr('action'), $form.serialize()+"&gameId="+gameId, function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，英雄添加成功！', function(){
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
                
                $('#enName').change(function() {
                	var enName = $('#enName').val();
                	$.ajax({
                        type:'POST',
                        async:false,
                        data:{'enName':enName},
                        url:'/ajax/Hero/isEnNameUsed',
                        dataType:'json',
                        success:function(result){
                            if(result.error){
                            	$('#enName').val('');
                                dd.alert('英文名:' + enName + '已存在');
                            }
                        }
                	});
                });
                
            });
        },
        
        /**
         * 编辑英雄
         */
        editHero: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                heroId = $this.closest('[role="edit"]').attr("targetId"),
                heroInfo;
                
                $.ajax({
                    type:'POST',
                    async:false,
                    data:{'heroId':heroId},
                    url:'/ajax/Hero/findById',
                    dataType:'json',
                    success:function(result){
                        if(result.success){
                            heroInfo = result.data;
                        }
                    }
                });


                var editDialog = dialog({
                    id: 'editDialog',
                    title: '编辑英雄',
                    content: document.getElementById('editDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $shortName = $form.find('#shortName'),
                                    $fullName = $form.find('#fullName'),
                                    gameId=$('#gameId').val(),
                                    $msg = this.__popup.find('.msg');

                                var shortName = $.trim($shortName.val());
                                $msg.hide();

                                if (_.isEmpty(shortName)) {
                                    $msg.html('英雄名称不能为空!').show();
                                    return false;
                                }
                                
                                ajax.post($form.attr('action'), $form.serialize()+"&heroId="+heroId, function(result){
                                    if(result.success){
                                    	editDialog.close();
                                        dd.alert('恭喜，英雄更新成功！', function(){
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
                    	$("#enName").val(heroInfo.enName);
                    	$("#shortName").val(heroInfo.shortName);
                    	$("#fullName").val(heroInfo.fullName);
                    	$("#priceGold").val(heroInfo.priceGold);
                    	$("#priceCoupons").val(heroInfo.priceCoupons);
                    	$("#funAttack").val(heroInfo.funAttack);
                    	$("#funMagic").val(heroInfo.funMagic);
                    	$("#funDefense").val(heroInfo.funDefense);
                    	$("#funOpt").val(heroInfo.funOpt);
                    	$("#picPreview").attr("src",heroInfo.iconUrl);
                    	$("#logoUrl").val(heroInfo.iconUrl);
                    	$("input[name='heroType']:eq(0)").attr("checked",(heroInfo.heroType & 1) != 0);
                    	$("input[name='heroType']:eq(1)").attr("checked",(heroInfo.heroType & 2) != 0);
                    	$("input[name='heroType']:eq(2)").attr("checked",(heroInfo.heroType & 4) != 0);
                    	$("input[name='heroType']:eq(3)").attr("checked",(heroInfo.heroType & 8) != 0);
                    	$("input[name='heroType']:eq(4)").attr("checked",(heroInfo.heroType & 16) != 0);
                    	$("input[name='heroType']:eq(5)").attr("checked",(heroInfo.heroType & 32) != 0);
                    	$("input[name='position']:eq(0)").attr("checked",(heroInfo.position & 1) != 0);
                    	$("input[name='position']:eq(1)").attr("checked",(heroInfo.position & 2) != 0);
                    	$("input[name='position']:eq(2)").attr("checked",(heroInfo.position & 4) != 0);
                    	$("input[name='position']:eq(3)").attr("checked",(heroInfo.position & 8) != 0);
                    	$("input[name='position']:eq(4)").attr("checked",(heroInfo.position & 16) != 0);
                        $msg = this.__popup.find('.msg');
                        if (!self.isBindFileUpload) {
                            self.fileUpload();
                        }
                    }

                }).showModal();
                
                $('#enName').change(function() {
                	var enName = $('#enName').val();
                	$.ajax({
                        type:'POST',
                        async:false,
                        data:{'enName':enName},
                        url:'/ajax/Hero/isEnNameUsed',
                        dataType:'json',
                        success:function(result){
                            if(result.error){
                            	$('#enName').val('');
                                dd.alert('英文名:' + enName + '已存在');
                            }
                        }
                	});
                });
                
            });
        },
        
        /**
         * 英雄扩展信息
         */
        extendHero: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                heroId = $this.closest('[role="extend"]').attr("targetId"),
                extendInfo;
                
                $.ajax({
                    type:'POST',
                    async:false,
                    data:{'heroId':heroId},
                    url:'/ajax/Hero/findDetailById',
                    dataType:'json',
                    success:function(result){
                        if(result.success){
                        	extendInfo = result.data;
                        }
                    }
                });


                var extendDialog = dialog({
                    id: 'extendDialog',
                    title: '英雄扩展信息',
                    content: document.getElementById('extendDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $msg = this.__popup.find('.msg');

                                $msg.hide();
                                
                                ajax.post($form.attr('action'), $form.serialize()+"&heroId="+heroId, function(result){
                                    if(result.success){
                                    	extendDialog.close();
                                        dd.alert('恭喜，英雄扩展信息更新成功！', function(){
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
                    	if (extendInfo != undefined) {
                    		$("#story").val(extendInfo.story);
                        	$("#skillDesc").val(extendInfo.skillDesc);
                        	$("#picPreview").attr("src",extendInfo.backgroudUrl);
                        	$("#logoUrl").val(extendInfo.backgroudUrl);
                    	}
                    	
                        $msg = this.__popup.find('.msg');
                        if (!self.isBindFileUpload) {
                            self.fileUpload();
                        }
                    }

                }).showModal();               
            });
        },
        
        /**
         * 更新头像
         */
        fileUpload: function() {
            this.isBindFileUpload = true;
            var sid=$('#sid').val();
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/image/upload',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
                // use_query_string: true,  // 是否允许传递参数
                post_params: {sid:sid},  // 传递给后台的参数

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
            	var enName = $('#enName').val();
            	
            	if(enName == '') {
            		dd.alert('请先填写英文名 ！');
            		return false;
            	}
            	
            	//提交图片存储路径
            	this.setPostParams({sid:sid,path:'/lol/hero/'+enName });
            	
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
            function uploadSuccess(file, serverData, response) {
                var res = JSON.parse(serverData);
                if(res.data.state != undefined && res.data.state == 'SUCCESS') {
                    $('#picPreview').attr('src', res.data.imgUrl).next().val(res.data.imgUrl);
                }
            }

            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        },

    };
    
    Hero.init();
});