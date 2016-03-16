/**
 * @description: 用户注册统计页面
 * @author: Coming
 * @date: 2015-05-18
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/underscore');
    require('../../thirdParty/chosen');  // 下拉选择框插件
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');

    var Chart = {
        init: function() {
            this.initDatepicker();
            this.initChosen();
            this.switchType();
            this.initCancelFilter();
            var startDate = $('.begin-time').val(),
                endDate = $('.end-time').val();
            this.dataFilter();
        },

        /**
         * 初始化日历插件
         */
        initDatepicker: function() {
            $('#beginTime').focus(function() {
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
                    minDate:'#F{$dp.$D(\'beginTime\')}'
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
                    $buttons = $('#buttons'),
                    id = $this.find('option:selected').data('id');
                if (id != 5) {
                    $conditions.hide();
                    $buttons.hide();
                    $conditions.find('input').val('');
                } else {
                    $('#conditions-' + id).show().siblings('[role="conditions"]').hide();
                    $buttons.show();
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
         * 初始化取消筛选按钮事件
         */
        initCancelFilter: function() {
            $('#cancelFilter').click(function() {
                $select = $('#filter-by-time');
                $select.get(0).selectedIndex=0;
                $select.trigger('chosen:updated').change();
                $('#filterForm').submit();
            });
        },
        /**
         * 数据过滤
         */
        dataFilter: function() {
            var self = this;

            var $startDate = $('.begin-time'),
                $endDate = $('.end-time');

            $('#filterBtn').click(function() {

                var timeFilter=$('#filter-by-time').find('option:selected').data('id');
                if(timeFilter!=5){
                    $('#filterForm').submit();
                    return;
                }

                var dateArr = new Array();

                var startDate = $startDate.val(),
                    endDate = $endDate.val();

                var beginTime = getDate(startDate),
                    endTime = getDate(endDate);

                if (startDate == '' || endDate == '') {
                    dd.alert('请先选择时间！');
                    return;

                } else if ((endTime.getTime() - beginTime.getTime()) < 0) {
                    dd.alert('开始时间不能大于结束时间！');
                    return;
                }

                while ((endTime.getTime() - beginTime.getTime()) >= 0) {

                    var year = beginTime.getFullYear();
                    var month = beginTime.getMonth() + 1;
                    var day = beginTime.getDate().toString().length == 1? '0' + beginTime.getDate().toString() : beginTime.getDate();

                    dateArr.push(month + '-' + day);
                    beginTime.setDate(beginTime.getDate() + 1);

                }

                var timeId=$('#filter-by-time').find('option:selected').data('id');
                $("#startDate").val(startDate);
                $("#endDate").val(endDate);
                $('#filterForm').submit();

            });
        }
    }

    function getDate(datestr){
        var temp = datestr.split('-');
        var date = new Date(temp[0], (temp[1] - 1), temp[2]);

        return date;
    }

    function getDateArray(beginTime, endTime) {
        var dateArr = new Array();

        while ((endTime.getTime() - beginTime.getTime()) >= 0) {

            var year = beginTime.getFullYear();
            var month = beginTime.getMonth() + 1;
            var day = beginTime.getDate();

            if(month <= 9) {
                month = '0' + month;
            }

            if(day <= 9) {
                day = '0' + day;
            }

            dateArr.push(month + '-' + day);
            beginTime.setDate(beginTime.getDate() + 1);
        }
        return dateArr;
    }

    function transferDate(date) {
        var sDate = date.replace(/^(\d{4})(\d{2})(\d{2})$/,"$1/$2/$3"),
            dateObj = new Date(sDate),
            year = dateObj.getFullYear(),
            month = dateObj.getMonth() + 1,
            day = dateObj.getDate();

        if(month <= 9) {
            month = '0' + month;
        }
        if(day <= 9) {
            day = '0' + day;
        }
        return month + '-' + day;
    }

    Chart.init();
});