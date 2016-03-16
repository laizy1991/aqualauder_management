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
            this.initDatepicker();
            this.delete($('[role="delete"]'));
        },
        /**
         * 初始化
         */
        initLotteryPoolForm: function() {

            //创建奖池
            $('#btnSubmit').click(function(){
                var $this = $("#lotteryPoolCreateForm"),
                    $itemId=$this.find('[name="itemId"]'),
                    $amount=$this.find('[name="amount"]'),
                    $beginTime = $this.find('[name="beginTime"]'),
                    $endTime = $this.find('[name="endTime"]');

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

                if(_.isEmpty($beginTime.val())) {
                    $("#beginTimeTips").removeClass("hide");
                    $("#beginTimeTips").text('请设置奖池有效开始时间');
                    return false;
                } else {
                    $("#beginTimeTips").addClass("hide");
                }

                if(_.isEmpty($endTime.val())) {
                    $("#endTimeTips").removeClass("hide");
                    $("#endTimeTips").text('请设置奖池有效结束时间');
                    return false;
                } else {
                    $("#endTimeTips").addClass("hide");
                }

                ajax.post($this.attr('action'), $this.serialize(), function(result){
                    if(result.success){
                        dd.alert('创建成功！', function(){
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
        },
        /**
         * 初始化日历插件
         */
        initDatepicker: function() {
            $('#beginTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd',
                    readOnly:true,
                    maxDate:'#F{$dp.$D(\'beginTime\')}'
                });
            });

            $('#endTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd',
                    readOnly:true,
                    minDate:'#F{$dp.$D(\'endTime\')}'
                });
            });
        },
        /**
         * 删除奖池
         */
        delete: function (obj) {
            obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    date = $wrap.find('.date').val(),
                    itemId = $wrap.find('.itemId').val();

                dd.confirm('确定要删除此奖池？',function () {
                    var params = {id:itemId,date:date};
                    ajax.post("/ajax/lotterypool/delete",params, function (result) {
                        if(result.success){
                            window.location="/lotterypool/list";
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        }
    };
    LotteryPool.init();
});
