/**
 * @description: 商家管理页面交互
 * @author: lox@warthog.cn
 * @date: 2015-08-19
 */

define(function(require) {
    require('../common/common');
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    
    var Seller = {
        init: function() {
        	this.addSeller($('[role="add"]'));
        	this.shelve($('[role="shelve"]'));
        	this.updateAlipayAccount($('[role="alipay"]'));
        	this.updateState($('[role="state"]'));
        	this.updateBusinessHours($('[role="bizHours"]'));
        },
        
        /**
         * 上下架商品
         */
        shelve: function(obj) {
        	var self = this;
        	
        	obj.click(function() {
                var $this = $(this),
                	uid = $('#uid').val(),
                	goodsId = $this.closest('[role="shelve"]').attr("targetId"),
                	shelve = $this.closest('[role="shelve"]').attr("shelve");
                
                var params={
                        "uid":uid,
                        "goodsId":goodsId,
                        "shelve":shelve
                    };
                
                ajax.post('/ajax/Seller/shelve', params, function(result){
                    if(result.success){
                        dd.alert('操作成功！', function(){
                            window.location.reload(false);
                        });
                    }else{
                        dd.alert(result.error);
                    }
                });
                
        	});
        	
        },
        
        /**
         * 添加商家
         */
        addSeller: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'addDialog',
                    title: '添加商家',
                    content: document.getElementById('addDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                	$uid = $form.find('#uid'),
                                    $msg = this.__popup.find('.msg');

                                var uid = $.trim($uid.val());
                                $msg.hide();

                                if (_.isEmpty(uid)) {
                                    $msg.html('商家ID不能为空!').show();
                                    return false;
                                }                            
                                
                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，商家添加成功！', function(){
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
         * 修改支付宝账号
         */
        updateAlipayAccount: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                	alipayAccount = $('#alipay').val(),
                	fullName = $('#name').val();

                var addDialog = dialog({
                    id: 'updateAlipayDialog',
                    title: '修改支付宝账号',
                    content: document.getElementById('editAlipayTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $msg = this.__popup.find('.msg'),
                                	uid = $('#uid').val();

                                $msg.hide();

                                ajax.post($form.attr('action'), $form.serialize()+"&uid="+uid, function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，账号修改成功！', function(){
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
                    	$("#alipayAccount").val(alipayAccount);
                    	$("#fullName").val(fullName);
                    }

                }).showModal();
                
            });
        },
        
        
        /**
         * 修改营业状态
         */
        updateState: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                	state = $('#state').val();

                var addDialog = dialog({
                    id: 'updateStateDialog',
                    title: '修改营业状态',
                    content: document.getElementById('editStateTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $msg = this.__popup.find('.msg'),
                                	uid = $('#uid').val();

                                $msg.hide();

                                ajax.post($form.attr('action'), $form.serialize()+"&uid="+uid, function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，营业状态修改成功！', function(){
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
                    	$("input[type=radio][name=state][value=" + state + "]").attr("checked",true);
                    }

                }).showModal();
                
            });
        },
        
        /**
         * 修改营业时间
         */
        updateBusinessHours: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                businessHVal = $('#businessH').val();

                var addDialog = dialog({
                    id: 'updateBusinessHours',
                    title: '修改修改营业时间',
                    content: document.getElementById('editBussinessHoursTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $msg = this.__popup.find('.msg'),
                                	uid = $('#uid').val();

                                $msg.hide();

                                ajax.post($form.attr('action'), $form.serialize()+"&uid="+uid, function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，修改成功！', function(){
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
                    	$("#businessHours").val(businessHVal);
                    }
                }).showModal();
                
            });
        },
        
    };
    
    Seller.init();
});