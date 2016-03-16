/**
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');

    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    var template = require('../common/module/template_native');

    var App = {
        init: function() {
            this.createApp($('[role="create"]'));
            this.editApp($('[role="edit"]'));
        },

        /**
         * 添加应用
         */
        createApp: function(obj) {
            var self = this,
            fileLegal=false,
            newVersionName ="",
            versionNameLegal=false;

            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('.folded-panel'),
                    $hiddenInputs = $wrap.find('input:hidden');

                var createDialog = dialog({
                    id: 'createDialog',
                    title: '添加应用',
                    content: document.getElementById('createDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form'),
                                    $text = dia.__popup.find('.in-t'),
                                    $msg = $text.siblings('.msg');
                                $msg.hide();



                                var $newVersionName=$form.find("#newVersionName");
                                if(_.isEmpty($newVersionName.val())) {
                                    $newVersionName.next().html('请输入版本');
                                    $newVersionName.next().css("color","red");
                                    $newVersionName.next().css("display","inline");
                                    return false;
                                } else {
                                    $newVersionName.next().text('');
                                }

                                var $downloadUrl=$form.find("#downloadUrl");
                                if(_.isEmpty($downloadUrl.val())) {
                                    $(".upload-status").html('请上传应用');
                                    $(".upload-status").css("color","red");
                                    return false;
                                } else {
                                    $(".upload-status").text('');
                                }

                                var tempVersionName=$form.find("#tempVersionName");
                                if($newVersionName.val()!=tempVersionName.val()){
                                    $newVersionName.next().html('版本号与上传文件版本号不一致！');
                                    $newVersionName.next().css("color","red");
                                    $newVersionName.next().css("display","inline");
                                    return false;
                                }else {
                                    $newVersionName.next().text('');
                                }



                                var $upgradeInfo=$form.find("#upgradeInfo");
                                if(_.isEmpty($upgradeInfo.val())) {
                                    $upgradeInfo.next().text('请输入更新说明');
                                    $upgradeInfo.next().css("display","inline-block");
                                    return false;
                                } else {
                                    $upgradeInfo.next().text('');
                                }

                                if(fileLegal==false){
                                    dd.alert("只能上传 *.apk 和 *.ipa 格式的文件！");
                                    return false;
                                }
                                var loading;
                                $("#createApp").ajaxSubmit({
                                    type:'POST',
                                    url:'/ajax/App/create',
                                    dataType:'json',
                                    beforeSend: function() {
                                        loading = dd.loading();
                                    },
                                    complete: function() {
                                        loading.close();
                                    },error: function() {
                                        dd.alert('网络异常');
                                    },
                                    timeout:10000,
                                    success:function(result){
                                        if(result.success){
                                            window.location.reload(false);
                                        }else{
                                            dd.alert(result.error);
                                        }
                                    }
                                });
                                return false;
                            },
                            autofocus: true
                        }
                    ],
                    cancelValue: '取消',
                    cancel: function() {

                    },
                    onshow: function() {

                             var swfUpload = new SWFUpload({
                                 upload_url: '/ajax/app/upload',
                                 flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                                 file_post_name: 'upfile',  // POST信息中上传文件的name值
                                 post_params:{newVersionName:newVersionName},

                                 file_types: "*.apk;*.ipa;",
                                 file_types_description: '应用',
                                 file_size_limit: '102400',
                                 file_queue_limit:1,

                                 // handlers
                                 file_queue_error_handler: fileQueueError,  // 文件加入上传队列失败时触发
                                 file_dialog_start_handler: fileDialogStart,
                                 file_dialog_complete_handler: fileDialogComplete,  // 选择文件对话框关闭时触发
                                 upload_success_handler: uploadSuccess,  // 文件上传成功后触发
                                 upload_error_handler: uploadError,  //文件上传出错时触发
                                 assume_success_timeout:0,

                                 button_placeholder_id: 'upload',
                                 button_text: '<span class="button-text">上传应用</span>',
                                 button_text_style: '.button-text{color: #333333; font-family: "微软雅黑"; font-size:16px;}',
                                 button_text_left_padding: 0,
                                 button_text_top_padding: 5,
                                 button_width: 80,
                                 button_height: 38,
                                 button_cursor: SWFUpload.CURSOR.HAND,
                                 button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                                 button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,  // 单文件上传
                                 debug: false,
                                 custom_settings: {}
                             });

                             // 打开文件对话框时的回调
                             function fileQueueError() {
                             }
                             // 打开文件对话框时的回调
                             function fileDialogStart() {
                                 newVersionName=$("#newVersionName").val().trim();
                                 if(newVersionName.length==0){
                                     swfUpload.cancelUpload (false);
                                     $(".version-info").css("color","red");
                                     $(".version-info").html('请输入版本');
                                     $(".upload-status").html('');
                                 }else{
                                     swfUpload.setPostParams ({newVersionName:newVersionName});
                                 }
                             }
                             var loading;

                             // 选择文件对话框关闭时的回调
                             function fileDialogComplete() {
                                 newVersionName=$("#newVersionName").val().trim();
                                 if(newVersionName.length==0){
                                     swfUpload.cancelUpload (false);
                                 }
                                 var appType=swfUpload.getFile().type;

                                 if(appType=".apk" || appType==".ipa"){
                                     fileLegal=true;
                                     if(versionNameLegal){
                                         $(".newVersionName").trigger("blur");
                                         $(".app-name").html("youyi_"+newVersionName+swfUpload.getFile().type   );
                                         this.startUpload();
                                         $("#tempVersionName").val(newVersionName);
                                         $(".upload-status").css('color','orange');
                                         $(".upload-status").html('文件上传中。。。');
                                         loading=dd.loading();
                                     }
                                 }else{
                                     swfUpload.cancelUpload(false1);
                                     $(".upload-status").html('只能上传 *.apk 和 *.ipa 格式的文件！');
                                     $(".upload-status").css('color','red');
                                     fileLegal=false;
                                 }

                             }

                             /**
                              * 文件上传成功后的回调
                              * @param file 上传的文件
                              * @param serverData 服务器在执行完接收文件方法后返回的数据
                              * @param response{Boolean}, 表示是否服务器返回数据
                              */
                             function uploadSuccess(file, serverData, response) {
                                 var res = JSON.parse(serverData);
                                 if(res.data.state != undefined && res.data.state == 'SUCCESS') {
                                     $("#downloadUrl").val(res.data.downloadUrl);
                                     $("#packageSize").val(res.data.packageSize);
                                     $(".upload-status").css("color","green");
                                     $(".upload-status").html('上传成功！');
                                     loading.close();
                                 }
                             }

                             function uploadError() {
                                 $("#downloadUrl").val('');
                                 $(".upload-status").css("color","red");
                                 $(".upload-status").html('上传失败，请重试！');
                                 loading.close();
                             }

                        /*
                        * 检查上传文件格式
                        * */
                        $("#myApp").blur(function(){
                            $(this).next().css('display','none');
                            var fileName=$(this).val().trim();
                            if (fileName.indexOf(".") > 1) {
                                var postfix = fileName.substring(fileName.lastIndexOf("."), fileName.length).toLocaleLowerCase();
                                var legalPostfixs = new Array(".apk", ".ipa");
                                for (var i in legalPostfixs) {
                                    if (legalPostfixs[i]==postfix.trim()) {
                                        fileLegal=true;
                                        return fileLegal;
                                    }
                                }
                                $(this).next().html('只能上传 *.apk 和 *.ipa 格式的文件！');
                                $(this).next().css('display','inline');
                                fileLegal=false;
                            }
                        });

                        /*
                        * 检查版本名称是否合法
                        * */
                        $(".newVersionName").blur(function(){
                            if($(this).val().trim().length>0){
                                versionName=$(this).val();
                                var versions = new Array();
                                versions = versionName.split(".");
                                for(var v in versions){
                                    if(versions[v]<0 || versions[v]>999 ||versions[v].length==0 || isNaN(Number(versions[v]))){
                                        versionNameLegal =false;
                                        $(this).next().text('版本格式（xxx.xxx.xxx），x在0-999之间');
                                        $(this).next().css("color","red");
                                        break;
                                    }else{
                                        versionNameLegal=true;
                                        $(this).next().css("color","black");
                                    }
                                }
                            }
                            if(versionNameLegal){
                                //var loading;

                                $.ajax({
                                    type:'POST',
                                    async:false,
                                    data:{'newVersionName':$(this).val().trim()},
                                    url:'/ajax/app/checkByVersion',
                                    beforeSend: function() {
                                        loading = dd.loading();
                                    },
                                    complete: function() {
                                        loading.close();
                                    },error: function() {
                                        dd.alert('网络异常');
                                    },
                                    dataType:'json',
                                    success:function(result){
                                        if(result.error){
                                            $(".newVersionName").next().text(result.error);
                                            $(".newVersionName").next().css("color","red");
                                            versionNameLegal=false;
                                        }else{
                                            $(".newVersionName").next().text('版本号可用！');
                                            $(".newVersionName").next().css("color","green");
                                            versionNameLegal=true;
                                        }
                                    }
                                });
                            }

                        });
                    }
                }).showModal();
            });
        },

        /**
         * 编辑应用
         */
        editApp: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    appId = $wrap.find('.appId').html().trim(),
                    isForce = $wrap.find('.isForce').val(),
                    upgradeInfo = $wrap.find('.upgradeInfo').html().trim();
                    //env=$wrap.find('.env').html().trim();
                var editDialog = dialog({
                    id: 'editDialog',
                    title: '编辑应用信息',
                    content: document.getElementById('editDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form');
                                    ajax.post($form.attr('action'), $form.serialize(), function(result) {
                                        if(result.success){
                                            editDialog.close().remove();
                                            dd.alert('修改成功！', function(){
                                                window.location.reload(false);
                                            });
                                        }else{
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
                        $(".appId").val(appId);
                        $(".upgradeInfo").val(upgradeInfo);
                        if(isForce==0){
                            $("#no").attr("checked","checked");
                        }else{
                            $("#yes").attr("checked","checked");
                        }
                    }

                }).showModal();
            });
        }
    }

    App.init();
});


function checkFileType(fileName){
    if (fileName.indexOf(".") > 1) {
        var postfix = fileName.substring(fileName.lastIndexOf("."), fileName.length).toLocaleLowerCase();
        var legalPostfixs = new Array(".apk", ".ipa");
        for (var i in legalPostfixs) {
            if (legalPostfixs[i]==postfix.trim()) {
                alert("true")
                return true;
            }
        }
    }
    return false;
}


