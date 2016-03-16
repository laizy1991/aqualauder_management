
define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/chosen');  // 下拉选择框插件
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');

    var List = {
        init: function() {
            this.initDatepicker();
            this.initChosen();
            this.switchType();
            this.exportOrderByGoods($('[role="exportOrderByGoods"]'));
            this.exportOrderBySeller($('[role="exportOrderBySeller"]'));
        },

        /**
         * 初始化日历插件
         */
        initDatepicker: function() {
            $('#startTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd',
                    readOnly:true,
                    maxDate:'#F{$dp.$D(\'endTime\')}'
                });
            });

            $('#endTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd',
                    readOnly:true,
                    minDate:'#F{$dp.$D(\'startTime\')}'
                });
            });
        },

        /**
         * 切换筛选类型
         */
        switchType: function() {
            $('#filter-by-time').change(function() {
                var $this = $(this),
                    $conditions = $('[role="conditions"]'),
                    id = $this.find('option:selected').data('id');
                if (id != 5) {
                    $conditions.hide();
                } else {
                    $('#conditions-' + id).show().siblings('[role="conditions"]').hide();
                }
            });
        },
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        },

        /**
         *导出 根据商品查询订单列表 Excel
         */
        exportOrderByGoods: function (obj) {
            obj.click(function () {
                var timeId=$('#filter-by-time').find('option:selected').data('id');

                var $startDate = $('.begin-time'),
                    $endDate = $('.end-time');
                var dateArr = new Array();

                var startDate = $startDate.val(),
                    endDate = $endDate.val();

                var beginTime = getDate(startDate),
                    endTime = getDate(endDate);

                if(timeId==5){
                    if (startDate == '' || endDate == '') {
                        dd.alert('请先选择时间！');
                        return;

                    } else if ((endTime.getTime() - beginTime.getTime()) < 0) {
                        dd.alert('开始时间不能大于结束时间！');
                        return;
                    }
                }

                while ((endTime.getTime() - beginTime.getTime()) >= 0) {

                    var year = beginTime.getFullYear();
                    var month = beginTime.getMonth() + 1;
                    var day = beginTime.getDate().toString().length == 1? '0' + beginTime.getDate().toString() : beginTime.getDate();

                    dateArr.push(month + '-' + day);
                    beginTime.setDate(beginTime.getDate() + 1);

                }

                var params=null;
                if(timeId==5){
                    params={
                        "outTradeNo":$("#outTradeNo").val(),
                        "state":$("#state").val(),
                        "timeFilter":timeId,
                        "startTime":startDate,
                        "endTime":endDate
                    };
                }else{
                    params={
                        "outTradeNo":$("#outTradeNo").val(),
                        "state":$("#state").val(),
                        "timeFilter":timeId
                    };
                }
                var loading;
                $.ajax({
                    type:'POST',
                    timeout:100000,
                    data:params,
                    url:'/ajax/Order/exportOrderByGoods',
                    dataType:'json',
                    beforeSend: function() {
                        loading = dd.loading();
                    },
                    complete: function() {
                        loading.close();
                    },
                    success:function(result){
                        if(result.error){
                            dd.alert(result.error);
                        }else{
                            window.location="/Order/download?path="+result.data.path;
                        }
                    }
                });
            });
        },
        /**
         * 导出 根据商家查询订单列表
         */
        exportOrderBySeller: function (obj) {
            obj.click(function () {
                var timeId=$('#filter-by-time').find('option:selected').data('id');

                var $startDate = $('.begin-time'),
                    $endDate = $('.end-time');
                var dateArr = new Array();

                var startDate = $startDate.val(),
                    endDate = $endDate.val();

                var beginTime = getDate(startDate),
                    endTime = getDate(endDate);

                if(timeId==5){
                    if (startDate == '' || endDate == '') {
                        dd.alert('请先选择时间！');
                        return;

                    } else if ((endTime.getTime() - beginTime.getTime()) < 0) {
                        dd.alert('开始时间不能大于结束时间！');
                        return;
                    }
                }

                while ((endTime.getTime() - beginTime.getTime()) >= 0) {

                    var year = beginTime.getFullYear();
                    var month = beginTime.getMonth() + 1;
                    var day = beginTime.getDate().toString().length == 1? '0' + beginTime.getDate().toString() : beginTime.getDate();

                    dateArr.push(month + '-' + day);
                    beginTime.setDate(beginTime.getDate() + 1);

                }

                var params=null;
                if(timeId==5){
                    params={
                        "sellerUid":$("#sellerUid").val(),
                        "state":$("#state").val(),
                        "timeFilter":timeId,
                        "startTime":startDate,
                        "endTime":endDate
                    };
                }else{
                    params={
                        "sellerUid":$("#sellerUid").val(),
                        "state":$("#state").val(),
                        "timeFilter":timeId
                    };
                }
                var loading;
                $.ajax({
                    type:'POST',
                    timeout:100000,
                    data:params,
                    url:'/ajax/Order/exportOrderBySeller',
                    dataType:'json',
                    beforeSend: function() {
                        loading = dd.loading();
                    },
                    complete: function() {
                        loading.close();
                    },
                    success:function(result){
                        if(result.error){
                            dd.alert(result.error);
                        }else{
                            window.location="/Order/download?path="+result.data.path;
                        }
                    }
                });
            });
        }
    };

    function getDate(datestr){
        var temp = datestr.split('-');
        var date = new Date(temp[0], (temp[1] - 1), temp[2]);

        return date;
    }

    List.init();
});