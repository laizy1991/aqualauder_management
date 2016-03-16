/**
 * @description: 游戏服务器分区管理页面交互
 * @author: lox@warthog.cn
 * @date: 2015-05-07
 */

define(function(require) {
    require('../common/common');
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    
    var GameServerPart = {
        init: function() {
        	this.addGameServerPart($('[role="add"]'));
        	this.editGameServerPart($('[role="edit"]'));
        },
        
        /**
         * 添加服务分区
         */
        addGameServerPart: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'addDialog',
                    title: '添加服务器',
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
                                    $msg.html('服务器名称不能为空!').show();
                                    return false;
                                }                            
                                
                                ajax.post($form.attr('action'), $form.serialize()+"&gameId="+gameId, function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，服务器添加成功！', function(){
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
         * 编辑服务分区
         */
        editGameServerPart: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                serverId = $this.closest('[role="edit"]').attr("targetId"),
                category = $this.closest('tr').children('td').eq(1).text();
                name = $this.closest('tr').children('td').eq(2).text();
                aliasName = $this.closest('tr').children('td').eq(3).text();
                
                var editDialog = dialog({
                    id: 'editDialog',
                    title: '编辑服务分区',
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
                                    $msg.html('服务器名称不能为空!').show();
                                    return false;
                                }
                                
                                ajax.post($form.attr('action'), $form.serialize()+"&serverId="+serverId+"&gameId="+gameId, function(result){
                                    if(result.success){
                                    	editDialog.close();
                                        dd.alert('恭喜，服务器更新成功！', function(){
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
                    	$("#id").text(serverId);
                    	$("#category").val(category);
                    	$("#name").val(name);
                    	$('#aliasName').val(aliasName);
                        $msg = this.__popup.find('.msg');
                    }

                }).showModal();
                
            });
        },

    };
    
    GameServerPart.init();
});