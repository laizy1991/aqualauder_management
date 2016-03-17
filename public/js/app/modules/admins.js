/**
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    var template = require('../common/module/template_native');

    var Admin = {
        init: function() {
            //$.get("/User/list");
            this.createAdmin($('[role="create"]'));
            this.deleteAdmin($('[role="delete"]'));
            this.editAdmin($('[role="edit"]'));
        },

        /**
         * 添加
         */
        createAdmin: function(obj) {
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
                        
                    }
                }).showModal();
            });
        },
        
        

        /**
         * 删除
         */
        deleteAdmin: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                	$adminId = $wrap.find('.id'),
                	adminId = $adminId.val();
                
                var deleteLevelDialog = dialog({
                    id: 'deleteDialog',
                    title: '删除邮箱信息',
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
                    	$("#emailId").val(emailId);
                    }
                }).showModal();
            });
        },

        /**
         * 编辑
         */
        editAdmin: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $id = $wrap.find('.id'),
                    $name = $wrap.find('.username'),
                    id = $id.val(),
                	name = $name.val(),
                
                editAdminDialog = dialog({
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
                                        dd.alert('修改信息成功！', function(){
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
                    	$("#adminId").val(id);
                    	$("#username").val(name);
                    }
                }).showModal();
            });
        }
        
    }

    Admin.init();
});
