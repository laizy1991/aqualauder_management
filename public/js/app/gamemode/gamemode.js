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
    
    var GameMode = {
        init: function() {
        	this.addGameMode($('[role="add"]'));
        	this.editGameMode($('[role="edit"]'));
        },
        
        /**
         * 添加装备
         */
        addGameMode: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'addDialog',
                    title: '添加游戏模式',
                    content: document.getElementById('addDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $name = $form.find('#name'),
                                    gameId=$('#gameId').val(),
                                    $msg = this.__popup.find('.msg');

                                var name = $.trim($name.val());
                                $msg.hide();

                                if (_.isEmpty(name)) {
                                    $msg.html('游戏模式名称不能为空!').show();
                                    return false;
                                }                            
                                
                                ajax.post($form.attr('action'), $form.serialize()+"&gameId="+gameId, function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，游戏模式添加成功！', function(){
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
                        $msg = this.__popup.find('.msg');
                    }

                }).showModal();
                
            });
        },
        
        /**
         * 编辑装备
         */
        editGameMode: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                modeId = $this.closest('[role="edit"]').attr("targetId"),
                modeName = $this.closest('tr').children('td').eq(1).text();

                var editDialog = dialog({
                    id: 'editDialog',
                    title: '编辑装备',
                    content: document.getElementById('editDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                $name = $form.find('#name'),
                                gameId=$('#gameId').val(),
                                $msg = this.__popup.find('.msg');

                            var name = $.trim($name.val());
                                $msg.hide();

                                if (_.isEmpty(name)) {
                                    $msg.html('游戏模式名称不能为空!').show();
                                    return false;
                                }
                                
                                ajax.post($form.attr('action'), $form.serialize()+"&modeId="+modeId, function(result){
                                    if(result.success){
                                    	editDialog.close();
                                        dd.alert('恭喜，游戏模式更新成功！', function(){
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
                    	$("#id").text(modeId);
                    	$("#name").val(modeName);
                        $msg = this.__popup.find('.msg');
                    }

                }).showModal();
                
            });
        },

    };
    
    GameMode.init();
});