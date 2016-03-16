/**
 * @description: 组织架构页面交互
 * @author: zhongna
 * @date: 2014-09-11
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    var template = require('../common/module/template_native');

    var Organize = {
        init: function() {
            this.folding();
            this.isBindFileUpload = false;  // 是否已经绑定上传组件
            this.createGroup($('[role="create"]'));
            this.editCategory($('[role="edit"]'));
            this.deleteCategory($('[role="delete"]'));
            this.updateGroup($('[role="update"]'))
            this.addCategory();
            this.sortable();
            this.checkAll();
            this.initSortButton();
            this.setAdmin();
            this.fire();
            this.batchFire();
            this.changeGagged();
            this.setCard();
        },
        
        /**
         * 初始化表格排序列 
         */
        initSortButton: function() {
            $('.order').click(function() {
                var $this = $(this),
                    $b = $this.find('b'),
                    inputName = $this.attr("role");
                if($b.hasClass('icon-order-asc')) {
                    $b.removeClass('icon-order-asc').addClass('icon-order-desc');
                    $('#' + inputName).val(false);
                } else {
                    $b.removeClass('icon-order-desc').addClass('icon-order-asc');
                    $('#' + inputName).val(true);
                }
                //guozy 另一个排序的值为null---begin
                var objs=new Array();
                objs=$('.order');
                if(objs!=undefined&&objs.length>0){
	                for(var i=0;i<objs.length;i++){
	                	var other=objs[i];
	                	if($(other).attr('role')!=inputName){
	                		var otherInputName=$(other).attr('role');
	                		$('#'+otherInputName).val(null);
	                	}
	                }
                }//----------end
                $('#filterForm').submit();
            });
        },
        
        /**
         * 全选、反选效果
         */
        checkAll: function() {
            var $ckAll = $('[role="ckAll"]'),
                $ck = $('[role="ck"]:not(":disabled")'),
                $ckNum = $('[role="ckNum"]');

            var isCheckAll;

            // 点击ckAll
            $ckAll.click(function() {
                isCheckAll = $ckAll.prop('checked');

                $ck.prop('checked', isCheckAll);

                if (isCheckAll) {
                    $ck.closest('tr').addClass('selected');
                    $ckNum && $ckNum.html($ck.length);

                } else {
                    $ck.closest('tr').removeClass('selected');
                    $ckNum && $ckNum.html(0);
                }
            });

            // 点击ck
            $ck.click(function() {
                var $curCk = $(this),
                    isChecked = $curCk.prop('checked');

                $curCk.closest('tr').toggleClass('selected');

                if (isChecked) {
                    isCheckAll = true;
                    $ckNum && $ckNum.html(parseInt($ckNum.text()) + 1);

                    $ck.each(function() {
                        if (!$(this).prop('checked')) {
                            isCheckAll = false;
                        }
                    });

                } else {
                    isCheckAll = false;
                    $ckNum && $ckNum.html(parseInt($ckNum.text()) - 1);
                }

                $ckAll.prop('checked', isCheckAll);
            });
        },

        /**
         * 折叠面板
         */
        folding: function() {
            $('.folded-toggle').click(function() {
                $(this).closest('.folded-panel').toggleClass('open');
            });

            // 组织冒泡
            $('.folded-toggle .opt').click(function(e) {
                e.stopPropagation();
            });
        },
        
         /**
         * 添加分组
         */
        addCategory: function() {
            var self = this;

            $('[role="add"]').click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'addDialog',
                    title: '添加游戏',
                    content: document.getElementById('addDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $newGroupName = this.__popup.find('#newGroupName'),
                                    $gameName = this.__popup.find('.game-name')
                                    $gameId = $form.find('[role="gameId"]'),
                                    $msg = this.__popup.find('.msg');

                                var newGroupName = $.trim($newGroupName.val());  // 分组名称
                                $msg.hide();

                                if (_.isEmpty(newGroupName)) {
                                    $msg.html('分组名称不能为空!').show();
                                    return false;
                                }
                                
                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，分组添加成功！', function(){
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
                        self.bindGameDialog && self.bindGameDialog.close().remove();
                    },
                    onshow: function() {
                        var $bindGame = this.__popup.find('[role="bindGame"]'),
                            $msg = this.__popup.find('.msg');

                        self.bindGame($bindGame, this);
                    }

                }).showModal();
            });
        },

        /**
         * 选择绑定游戏
         */
        bindGame: function(obj, dialogObj) {
            var self = this;

            obj.off().on('click', function() {
                var $this = $(this),
                    url = $this.data('url');

                dialogObj.close();
                self.bindGameDialog = dialog({
                    id: 'bindGameDialog',
                    title: '选择绑定游戏',
                    skin: 'remove-body-padding',
                    content: document.getElementById('bindGameDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var $radio = this.__popup.find(':radio:checked');

                                if ($radio.length) {
                                    dialogObj.__popup.find('[role="gameId"]').val($radio.val());
                                    dialogObj.__popup.find('.game-name').text($radio.siblings('.name').text());
                                    $this.text('修改').addClass('modify-game');
                                }
                                this.close();
                                dialogObj.showModal();
                                return false;
                            },
                            autofocus: true
                        }
                    ],
                    onshow: function() {
                        self.searchGames(this.__popup.find('.search-combobox-form'));
                    }, 
                    cancelValue: '取消',
                    cancel: function() {
                        this.close();
                        dialogObj.showModal();
                        return false;
                    }
                }).showModal();
                
                ajax.get(url, function(res){
                    self.bindGameDialog.__popup.find('.game-wrap').html(template('gameListDialogTmpl', res));
                });

            });
        },

        /**
         * 搜索游戏
         */
        searchGames: function(form) {
            form.off().on('submit', function() {
                var url = form.attr('action'),
                    keyword = form.find('.search-combobox-input').val();
                
                ajax.get(url + '?keyword=' + encodeURIComponent(keyword), function(res) {
                    if (res.data.list != undefined && res.data.list.length > 0) {
                        form.closest('.search-bar').siblings('.game-wrap').html(template('gameListDialogTmpl', res));
                    } else {
                        form.closest('.search-bar').siblings('.game-wrap').html('<p style="text-align:center;">抱歉，没有搜索到任何结果！</p>');
                    }
                });
                return false;
            });
        },

        /**
         * 创建群
         */
        createGroup: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('.folded-panel'),
                    $hiddenInputs = $wrap.find('input:hidden');

                var createDialog = dialog({
                    id: 'createDialog',
                    title: '创建群',
                    content: document.getElementById('createDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form'),
                                    $text = dia.__popup.find('.in-t'),
                                    $msg = $text.siblings('.msg');

                                $msg.hide();

                                if ($.trim($text.val()) == '') {
                                    $msg.show();
                                    return false;
                                }
                                
                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        dia.close();
                                        dialog({
                                            title: '提示',
                                            content: document.getElementById('tipsDialogTmpl').innerHTML,
                                            button: [{
                                                value: '发小喇叭',
                                                autofocus: true,
                                                callback: function() {
                                                    window.location.href = '/message/post';
                                                    return false;
                                                }
                                            }, {value: '取消'}],
                                            onclose: function() {
                                                window.location.reload(false);
                                            }
                                        }).showModal();
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
                        self.bindGameDialog && self.bindGameDialog.close().remove();
                    },
                    onshow: function() {
                        var $bindGame = this.__popup.find('[role="bindGame"]');
                        
                        if ($hiddenInputs.length) {
                            this.__popup.find('form').append($hiddenInputs.clone());
                        }
                        
                        self.bindGame($bindGame, this);
                        
                        if (!self.isBindFileUpload) {
                            self.fileUpload();
                        }
                    }

                }).showModal();
            });
        },
        
        /**
         * 创建群
         */
        updateGroup: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('.folded-panel'),
                    $hiddenInputs = $wrap.find('input:hidden');

                var updateDialog = dialog({
                    id: 'updateDialog',
                    title: '编辑群',
                    content: document.getElementById('updateDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form'),
                                    $text = dia.__popup.find('.in-t'),
                                    $msg = $text.siblings('.msg');

                                $msg.hide();

                                if ($.trim($text.val()) == '') {
                                    $msg.show();
                                    return false;
                                }
                                
                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        dia.close();
                                        dd.alert('修改成功');
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
                        self.bindGameDialog && self.bindGameDialog.close().remove();
                    },
                    onshow: function() {
                        var $bindGame = this.__popup.find('[role="bindGame"]');
                        
                        if ($hiddenInputs.length) {
                            this.__popup.find('form').append($hiddenInputs.clone());
                        }
                        
                        self.bindGame($bindGame, this);
                        
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
                post_params: {zoom:96, sid:sid},  // 传递给后台的参数

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
                button_text: '<span class="button-text">更新头像</span>',
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
            }

            /**
             * 文件上传成功后的回调
             * @param file 上传的文件
             * @param serverData 服务器在执行完接收文件方法后返回的数据
             * @param response{Boolean}, 表示是否服务器返回数据
             */
            function uploadSuccess(file, serverData, response) {
                var res = JSON.parse(serverData);
                if(res.state != undefined && res.state == 'SUCCESS') {
                    $('#picPreview').attr('src', res.oriUrl).next().val(res.oriUrl);
                }
            }

            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        },

        /**
         * 编辑分组
         */
        editCategory: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('.folded-panel'),
                    $groupName = $wrap.find('.group-name'),
                    groupName = $groupName.text(),
                    $hiddenInputs = $wrap.find('input:hidden');

                var editDialog = dialog({
                    id: 'editDialog',
                    title: '编辑分组名称',
                    content: document.getElementById('editDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form'),
                                    $categoryNameInput = dia.__popup.find('#categoryName');

                                if (_.isEmpty($.trim($categoryNameInput.val()))) {
                                    $categoryNameInput.next().text('分组名称为必填项');
                                } else {
                                    ajax.post($form.attr('action'), $form.serialize(), function(result) {
                                        if(result.success){
                                            editDialog.close().remove();
                                            dd.alert('修改成功！', function(){
                                                $groupName.text($categoryNameInput.val());
                                            });
                                        }else{
                                            dd.alert(result.error);
                                        }
                                    });
                                } 
                                return false;
                            },
                            autofocus: true
                        },
                        {
                            value: '取消'
                        }
                    ],
                    onshow: function() {
                        this.__popup.find('#categoryName').val(groupName);
                        
                        if ($hiddenInputs.length) {
                            this.__popup.find('form').append($hiddenInputs.clone());
                        }
                    }

                }).showModal();
            });
        },

        /**
         * 删除分组
         */
        deleteCategory: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('.folded-panel'),
                    groupName = $wrap.find('.group-name').text(),
                    $hiddenInputs = $wrap.find('input:hidden');

                var deleteDialog = dialog({
                    id: 'deleteDialog',
                    title: '删除分组',
                    content: document.getElementById('deleteDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var $form = this.__popup.find('form');
                                
                                ajax.post($form.attr('action'), $form.serialize(), function(result) {
                                    if(result.success){
                                        deleteDialog.close();
                                        dd.alert('删除成功！', function(){
                                            window.location.reload(false);
                                        });
                                    }else{
                                        dd.alert(result.error);
                                    }
                                });
                                return false;
                            },
                            autofocus: true
                        },
                        {
                            value: '取消'
                        }
                    ],
                    onshow: function() {
                        if ($hiddenInputs.length) {
                            this.__popup.find('form').append($hiddenInputs.clone());
                        }
                        this.__popup.find('span').text(groupName);
                    }
                }).showModal();
            });
        },
        
        /**
         * 拖动排序
         */
        sortable: function() {
            var sender;

            $('#sortable').sortable({
                opacity: 0.7,
                cursor: 'move',
                update: function(event, ui) {
                    var categoryIds = ''; // 分组ID

                    $('#sortable').find('[name="categoryId"]').each(function() {
                        categoryIds = categoryIds + $(this).val() + ','
                    });
                    categoryIds = categoryIds.substring(0, categoryIds.length - 1);
                    ajax.post('/ajax/group/saveOrder', {categoryIds: categoryIds}, function(){})
                }
            });

            $('.group-list').sortable({
                opacity: 0.7,
                cursor: 'move',
                connectWith: '.group-list',
                start: function() {
                    sender = null;
                },
                receive: function(event, ui) {
                    sender = ui.sender;
                },
                stop: function(event, ui) {
                    var oldCategoryId = sender != null ? $(sender).closest('.folded-panel').find('[name="categoryId"]').val() : '';
                    var $newCategory = $(ui.item).closest('.folded-panel');
                    var newCategoryId = $newCategory.find('[name="categoryId"]').val();
                    
                    var ids = '';  // 群ID

                    $newCategory.find('.group-list > li').each(function() {
                        ids = ids + $(this).data('id') + ',';
                    });

                    ids = ids.substring(0, ids.length - 1);
                    ajax.post('/ajax/group/saveGroupOrder', {categoryId: newCategoryId, groupIds: ids}, function(){})
                }
            });
        },
        
        /**
         * 设置/取消管理员 
         */
        setAdmin: function() {
            $('[role="setAdmin"]').click(function() {
                var url, noticeMsg,
                    $this = $(this),
                    isSet = $this.find('input[name="set"]').val(),
                    userId = $this.attr('targetId'),
                    groupId = $('#groupId').val();
                
                if(isSet == 1) {
                    url = "/ajax/group/setAdmin";
                    noticeMsg = '是否设为群管理员？';
                } else {
                    url = "/ajax/group/cancelAdmin";
                    noticeMsg = '是否撤销群管理员？';
                }

                dd.confirm(noticeMsg, function() {
                    ajax.post(url, {groupId: groupId, distUserId: userId}, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },
        
        /**
         * 踢出公会 
         */
        fire: function() {
            $('[role="fire"]').click(function() {
                var groupId = $('#groupId').val(),
                    userId = $(this).attr("targetId");

                dd.confirm('是否踢出群？', function() {
                    ajax.post('/ajax/group/fire', {groupId: groupId, distUserIds: userId}, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },
        
        /**
         * 批量踢出公会成员 
         */
        batchFire: function() {
            $('#batchFire').click(function() {
                var distUserIds = new Array(),
                    groupId = $('#groupId').val();
                $('input[role="ck"]:checked').each(function() {
                    distUserIds.push($(this).val());
                });
                
                if(_.isEmpty(distUserIds)) {
                    dd.alert('请选择记录');
                    return false;
                }
                
                dd.confirm('是否踢出群？', function() {
                    ajax.post('/ajax/group/fire', {groupId: groupId, distUserIds: distUserIds}, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },
        
        /**
         * 禁言/取消禁言 
         */
        changeGagged: function() {
            $('[role="changeGagged"]').click(function() {
                var url, noticeMsg,
                    $this = $(this),
                    isSet = $this.find('input[name="set"]').val(),
                    userId = $this.attr('targetId'),
                    groupId = $('#groupId').val();
                
                if(isSet == 1) {
                    url = "/ajax/group/gag";
                    noticeMsg = '是否禁言？';
                } else {
                    url = "/ajax/group/ungag";
                    noticeMsg = '是否取消禁言？';
                }

                dd.confirm(noticeMsg, function() {
                    ajax.post(url, {groupId: groupId, distUserId: userId}, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },
        
        setCard: function() {
            var oldCard;
            $('tbody > tr').hover(function() {
                var $td = $(this).find('[role="setCard"]'),
                    card = $td.text(),
                    groupId = $('#groupId').val(),
                    userId = $td.attr('targetId');
                
                oldCard = card;
                var $input = $('<input type="text" value="' + card + '" size="6" class="in-t">');
                $input.blur(function(){
                    var $this = $(this),
                        newCard = $this.val();
                    
                    ajax.post('/ajax/group/setCard', {groupId: groupId, distUserId: userId, groupCard: newCard}, function(result) {
                        if(result.success){
                            $td.html(newCard);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
                $td.html($input);
            }, function() {
                var $td = $(this).find('[role="setCard"]'),
                    $card = $td.find('input');
                if($card.val() != oldCard) {
                    $card.blur();
                }
                $td.text($card.val());
            });
        }
    }

    Organize.init();
});