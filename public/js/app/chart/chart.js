/**
 * @description: 统计页面
 * @author: zhongna
 * @date: 2014-09-12
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/underscore');
    
    var dd = require('../util/dialog');

    var Chart = {
        init: function() {
            this.initDatepicker();
            
            var startDate = $('.begin-time').val(),
                    endDate = $('.end-time').val();

            this.initHighcharts(getDateArray(getDate(startDate), getDate(endDate)));

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
         * 初始化图表插件
         */
        initHighcharts: function(categoriesArr, startDate, endDate) {
            var args = $('#chartWrap').data('param');

            $.getJSON(args.url, {'startDate': startDate, 'endDate': endDate}, function (res) {
                
                var data = new Array();
                if(res.success && !_.isUndefined(res.data)) {
                    data.push(res.data);
                    categoriesArr = res.data.date;
                    for(var i=0; i<categoriesArr.length; i++) {
                        categoriesArr[i] = transferDate(categoriesArr[i]);
                    }
                } else {
                    dd.alert(res.error);
                    return;
                }
                
                $('#chartWrap').highcharts({

                    // 折线颜色值
                    colors: ['#7cb5ec', '#f7a35c', '#83E571', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],

                    // 主标题
                    title: {
                        text: args.title
                    },

                    // 副标题
                    subtitle: {
                        text: '仅提供最近6个月数据查询'
                    },

                    // 禁用菜单
                    navigation: {
                        buttonOptions: {
                            enabled: false
                        }
                    },

                    // 禁用标签(Highchargs.com)
                    credits: {
                        enabled: false
                    },

                    // X轴
                    xAxis: {
                        title: {
                            text: '日期'
                        },
                        categories: categoriesArr
                    },

                    // Y轴
                    yAxis: [{
                        title: {
                            text: args.yAxisText
                        },
                        showFirstLabel: false
                    }],

                    // 提示气泡
                    tooltip: {
                        shared: true,
                        crosshairs: true
                    },

                    series: data
                });
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
                self.initHighcharts(dateArr, startDate, endDate);
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