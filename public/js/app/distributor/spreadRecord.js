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
            this.agree($('[role="agree"]'));
            this.refuse($('[role="refuse"]'));
        },


        /**
         * 同意补贴
         */
        agree: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $id = $wrap.find('.id'),
                    id = $id.val();
                
                var deleteLevelDialog = dialog({
                    id: 'updateRecordState',
                    title: '同意补贴',
                    content: document.getElementById('agreeDialogTmpl').innerHTML,
                    button: [
                        {
                        	value: '确定',
                            callback: function () {
                                var dia = this,
                                $form = this.__popup.find('form');
                                
                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        dia.close();
                                        dd.alert('操作成功！', function(){
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
                    	$("#recordId").val(id);
                    }
                }).showModal();
            });
        },

        /**
         * 不同意补贴
         */
        refuse: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $id = $wrap.find('.id'),
                    id = $id.val();
                
                var deleteLevelDialog = dialog({
                    id: 'updateRecordState',
                    title: '不同意补贴',
                    content: document.getElementById('refuseDialogTmpl').innerHTML,
                    button: [
                        {
                        	value: '确定',
                            callback: function () {
                                var dia = this,
                                $form = this.__popup.find('form');
                                
                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        dia.close();
                                        dd.alert('操作成功！', function(){
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
                    	$("#recordId").val(id);
                    }
                }).showModal();
            });
        }
        
    }

    User.init();
});
