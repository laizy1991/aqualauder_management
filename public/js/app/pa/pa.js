/**
 * @description: 公众号消息页面交互
 * @author: zhongna
 * @date: 2014-09-05
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/chosen');  // 下拉选择框插件
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../common/module/umeditor_custom');  // 自定义UMeditor控件
    require('../../thirdParty/underscore');


    var pagination = require('../common/module/pagination');  // ajax分页插件
    var template = require('../common/module/template_native');  // js模板引擎
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');
    var postsDialog = require('../common/module/postsDialog');

    var maxContentLen = 400;
    var pid=$("#pid").val();
    var Pa = {
        init: function() {
            this.initChosen();
            this.switchRadio();
            this.switchTab();
            var toolbar = (contentType == 3) ? ['image'] : [];
            var um = null;
            if(contentType == 3) {
                um = UM.getEditor('topicEditor', {
                    toolbar: toolbar,
                    wordCount: maxContentLen,
                    filterRules: function(){
                       return {
                           //直接删除及其字节点内容
                           '-' : 'script style object iframe embed input select',
                           'a': {$:{}}
                       }
                    }()
                });
            } else {
                um = UM.getEditor('topicEditor', {
                    toolbar: toolbar,
                    wordCount: maxContentLen
                });
            }
            if(window.location.toString().indexOf('&type=-1')>0){
                um.setContent('您的投稿过于简单，未被通过，建议您可以看看攻略中别的用户写的攻略。');
            }
            if(dialogType==1){
                $("#all").attr("checked","checked");
                $("#uid").val('');
                $(".uid").addClass("hide");
            }else{
                $("#multi").attr("checked","checked");
                $(".uid").removeClass("hide");
            }

            if(contentType==1|| contentType==3){
                $("#textMessage").show();
                $("#topic").hide();
            }else if(contentType==9 || contentType==10){
                $("#topic").show();
                $("#textMessage").hide();
            }

            this.addPosts();
            this.deleteTopic($('[role="delete"]'));
            this.moveUp($('[role="moveUp"]'));
            this.moveDown($('[role="moveDown"]'));
            this.initFormEvent();
            this.fileUpload();

        },

        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
            $("#pid").change(function () {
                pid=$(this).val()
                $(".topic-wrap").addClass("none-topic");
                $(".topic-list").empty();
                $("#picUrl").val('');
                $("#selectedId").val('');
            });
        },

        /**
         * 初始化单选框插件
         */
        switchRadio: function() {
            var $dialogType=$("input[name='dialogType']")
            $dialogType.change(function () {
                dialogType=$(this).val();
                if(dialogType==2){
                    $(".uid").removeClass("hide");
                }else{
                    $(".uid").addClass("hide");
                }
            });
        },

        /**
         * 选项卡切换
         */
        switchTab: function() {
            $('.sub-tab-item a').click(function() {
                var $this = $(this),
                    $subTabItem = $this.closest('.sub-tab-item'),
                    id = $this.attr('href'),
                    ct=$this.attr('contentType'),
                    dialogType=$("input[name='dialogType']:checked").val();

                contentType=ct;
                var pid=$("#pid").val();
                $("#contentType").val(ct);
                var uid=$("#uid").val();
                if(uid.trim().length>0){
                    window.location="/pa/post?contentType="+ct+"&dialogType="+dialogType+"&pid="+pid+"&uid="+uid;
                }else{
                    window.location="/pa/post?contentType="+ct+"&dialogType="+dialogType+"&pid="+pid;
                }
                $subTabItem.addClass('current').siblings().removeClass('current');
                $('#' + id).show().siblings('.form-wrap').hide();
                return false;
            });
        },

        /**
         * 添加话题
         */
        addPosts: function() {
            var self = this;

            $('[role="addPosts"]').click(function() {
                var $this = $(this);

                var picUrl = $('#picUrl').val();
                var ct=$("#contentType").val();
                var limit=1;
                if(ct==10){
                    limit=5;
                }
                
                postsDialog.create({
                    limit: limit, 
                    postsDataUrl: '/ajax/posts/list?pid='+$("#pid").val(),
                    onAccept: function(sortedList, selectedList) {
                        $('.topic-list').html(template('selectedTopicTmpl', {'list': sortedList, 'selectedList': selectedList}));
                        self.deleteTopic($('.topic-wrap').find('[role="delete"]'));
                        self.moveUp($('.topic-wrap').find('[role="moveUp"]'));
                        self.moveDown($('.topic-wrap').find('[role="moveDown"]'));

                        $('#selectedId').val(sortedList.join(','));
                        $('#topic').find('.error-msg').text('');
                        $('.topic-wrap').removeClass('none-topic');
                    }
                }).showModal();
                $('.chosen-select').chosen({disable_search_threshold: 10});
            });
        },

        /**
         * 删除话题
         */
        deleteTopic: function(obj) {
            var self = this,
                $obj = obj;

            $obj.click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    length = $('.topic-list li').length;

                if (length === 1) {
                    $this.closest('.topic-wrap').addClass('none-topic');

                } else if (length === 2) {
                    $('.topic-list li:first').find('[role="moveDown"]').remove();
                }

                if ($li.index() === 0) {
                    $li.next('li').prepend($li.find('.pic').clone()).addClass('first');
                    $li.next('li').find('.opt-btns').remove().end().append($li.find('.opt-btns').clone(true));

                } else if (length > 2 && $li.index() === length - 1) {
                    $li.prev('li').find('.opt-btns').replaceWith($li.find('.opt-btns').detach());
                }

                postsDialog.deleteSelectedData($li.attr('data-id'));

                $('#selectedId').val(postsDialog.getSortedList().join(','));
                $li.remove();
            });
        },

        /**
         * 上移话题
         */
        moveUp: function(obj) {
            var self = this,
                $obj = obj;

            $obj.click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    $prevLi = $li.prev('li'),
                    length = $('.topic-list li').length;

                if ($prevLi.index() === 0) {
                    var $liOptBtns = $li.find('.opt-btns').clone(true);
                    $li.addClass('first').find('.opt-btns').replaceWith($prevLi.find('.opt-btns').clone(true));
                    $prevLi.removeClass('first').find('.opt-btns').replaceWith($liOptBtns);

                } else if ($li.index() === length - 1) {
                    var $liOptBtns = $li.find('.opt-btns').clone(true);
                    $li.find('.opt-btns').replaceWith($prevLi.find('.opt-btns').clone(true));
                    $prevLi.find('.opt-btns').replaceWith($liOptBtns);
                }

                postsDialog.moveTopic($li.attr('data-id'), true);
                $('#selectedId').val(postsDialog.getSortedList().join(','));
                $li.detach().insertBefore($prevLi);
            });
        },

        /**
         * 下移话题
         */
        moveDown: function(obj) {
            var self = this,
                $obj = obj;

            $obj.click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    $nextLi = $li.next('li')
                    length = $('.topic-list li').length;

                if ($nextLi.index() === 1) {
                    var $liOptBtns = $li.find('.opt-btns').clone(true);
                    $li.removeClass('first').find('.opt-btns').replaceWith($nextLi.find('.opt-btns').clone(true));
                    $nextLi.addClass('first').find('.opt-btns').replaceWith($liOptBtns);

                } else if ($nextLi.index() === length - 1) {
                    var $liOptBtns = $li.find('.opt-btns').clone(true);
                    $li.find('.opt-btns').replaceWith($nextLi.find('.opt-btns').clone(true));
                    $nextLi.find('.opt-btns').replaceWith($liOptBtns);
                }
                
                postsDialog.moveTopic($li.attr('data-id'), false);
                $('#selectedId').val(postsDialog.getSortedList().join(','));
                $li.detach().insertAfter($nextLi);
            });
        },

        /**
         * 修改封面图
         */
        fileUpload: function() {
            var sid=$('#sid').val();
            var uid=10000;
            var scalableImg=1;
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/image/upload',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
                //post_params:{sid:sid},
                post_params:{sid:sid,uid:uid,type:scalableImg},

                file_types: "*.jpg;*.jpeg;*.gif;*.png;",
                file_types_description: '图片',
                file_size_limit: '102400',

                // handlers
                file_queue_error_handler: fileQueueError,  // 文件加入上传队列失败时触发
                file_dialog_complete_handler: fileDialogComplete,  // 选择文件对话框关闭时触发
                upload_success_handler: uploadSuccess,  // 文件上传成功后触发
                upload_error_handler: uploadError,  //文件上传出错时触发

                button_placeholder_id: 'upload',
                button_text: '<span class="button-text">修改封面</span>',
                button_text_style: '.button-text{color: #333333; font-family: "微软雅黑"; font-size:16px;}',
                button_text_left_padding: 21,
                button_text_top_padding: 5,
                button_width: 110,
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

            // 选择文件对话框关闭时的回调
            function fileDialogComplete() {
                this.startUpload();
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
                    $('#picPreview').attr('src',res.data.imgUrl);
                    $('#picUrl').val(res.data.imgUrl);
                    $('#topic').find('.error-msg').text('');
                }
            }

            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        },

        initFormEvent: function() {
            $('.btn-active').click(function(){
                var $uid=$('#uid');
                var uid=$uid.val();
                if($uid.is(":visible")) {
                    if(uid.length>0){
                        var uids =uid.split(",");
                        for(var v in uids){
                            if(!Number(uids[v])){
                                $("#uid").next().addClass("hide");
                                $("#uid").next().next().html("请输入正确的用户ID");
                                return false;
                            }
                        }
                        $("#uid").next().removeClass("hide");
                        $("#uid").next().next().addClass("hide");
                    }else{
                        $("#uid").next().addClass("hide");
                        $("#uid").next().next().html("请输入用户ID");
                        return false;
                    }
                }
                if($("#pid").val()==0){
                    $("#pid").next().next().text("请选择公众号！");
                    $("#pid").select();
                    return;
                }else{
                    $("#pid").next().next().text("");
                }

                var $topic = $('#topic');
                if($topic.is(":visible") ||contentType==9 || contentType==10 ) {
                    if(_.isEmpty($('#selectedId').val())) {
                        $topic.find('.error-msg').text('请选择发布的帖子');
                        return false;
                    }
                    if(_.isEmpty($('#picUrl').val())) {
                        $topic.find('.error-msg').text('请选择帖子封面');
                        return false;
                    }
                } else {
                    var um = UM.getEditor('topicEditor'),
                        content = um.getContent(),
                        contentLen = um.getContentLength(true),
                        $errorMsg = $('.editor-wrap').find('.error-msg');
                    if(_.isEmpty(content) && contentType==1) {
                        $errorMsg.text('内容为必填项');
                        return false;
                    } else {
                        $errorMsg.text('');
                    }
                    if(contentType==3){
                        if(_.isEmpty($("#photoUrls").val())){
                            $errorMsg.text('请选择图片');
                            return;
                        }else{
                            var imgUrl=$("#picUrl").val($("#photoUrls").val());
                        }
                    }

                    if(contentLen > maxContentLen) {
                        $errorMsg.text('内容字数过长');
                        return false;
                    } else {
                        $errorMsg.text('');
                    }
                }
                dd.confirm('是否发布内容？', function(){
                    var dia = this,
                        $form = $('#postForm');

                    var dialogType=$("input[name='dialogType']:checked").val();
                    var contentType=$("#contentType").val();
                    var uid=$("#uid").val();
                    var pid=$("#pid").val();
                    ajax.post($form.attr('action'), $form.serialize(), function(result){
                        if(result.success){
                            dia.close();
                            $("#picUrl").val('');
                            dd.alert("发送成功！");
                            if(window.location.toString().indexOf('&type=-1')>0){
                                window.location="/posts/contributions";
                                return;
                            }
                            if(uid.trim().length>0){
                                window.location="/pa/post?contentType="+contentType+"&dialogType="+dialogType+"&pid="+pid+"&uid="+uid;
                            }else{
                                window.location="/pa/post?contentType="+contentType+"&dialogType="+dialogType+"&pid="+pid;
                            }

                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
                return false;
            });
        }
    }

    Pa.init();
});

