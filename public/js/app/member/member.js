/**
 * @description: 成员管理页面交互
 * @author: zhongna
 * @date: 2014-08-25
 */

define(function (require) {
    require('../common/common');  // 公共模块
    var dd = require('../util/dialog');
    require('../../thirdParty/chosen');  // 下拉选择框插件
    require('../../thirdParty/underscore');
    var ajax = require('../util/ajax');

    var Member = {
        init: function() {
            this.initDatepicker();
            this.initChosen();
            this.initSortButton();
            this.initCancelFilter();
            this.checkAll();
            this.switchType();
            this.pullBlacklist();
            this.setAdmin();
            this.fire();
            this.batchFire();
            this.cancelBlacklist();
        },

        /**
         * 初始化日历插件
         */
        initDatepicker: function() {
            $('#startTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd HH:mm',
                    readOnly:true,
                    maxDate:'#F{$dp.$D(\'endTime\')}'
                });
            });

            $('#endTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd HH:mm',
                    readOnly:true,
                    minDate:'#F{$dp.$D(\'startTime\')}'
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
         * 初始化表格排序列 
         */
        initSortButton: function() {
            $('.order').click(function() {
                var $this = $(this),
                    $b = $this.find('b'),
                    inputName = $this.attr("role");
                if($b.hasClass('icon-order-asc')) {
                    $b.removeClass('icon-order-asc').addClass('icon-order-desc');
                    $('#' + inputName).val(false);
                } else {
                    $b.removeClass('icon-order-desc').addClass('icon-order-asc');
                    $('#' + inputName).val(true);
                }
                $('#filterForm').submit();
            });
        },
        
        /**
         * 初始化取消筛选按钮事件 
         */
        initCancelFilter: function() {
            $('#cancelFilter').click(function() {
                $select = $('#type');
                $select.get(0).selectedIndex=0;
                $select.trigger('chosen:updated').change();
                $('#filterForm').submit();
            });
        },

        /**
         * 切换筛选类型
         */
        switchType: function() {
            $('#type').change(function() {
                var $this = $(this),
                    $conditions = $('[role="conditions"]'),
                    $buttons = $('#buttons'),
                    id = $this.find('option:selected').data('id');

                if (id == '') {
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
         * 全选、反选效果
         */
        checkAll: function() {
            var $ckAll = $('[role="ckAll"]'),
                $ck = $('[role="ck"]:not(":disabled")'),
                $ckNum = $('[role="ckNum"]');

            var isCheckAll;

            // 点击ckAll
            $ckAll.click(function() {
                isCheckAll = $ckAll.prop('checked');

                $ck.prop('checked', isCheckAll);

                if (isCheckAll) {
                    $ck.closest('tr').addClass('selected');
                    $ckNum && $ckNum.html($ck.length);

                } else {
                    $ck.closest('tr').removeClass('selected');
                    $ckNum && $ckNum.html(0);
                }
            });

            // 点击ck
            $ck.click(function() {
                var $curCk = $(this),
                    isChecked = $curCk.prop('checked');

                $curCk.closest('tr').toggleClass('selected');

                if (isChecked) {
                    isCheckAll = true;
                    $ckNum && $ckNum.html(parseInt($ckNum.text()) + 1);

                    $ck.each(function() {
                        if (!$(this).prop('checked')) {
                            isCheckAll = false;
                        }
                    });

                } else {
                    isCheckAll = false;
                    $ckNum && $ckNum.html(parseInt($ckNum.text()) - 1);
                }

                $ckAll.prop('checked', isCheckAll);
            });
        },
        
        /**
         * 设置/取消管理员 
         */
        setAdmin: function() {
            $('[role="setAdmin"]').click(function() {
                var url, noticeMsg,
                    isSet = $(this).find("input[name='set']").val(),
                    userId = $(this).attr("targetId");
                
                if(isSet == 1) {
                    url = "/ajax/member/setGuildAdmin";
                    noticeMsg = '是否设为公会管理？';
                } else {
                    url = "/ajax/member/cancelGuildAdmin";
                    noticeMsg = '是否撤销公会管理？';
                }
                dd.confirm(noticeMsg, function() {
                    ajax.post(url, {distUserId: userId}, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },

        /**
         * 加入黑名单
         */
        pullBlacklist: function() {
            $('[role="blacklist"]').click(function() {
                var userId = $(this).attr("targetId");

                var blacklistDialog = dialog({
                        id: 'blacklistDialog',
                        title: '加入黑名单',
                        content: $('#blacklistDialogTmpl').html(),
                        button: [{
                            value: '确定',
                            autofocus: true,
                            callback: function () {
                                var self = this,
                                    $form = this.__popup.find('form'),
                                    url = $form.attr('action'),
                                    param = $form.serialize(),
                                    $reason = $('#reason');
                                
                                if($reason.val() == '') {
                                    $form.find('.msg').show();
                                    return false;
                                }
    
                                ajax.post(url, {
                                    distUserId: userId,
                                    reason: $reason.val()
                                }, function(result) {
                                    if(result.success){
                                        dd.alert('已成功加入黑名单！', function() {
                                            window.location.reload(false);
                                        });
                                    }else{
                                        dd.alert(result.error);
                                    }
                                });
                            }
                        },{
                        value: '取消'
                    }],
                    onshow: function() {
                        var self = this;
                        this.__popup.find(".chosen-select").chosen({disable_search_threshold: 10});
                        this.__popup.find('form').find('[name="distUserId"]').val(userId);
    
                        $('#reason').change(function() {
                            if ($(this).val() != '') {
                                self.__popup.find('.msg').hide();
                            } else {
                                self.__popup.find('.msg').show();
                            }
                        });
                    }
                }).showModal();
            });
        },
        
        /**
         * 踢出公会 
         */
        fire: function() {
            $('[role="fire"]').click(function() {
                var userId = $(this).attr("targetId");

                dd.confirm('是否踢出公会？', function() {
                    ajax.post('/ajax/member/fire', {distUserIds: userId}, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },
        
        /**
         * 批量踢出公会成员 
         */
        batchFire: function() {
            $('#batchFire').click(function() {
                var distUserIds = new Array();
                $('input[role="ck"]:checked').each(function() {
                    distUserIds.push($(this).val());
                });
                
                if(_.isEmpty(distUserIds)) {
                    dd.alert('请选择记录');
                    return false;
                }
                
                dd.confirm('是否踢出公会？', function() {
                    ajax.post('/ajax/member/fire', {distUserIds: distUserIds}, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },
        
        cancelBlacklist: function() {
            function doCancel(distUserIds) {
                dd.confirm('是否解除黑名单？', function() {
                    ajax.post('/ajax/guildBlacklist/cancel', {distUserIds: distUserIds}, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            }
            
            $('#cancelBlacklist').click(function(){
                var distUserIds = new Array();
                $('input[role="ck"]:checked').each(function() {
                    distUserIds.push($(this).val());
                });
                
                if(_.isEmpty(distUserIds)) {
                    dd.alert('请选择记录');
                    return false;
                }
                
                doCancel(distUserIds);
            });
            
            $('[role="cancelBlacklist"]').click(function() {
                var $this = $(this),
                    userId = $this.attr('targetId');
                var distUserIds = new Array();
                distUserIds.push(userId);
                doCancel(distUserIds);
            });
        }
        
    }

    Member.init();
});