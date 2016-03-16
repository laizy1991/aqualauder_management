/**
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../common/module/selectRange');  // 设置光标
    require('../../thirdParty/chosen');  // 下拉选择框插件
    try {
        require('../common/module/umeditor_custom');  // 自定义UMeditor控件
    } catch(e) {}
    require('../../thirdParty/underscore');
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');

    var Topic = {
        init: function() {
            this.initChosen();
            try {
                this.initTopicForm();
            } catch(e) {}
            this.deleteTopic($('[role="delete"]'));
            this.recommend($('[role="recommend"]'));
            this.fileUpload();

        },

        /**
         * 初始化文本框插件
         */
        initTopicForm: function() {
            var maxCount = 200;
            var topicEditor = UM.getEditor('topicEditor', {
                toolbar:[
                    ' bold italic underline link unlink | emotion2 | posts  | source fullscreen '
                ],
                wordCount: maxCount,
                filterRules: function(){
                    function transP(node){
                        node.tagName = 'p';
                        node.tagName = 'a';
                        node.setStyle();
                    }
                    return {
                        //直接删除及其字节点内容
                        '-' : 'script style object iframe embed input select',
                        'a': transP,
                        //'a': {$:{}},
                        'p': {$:{}},
                        'br':{$:{}},
                        'div':{'$':{}},
                        'li':{'$':{}},
                        'caption':transP,
                        'th':transP,
                        'tr':transP,
                        'h1':transP,'h2':transP,'h3':transP,'h4':transP,'h5':transP,'h6':transP,
                        'td':function(node){
                            //没有内容的td直接删掉
                            var txt = !!node.innerText();
                            if(txt){
                                node.parentNode.insertAfter(UE.uNode.createText(' &nbsp; &nbsp;'),node);
                            }
                            node.parentNode.removeChild(node,node.innerText())
                        }
                    }
                }()
            });
            //添加话题
            $('#btnCreate').click(function(){
                var $this = $("#createTopicForm"),
                    $name=$("#name"),
                    $imgUrl=$("#imgUrl"),
                    $index=$("#index"),
                    $gameId=$("#gameId"),
                    $recommended=$('input[name="recommended"]:checked ');
                    content = topicEditor.getContent(),
                    contentLen = topicEditor.getContentLength(true);


                if(_.isEmpty(content)) {
                    $('.editor-wrap').find('.error-msg').text('说点什么吧');
                    return false;
                } else {
                    $('.editor-wrap').find('.error-msg').text('');
                }
                if(contentLen > maxCount) {
                    $('.editor-wrap').find('.error-msg').text('内容字数过长');
                    return false;
                } else {
                    $('.editor-wrap').find('.error-msg').text('');
                }

                if (_.isEmpty($.trim($name.val()))) {
                    $name.next().css("display","inline");
                    $name.next().text('话题名称为必填项');
                    return false;
                }else{
                    if($.trim($name.val()).length>10){
                        $name.next().text('话题字数不能超过10');
                        return false;
                    }else{
                        $name.next().text('');
                    }
                }

                if(_.isEmpty($.trim($imgUrl.val()))){
                    $imgUrl.next().next().css("display","inline");
                    $imgUrl.next().next().text('话题图标为必填项');
                    return false;
                }else{
                    $imgUrl.next().next().text('');
                }

                if(_.isEmpty($.trim($index.val()))){
                    $index.next().next().css("display","inline");
                    $index.next().hide();
                    $index.next().next().text('话题索引为必填项');
                    return false;
                }else{
                    $index.next().next().text('');
                }

                if(!Number($.trim($index.val()))){
                    $index.next().hide();
                    $index.next().next().text('话题索引值必须为正整数');
                    return false;
                }else{
                    $index.next().show();
                    $index.next().next().text('');
                }

                var params={
                    "name":$name.val(),
                    "avatarUrl":$imgUrl.val(),
                    "index":$index.val(),
                    "recommended":$recommended.val(),
                    "intro":content,
                    "gameId":$gameId.val()
                }
                ajax.post("/ajax/topic/create", params, function(result){
                    if(result.success){
                        dd.alert('添加话题成功！', function(){
                            $("#picPreview").attr('src','/public/images/default_photo.png');
                            $name.val('');
                            $imgUrl.val('');
                            $index.val('');
                            topicEditor.setContent('');
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
         * 删除话题
         */
        deleteTopic: function (obj) {
            obj.click(function() {
                    var $this = $(this),
                        $wrap = $this.closest('tr'),
                        topicId=$wrap.find('.topicId').val();

                dd.confirm('是否删除选中话题？', function() {
                    ajax.post('/ajax/Topic/delete',{topicId:topicId}, function(result){
                        if(result.success){
                            window.location.reload(false)
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },

        /**
         * 推荐/取消推荐话题
         */
        recommend: function (obj) {
            obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $doRecommend=$wrap.find('.doRecommend'),
                    $unRecommend=$wrap.find('.unRecommend'),
                    $action=$wrap.find('.action'),
                    topicId=$wrap.find('.topicId').val(),
                    action=$action.val();
                    var opera="";
                    var act=null;
                    if(action==1){
                        act=0;
                        opera="取消推荐";
                    }else{
                        act=1;
                        opera="推荐";
                    }

                    ajax.post('/ajax/Topic/recommend', {topicId:topicId,act:act}, function(result){
                    if(result.success){
                        dd.alert(opera+'成功！', function(){
                            if(act==1){
                                $doRecommend.hide();
                                $unRecommend.show();
                                $action.val(1);
                            }else{
                                $doRecommend.show();
                                $unRecommend.hide();
                                $action.val(0);
                            }
                        });
                    }else{
                        dd.alert(result.error);
                    }
                });
            });
        },

        /**
         * 修改图标
         */
        fileUpload: function() {
            var sid=$('#sid').val();
            var uid=10000;
            var scalableImg=1;
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/image/upload',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
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
                button_text: '<span class="button-text">修改图标</span>',
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
                    $('#imgUrl').val(res.data.imgUrl);
                }else{
                    alert("er");
                }
            }

            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        }

    }

    Topic.init();
});