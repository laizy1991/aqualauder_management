/**
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    var template = require('../common/module/template_native');

    var User = {
        init: function() {
            //$.get("/User/list");
            this.createLevelPay($('[role="create"]'));
            this.deleteLevelPay($('[role="delete"]'));
            this.editLevelPay($('[role="edit"]'));
        },

        /**
         * 添加普通用户
         */
        createLevelPay: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('.folded-panel'),
                    $hiddenInputs = $wrap.find('input:hidden');

                var createDialog = dialog({
                    id: 'createDialog',
                    title: '添加',
                    content: document.getElementById('createDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form');

                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        dia.close();
                                        dd.alert('添加成功！', function(){
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
                        var $gameSelected=$("#gameId-list");
                        var $levelSelected=$("#level-list");
                        ajax.get('/ajax/Distributor/getBaseInfo', function(result){
                        	txt = "<select id='gameId' name='levelPay.gameId'>";
                        	txt += "<option value='0'>默认</option>";
                            for(var v in result.data.gameList){
                                var game=result.data.gameList[v];
                                txt += "<option value='" + game.id + "'>" + game.name +"</option>";
                            }
                            txt += "</select>";
                            $gameSelected.append(txt);
                            
                            
                            txt = "<select id='level' name='levelPay.level'>";
                            for(var v in result.data.levelInfos){
                                var level=result.data.levelInfos[v];
                                txt += "<option value='" + level + "'>" + level +"</option>";
                            }
                            txt += "</select>";
                            $levelSelected.append(txt);
                        });
                        
                    }
                }).showModal();
            });
        },
        
        

        /**
         * 删除
         */
        deleteLevelPay: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $level = $wrap.find('.level'),
                    level = $level.val(),
                	$gameId = $wrap.find('.gameId'),
                	gameId = $gameId.val();
                
                var deleteLevelDialog = dialog({
                    id: 'deleteDialog',
                    title: '删除等级提成信息',
                    content: document.getElementById('deleteDialogTmpl').innerHTML,
                    button: [
                        {
                        	value: '确定',
                            callback: function () {
                                var dia = this,
                                $form = this.__popup.find('form');
                                
                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        dia.close();
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
                        }
                    ],
                    cancelValue: '取消',
                    cancel: function() {

                    },
                    onshow:function() {
                    	$("#level").val(level);
                    	$("#gameId").val(gameId);
                    }
                }).showModal();
            });
        },

        /**
         * 编辑普通用户
         */
        editLevelPay: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $level = $wrap.find('.level'),
                    $gameId = $wrap.find('.gameId'),
                    $percentage = $wrap.find('.percentage'),
                    level = $level.val(),
                	gameId = $gameId.val(),
                	percentage = $percentage.val();
                
                var editLevelDialog = dialog({
                    id: 'editDialog',
                    title: '编辑等级等级提成',
                    content: document.getElementById('editDialogTmpl').innerHTML,
                    button: [
                        {
                        	value: '确定',
                            callback: function () {
                                var dia = this,
                                $form = this.__popup.find('form');
                                
                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        dia.close();
                                        dd.alert('修改等级提成成功！', function(){
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
                    onshow:function() {
                    	$("#level").val(level);
                    	$("#gameId").val(gameId);
                    	$("#percentage").val(percentage);
                    }
                }).showModal();
            });
        }
        
    }

    User.init();
});
