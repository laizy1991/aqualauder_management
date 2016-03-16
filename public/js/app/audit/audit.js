/**
 * Desc:审核相关js
 * Author:Coming
 * Date:2015/6/2
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    var template = require('../common/module/template_native');

    var Audit = {
        init: function() {
            this.pass($('[role="pass"]'));
            this.multiPass($('[role="multiPass"]'));
            this.pagePass($('[role="pagePass"]'));
            this.reject($('[role="reject"]'));
            this.checkAll();
            this.initCheck();
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

        initCheck:function(){
            $("#ckAll").attr("checked",false);
            $('input[name="id"]:checked').each(function(){
                $(this).attr("checked",false);
            });
        },
        /**
         * 不通过审核
         */
        reject: function(obj) {
            remark='';
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    auditId = $wrap.find('.auditId').val(),
                    appointId = $wrap.find('.appointId').val();
                var editDialog = dialog({
                    id: 'editDialog',
                    title: '选择不通过原因',
                    content: document.getElementById('editDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var remark='';
                                var $radio = $(".list-group").find(':input:checked');
                                if ($radio.length) {
                                    remark=$radio.val();
                                }else{
                                    remark=$("txtRemark").val();
                                }
                                if($("#txtRemark").attr("disabled")!="disabled"){
                                    if($("#txtRemark").val().trim().length==0){
                                        $("#txtRemark").focus();
                                        return false;
                                    }else{
                                        remark=$("#txtRemark").val().trim();
                                    }
                                }
                                var params={
                                    "id":auditId,
                                    "appointId":appointId,
                                    "remark":remark,
                                    "status":-1
                                };

                                ajax.post('/ajax/Audit/update', params, function(result) {
                                    if(result.success){
                                        editDialog.close();
                                        //dd.alert('审核成功！');
                                        window.location.reload(false);
                                    }else{
                                        editDialog.close();
                                        dd.alert(result.error);
                                    }
                                });

                                return false;
                            },
                            autofocus: true
                        },
                        {
                            value: '取消'
                        }
                    ],
                    onshow: function() {
                        $("#radioOther").click(function(){
                            $("#txtRemark").removeAttr("disabled");
                            $("#txtRemark").attr("placeholder","请输入原因");
                            $("#txtRemark").focus();
                        });

                        $(".list-group").find(".normal").click(function () {
                            remark=$(this).val();
                            $("#txtRemark").attr("disabled","disabled");
                            $("#txtRemark").attr("placeholder","");
                            $("#txtRemark").val('');
                        });
                    }

                }).showModal();
            });
        },

        /**
         *  通过审核
         */
        pass: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    id = $wrap.find('.auditId').val(),
                    appointId = $wrap.find('.appointId').val(),
                    typeId=$wrap.find('.typeId').val();
                var params={
                    "id":id,
                    "typeId":typeId,
                    "appointId":appointId,
                    "remark":'审核通过',
                    "status":1
                };

                ajax.post('/ajax/Audit/update', params, function(result) {
                    if(result.success){
                        //dd.alert('审核成功！');
                        window.location.reload(false);
                    }else{
                        dd.alert(result.error);
                    }
                });

            });
        },

        /**
         * 通过选定审核
         */
        multiPass: function(obj) {
            obj.click(function() {
                var $table=$("#tdAudit"),
                $td=$table.find(".auditId"),
                auditIds = new Array();
                $('input[name="id"]:checked').each(function(){
                    auditIds.push($(this).val());
                });
                var params={"ids":auditIds.toString(),"status":1};
                var length=auditIds.length;

                ajax.post('/ajax/Audit/multiUpdate', params, function(result) {
                    if(result.success){
                        //dd.alert('批量审核成功！');
                        var pageCount=$(".pageCount").val();
                        var stateObject = {};
                        var title = "";
                        var href=window.location.href;
                        var pageNowParam=window.location.href.substring(window.location.href.indexOf('pageNow'),window.location.href.length);
                        var index=pageNowParam.indexOf('=');
                        var page=pageNowParam.substring(index+1,pageNowParam.length);
                        if(pageCount==page && pageCount>1 && length==10){
                            var newParam="pageNow="+(page-1).toString();
                            href= href.replace(pageNowParam,newParam);
                        }
                        window.location.href=href;
                    }else{
                        dd.alert(result.error);
                    }
                });

            });
        },
        /**
         * 整页通过审核
         */
        pagePass: function(obj) {
            obj.click(function() {
                var $table=$("#tdAudit"),
                    $tds=$table.find(".auditId"),
                    auditIds = new Array();
                for(var i=0;i<$tds.length;i++){
                    auditIds.push($tds[i].value);
                }
                
                var params={"ids":auditIds.toString(),"status":1};

                ajax.post('/ajax/Audit/multiUpdate', params, function(result) {
                    if(result.success){
                        //dd.alert('批量审核成功！');
                        var pageCount=$(".pageCount").val();
                        var stateObject = {};
                        var title = "";
                        var href=window.location.href;
                        var pageNowParam=window.location.href.substring(window.location.href.indexOf('pageNow'),window.location.href.length);
                        var index=pageNowParam.indexOf('=');
                        var page=pageNowParam.substring(index+1,pageNowParam.length);
                        if(pageCount==page && pageCount>1){
                            var newParam="pageNow="+(page-1).toString();
                            href= href.replace(pageNowParam,newParam);
                        }
                        window.location.href=href;
                    }else{
                        dd.alert(result.error);
                    }
                });

            });
        }

    }
    console.log('---');
    Audit.init();
});