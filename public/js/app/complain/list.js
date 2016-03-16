
define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/chosen');  // 下拉选择框插件
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');

    var List = {
        init: function() {
            this.initChosen();
            this.initHrefAction();
        },
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        },
        /**
         * 初始化各种操作
         *
         */
        initHrefAction: function(){
			$("a[action=judge]").each(function(index, item){
				$(item).click(function(){
                	var judgeDialog = dialog({
                	    id: 'judgeDialog',
                	    title: '仲裁结果',
                	    content: document.getElementById('judgeDialog').innerHTML,
                	    button: [
                	        {
                	            value: '发送仲裁结果',
                	            callback: function () {
									if ( $("#judgeMsg").val().trim() == "" ){
										$("#judgeErrorMsg").show();	
										$("#judgeErrorMsg").html("*请输入仲裁结果再发送");	
									}else{
										$("#judgeErrorMsg").hide();	
										var params = "orderId=" + $(item).attr("orderId") + "&judgeMsg=" + encodeURIComponent($("#judgeMsg").val());
                	                	ajax.post("/ajax/complain/judge", params, function(result){
                	                	    if(result.success){
                	                	        judgeDialog.close();
                	                	        dd.alert('发送成功！', function(){
                	                	            window.location.reload(false);
                	                	        });
                	                	    }else{
                	                	    	judgeDialog.close();
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
			$("a[action=ignore]").each(function(index, item){
				$(item).click(function(){
					var ignoreDialog = dialog({
                	    id: 'ignoreConfirm',
                	    title: '',
                	    content: document.getElementById('ignoreConfirm').innerHTML,
                	    button: [
                	        {
                	            value: '确认',
                	            callback: function () {
                	            	var orderId = $(item).attr("orderId");
                	            	var params = "orderId=" + orderId;
                	                ajax.post("/ajax/Complain/ignore", params, function(result){
                	                    if(result.success){
                	                    	ignoreDialog.close();
                	                        window.location.reload(false);
                	                    }else{
                	                    	ignoreDialog.close();
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
                	    }
                	}).showModal();
				});
			});
        }

    };

    List.init();
});