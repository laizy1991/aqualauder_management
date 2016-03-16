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
            this.createLevel($('[role="create"]'));
            this.deleteLevel($('[role="delete"]'));
            this.editLevel($('[role="edit"]'));
        },

        /**
         * 添加普通用户
         */
        createLevel: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('.folded-panel'),
                    $hiddenInputs = $wrap.find('input:hidden');

                var createDialog = dialog({
                    id: 'createDialog',
                    title: '添加等级',
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
                                        dd.alert('创建等级成功！', function(){
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
                    onshow: ""
                }).showModal();
            });
        },
        
        

        /**
         * 删除等级
         */
        deleteLevel: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $level = $wrap.find('.level'),
                    level = $level.val();
                
                var deleteLevelDialog = dialog({
                    id: 'deleteDialog',
                    title: '删除等级信息',
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
                                        dd.alert('删除等级成功！', function(){
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
                    }
                }).showModal();
            });
        },

        /**
         * 编辑普通用户
         */
        editLevel: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $level = $wrap.find('.level'),
                    $title = $wrap.find('.title'),
                    $blottersMax = $wrap.find('.blottersMax'),
                    $blottersMin = $wrap.find('.blottersMin'),
                    level = $level.val();
                	title = $title.val();
                	blottersMin = $blottersMin.val();
                	blottersMax = $blottersMax.val();
                
                var editLevelDialog = dialog({
                    id: 'editDialog',
                    title: '编辑等级信息',
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
                                        dd.alert('修改等级信息成功！', function(){
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
                    	$("#title").val(title);
                    	$("#blottersMin").val(blottersMin);
                    	$("#blottersMax").val(blottersMax);
                    }
                }).showModal();
            });
        }
        
    }

    User.init();
});
