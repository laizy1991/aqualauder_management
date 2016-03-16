/**
 * @description: 奖池管理页面交互
 * @author: Coming
 * @date: 2015-12-30
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/chosen');  // 下拉选择框插件
    require('../common/module/selectRange');  // 设置光标
    require('../../thirdParty/underscore');
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');

    var LotteryPool = {
        init: function() {
            try {
                this.initLotteryPoolForm();
            } catch(e) {}
            this.initChosen();
        },
        /**
         * 初始化文本框插件
         */
        initLotteryPoolForm: function() {

            //更新奖品
            $('#btnSubmit').click(function(){
                var $this = $("#lotteryPoolUpdateForm"),
                    $itemId=$this.find('[name="itemId"]'),
                    $amount = $this.find('[name="amount"]');

                if(_.isEmpty($itemId.val()) || $itemId.val()==0) {
                    $("#itemIdTips").removeClass("hide");
                    $("#itemIdTips").text('请选择奖品！');
                    return false;
                } else {
                    $("#itemIdTips").addClass("hide");
                }

                if(_.isEmpty($amount.val())) {
                    $amount.next().removeClass("hide");
                    $amount.next().text('总数不能为空！');
                    return false;
                } else {
                    if(isNaN($amount.val()) || $amount.val()==0){
                        $amount.next().removeClass("hide");
                        $amount.next().text('总数必须为正整数！');
                        return false;
                    }else{
                        $amount.next().addClass("hide");
                    }
                }

                ajax.post($this.attr('action'), $this.serialize(), function(result){
                    if(result.success){
                        dd.alert('更新成功！', function(){
                            window.location="/lotterypool/list";
                        });
                    }else{
                        dd.alert(result.error);
                    }
                });
                return false;
            });
        },
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        }
    };
    LotteryPool.init();
});
