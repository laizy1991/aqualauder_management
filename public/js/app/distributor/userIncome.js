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
            this.detail($('[role="detail"]'));
        },

        /**
         * 详情
         */
        detail: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                	$wrap = $this.closest('tr'),
                	$userId = $wrap.find('.userId'),
                	userId = $userId.val(),
                	$month = $wrap.find('.month'),
                	month = $month.val();

                var detailDialog = dialog({
                    id: 'detailDialog',
                    title: '详情',
                    content: document.getElementById('detailDialogTmpl').innerHTML,
                    cancelValue: '知道了',
                    cancel: function() {

                    },
                    onshow: function() {
                    	var $incomeList=$("#income-list");
                        $.ajax({
                            type:'POST',
                            async:false,
                            data:{
                            	'userId':userId,
                            	'month':month
                            	},
                            url:'/ajax/Distributor/incomeDetail',
                            dataType:'json',
                            success:function(result){
                                if(result.success){
                                	console.log(eval(result));
                                	txt = "<table class='tb'><thead><tr  class='text-center'><th>用户</th><th>收入类型</th><th>流水</th><th>提成</th></tr></thead><tbody>";
                                    for(var v in result.data){
                                        var income=result.data[v];
                                        var underlingName = income.underlingName;
                                        if(!underlingName)
                                        {
                                        	underlingName = '未命名';
                                        }
                                        
                                        txt += "<tr><td>"
                                        	+ underlingName
											+ "</td><td>"
											+ income.incomeTypeDesc
											+ "</td><td>"
											+ income.blotters / 100
											+ "</td><td>"
											+ income.amount / 100
											+ "</td></tr>";
                                    }
                                    txt += "</tbody></table>";
                                    $incomeList.append(txt);
                                }
                            }
                        });
                    }
                }).showModal();
            });
        }
        
    }

    User.init();
});
