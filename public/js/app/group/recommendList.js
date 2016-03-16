/**
 * Desc:群组审核相关js
 * Author:Coming
 * Date:2015/5/7
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    require('../../thirdParty/chosen');  // 下拉选择框插件

    var Group = {
        init: function() {
            this.initDatepicker();
            this.initChosen();
            this.initCancelFilter();
            this.switchType();
            this.getGroupList($("[role='list']"));
            var startDate = $('.begin-time').val(),
                endDate = $('.end-time').val();
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
         *
         */
        getGroupList: function (obj) {
            obj.click(function () {
                var searchForm = $("#filterForm");
                searchForm.submit();
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
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        }

    }
    Group.init();
});

