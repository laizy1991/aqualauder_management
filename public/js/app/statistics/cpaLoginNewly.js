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
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
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
         * 初始化图表插件
         */
        initHighcharts: function(startDate, endDate) {
            var args = $('#chartWrap').data('param');
            var game=$('#filter-by-game').find('option:selected').val();
            var timeId=$('#filter-by-time').find('option:selected').data('id');
            var supersUid = $('#filter-by-supers').val();
            var params={
            	"form.gameFilter":game,
                "form.timeFilter":timeId,
                "form.startDate":startDate,
                "form.endDate":endDate,
                "form.supersUid":supersUid
            };
            var subtitleText = '仅提供最近半年数据查询';
            var yAxisTitle = '数量';
            var categoriesArr = new Array();
            $.getJSON(args.url, params, function (res) {
                if(res.success && !_.isUndefined(res.data)) {
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
                        text: subtitleText
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
                        startOnTick: false, //start at 0
                        min:-0,
                        title: {
                            text: yAxisTitle
                        },
                        showFirstLabel: false
                    }],

                    // 提示气泡
                    tooltip: {
                        shared: true,
                        crosshairs: true
                    },

                    series: res.data.series
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

                var timeFilter=$('#filter-by-time').find('option:selected').data('id');

                var startDate = $startDate.val(),
                    endDate = $endDate.val();

                if (timeFilter === 5) {
                	if (startDate == '' || endDate == '') {
                        dd.alert('请先选择时间！');
                        return;

                    } else if (startDate > endDate) {
                        dd.alert('开始时间不能大于结束时间！');
                        return;
                    }
                }
                //根据所选择的统计类型，分别显示对应图表和表格

                self.initHighcharts(startDate, endDate);
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