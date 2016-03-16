/**
 * @description: 公众号消息管理页面交互
 * @author: Coming
 * @date: 2015-05-21
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../common/module/selectRange');  // 设置光标
    require('../../thirdParty/chosen');  // 下拉选择框插件

    require('../../thirdParty/underscore');
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');
    var Pa = {
        init: function() {
            this.initChosen();
            this.list($('[role="list"]'));
            this.viewLgPic($('[role="viewLgPic"]'));//查看大图
        },
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        },
        list: function (obj) {
            obj.click(function () {
                var $pid=$("#pid"),
                    pid=$("#pid").val();
                if(pid.trim().length==0){
                    pid.next().html("请输入公众号ID");
                    return false;
                }else{
                    if(Number(pid)){
                        window.location="/pa/list?pid="+pid;
                    }else{
                        pid.next().html("请输入正确的公众号d");
                    }
                }
            });
        },
        /**
         * 查看大图
         */
        viewLgPic: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    hrc=$(this).attr("hrc");

                var picDialog = dialog({
                    id: 'picDialog',
                    title: '查看大图',
                    content: document.getElementById('viewPicDialogTmpl').innerHTML,
                    cancelValue: '关闭',
                    cancel: function() {

                    },
                    onshow: function() {
                        var pic=this.__popup.find('.statusPic');
                        pic.attr("src",hrc);
                        $("#viewPicDialog").css("width",$(".statusPic").css("width")+20);
                        $("#viewPicDialog").css("height",$(".statusPic").css("height")+20);
                    }
                }).showModal();
            });
        }
    };
    Pa.init();
});

