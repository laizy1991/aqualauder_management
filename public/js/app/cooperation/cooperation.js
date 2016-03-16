/**
 * @description: 推广管理页面交互
 * @author: lox@warthog.cn
 * @date: 2015-12-21
 */

define(function(require) {
    require('../common/common');
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    
    var Cooperation = {
        init: function() {
        	this.addSeller($('[role="add"]'));
        	this.deleteSeller($('[role="delete"]'));
        	this.initHandleBtn();
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
                    title: '添加推广商人',
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
                                        dd.alert('恭喜，商人添加成功！', function(){
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
         * 删除商人
         */
        deleteSeller: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                	uid = $this.closest('[role="delete"]').attr("targetId");

                var deleteDialog = dialog({
                    id: 'deleteDialog',
                    title: '删除推广商人',
                    content: document.getElementById('deleteDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var $form = this.__popup.find('form');
                                
                                var params={
                                    "uid":uid,
                                };

                                ajax.post($form.attr('action'), params, function(result){
                                    if(result.success){
                                    	deleteDialog.close();
                                        dd.alert('删除成功', function(){
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
        
        initHandleBtn: function() {
        	$("a[action=handle]").each(function(index, item){
				$(item).click(function(){
                	var handleDialog = dialog({
                	    id: 'handleDialog',
                	    title: '填写推广专属包URL',
                	    content: document.getElementById('handleDialog').innerHTML,
                	    button: [
                	        {
                	            value: '保存',
                	            callback: function () {
									if ( $.trim($("#packUrl").val()) == "" ){
										$("#errorMsg").show();	
										$("#errorMsg").html("*请输入专属包下载URL再保存");	
									}else{
										$("#errorMsg").hide();
										var params={
			                                    "uid":$(item).attr("userId"),
			                                    "gameId":$(item).attr("gameId"),
			                                    "url":$("#packUrl").val(),
			                                    "gameName":$(item).attr("gameName")
			                                };
                	                	ajax.post("/ajax/cooperation/updateUrl", params, function(result){
                	                	    if(result.success){
                	                	    	handleDialog.close();
                	                	        dd.alert('修改成功！', function(){
                	                	            window.location.reload(false);
                	                	        });
                	                	    }else{
                	                	    	handleDialog.close();
                	                	        dd.alert(result.error);
                	                	    }
                	                	});
                	                }
                	                return false;
                	            },
                	            autofocus: true
                	        }
                	    ],
                	    cancelValue: '取消',
                	    cancel: function() {
                	    }
                	}).showModal();
				});
			}); 
        }
        
    };
    
    Cooperation.init();
});