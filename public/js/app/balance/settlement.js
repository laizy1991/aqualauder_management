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
    
    var template = require('../../thirdParty/template');
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    
    var Settlement = {
        init: function() {
        	this.showDetails(); 
        	this.initChosen();
        	this.tips();
         },        
        showDetails: function() {
            var self = this;
            $('[role="payDetails"]').click(function() {
                var $this = $(this);
				//alert(this.innerText);
				//console.log("-->",$this.attr("data-json")); 
				var c = template("payDetails",JSON.parse($this.attr("data-json")));
				console.log(c);
                var addDialog = dialog({
                    id: 'addDialog',
                    title: '付款明细',
                    content: c,
                    cancelValue: '关闭',
                    cancel: function() {
                    },
                    onshow: function() {
                        $msg = this.__popup.find('.msg'); 
                    }
                }).showModal(); 
            });
        },
        tips: function() {
            var self = this;
            $('[role="pay"]').click(function() {
                var $this = $(this); 
                 var addDialog = dialog({
                    id: 'addDialog',
                    title: '确认付款!!',
                    content: document.getElementById('payTmpl').innerHTML,
                    button: [
                    	{
                    		value: '确认',
                    		callback: function () {
                    			window.open("/settlement/pay?id="+$this.attr("data-id"));
                    			return true;
                    		},
                    		autofocus: true
                    	}
                    ],
                    cancelValue: '关闭',
                    cancel: function() {
                    },
                    onshow: function() {
                        $msg = this.__popup.find('.msg'); 
                    }
                }).showModal(); 
            });
        },
       
        
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        }
    };
        
    Settlement.init();
});



