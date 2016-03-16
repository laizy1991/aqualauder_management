/**
 * @description: 游戏管理页面交互
 * @author: lox@warthog.cn
 * @date: 2015-04-29
 */

define(function(require) {
    require('../common/common');
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
   require('../../thirdParty/chosen');  // 下拉选择框插件
    
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    
    var Refund = {
        init: function() {
        	this.createRefundOrder(); 
        	this.initRefundAudit();
        	this.initChosen();
        },
        /**
         * 添加游戏
         */
        createRefundOrder: function() {
            var self = this;
            $('[role="createOrder"]').click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'addDialog',
                    title: '创建退款单',
                    content: document.getElementById('addDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '创建',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    $tradeNo = $form.find('#tradeNo');
                                   

                                var tradeNo = $.trim($tradeNo.val());
                                $msg.hide();

                                if (_.isEmpty(tradeNo)) {
                                    $msg.html('支付宝交易号不能为空!').show();
                                    return false;
                                }                            
                                
                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，创建退款单成功！', function(){
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
        initRefundAudit: function (){
        	$('[role="refund"]').each(function(index, item){
        		$item = $(item);
        		$item.click(function () {
    				var $this = $(this);
            		var orderId = $this.attr("orderId");
            		var tradeNo = $this.attr("tradeNo");
            		var isAgree = $this.attr("isAgree");
            		var refundState = $this.attr("refundState");
            		var titleText = "确定进行退款吗？";
            		if(isAgree != 1) {
            			titleText = "确定不退款吗？";
            		}
        			var confirmDialog = dialog({
                        id: 'confirmDialog',
                        title: "提示",
                        content: '<div class="dialog dialog-create" > <form action="@{ajax.Refund.refundAudit}"> <p>' + titleText + '</p></form> </div>',
                        button: [
                            {
                                value: '确定',
                                callback: function () {
                                	var params={
                                			"orderId" : orderId,
                        					"tradeNo" : tradeNo,
                        					"isAgree" : isAgree,
                        					"oldState" : refundState
                                        };

                                        ajax.post('/ajax/Refund/refundAudit', params, function(result) {
                                            if(result.success){
                                                dd.alert('操作成功！');
                                                window.location.reload(false);
                                            }else{
                                            	dd.alert(result.error)
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
        	});
        },
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        }
    };
    Refund.init();
});



