/**
 * @description: 自动回复
 * @author: guangwq
 * @date: 2014-11-27
 */

define(function(require) {
    
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    
    var template = require('../common/module/template_native');  // js模板引擎
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    var topicDialog = require('../common/module/topicDialog');
    var maxContentLen = 400;
    
    var Follow = {
        init: function() {
            this.toggleReply();
            this.switchTab();
            this.bindTxtForm();
            this.addTopic();
            this.deleteTopic($('[role="delete"]'));
            this.moveUp($('[role="moveUp"]'));
            this.moveDown($('[role="moveDown"]'));
            this.bindTopicForm();
            this.fileUpload();
        },
        
        /**
         * 设置自动回复
         */
        toggleReply: function() {
            var self = this;
            $('[role="toggleReply"]').on('click', function() {
                var $this = $(this),
                    set = $(this).data('set'),
                    url = $this.closest('div.main-replylock').data('url');
                dialog({
                    id: 'toggleReplyDialog',
                    title :  '提示',
                    content: document.getElementById('toggleReplyDialogTmpl').innerHTML,  
                    button: [{
                        value: '确定',
                        callback: function () {
                            ajax.post(url, {set:(set == 1)}, function(result){
                                if(result.success){
                                    window.location.reload(false);
                                }else{
                                    dd.alert(result.error);
                                }
                            });
                            return false;
                        },
                        autofocus: true
                    },{
                        value: '取消'
                    }
                ]}).showModal();                    
            });
        },
        
        /**
         * 选项卡切换
         */
        switchTab: function() {
            var $tabNav =$(".sub-tab li");//选取导航
            var $tabCon =$(".form-wrap-con .form-wrap");//选取内容
            $('.rule-con-wrap').delegate(".sub-tab li",'click',function(event) {
                $(event.target).parent('.sub-tab-item').addClass("current").siblings().removeClass("current");
                var index =  $(event.target).parent('.sub-tab-item').index();   // 获取当前点击元素的索引。
                $(event.target).parents('.reply-editor').find('.form-wrap').eq(index).removeClass("hide").siblings().addClass("hide");  //显示当前内容 隐藏其它几个同辈的
                return false;
            })
        },
        
        bindTxtForm: function() {
            var um = UM.getEditor('contentEditor', {
                toolbar: [],
                wordCount: maxContentLen
            });
            var $textDiv = $('[role="textMessage"]');
            $textDiv.find('.btn-active').click(function(){
                var content = um.getContent(),
                    contentLen = um.getContentLength(true),
                    $errorMsg = $textDiv.find('.error-msg'),
                    $form = $textDiv.find('form');
                if(_.isEmpty(content)) {
                    $errorMsg.text('内容为必填项');
                    return false;
                } else {
                    $errorMsg.text('');
                }
                if(contentLen > maxContentLen) {
                    $errorMsg.text('内容字数过长');
                    return false;
                } else {
                    $errorMsg.text('');
                }
                
                ajax.post($form.attr('action'), $form.serialize(), function(result){
                    if(result.success){
                        dd.alert('保存成功');
                    }else{
                        dd.alert(result.error);
                    }
                });
                
                return false;
            });
        },
        
        bindTopicForm: function() {
            var $topicDiv = $('[role="topic"]');
            $topicDiv.find('.btn-active').click(function(){
                var $selectedId = $topicDiv.find('[name="tids"]'),
                    $picUrl = $topicDiv.find('[name="picUrl"]'),
                    $form = $topicDiv.find('form');
                if(_.isEmpty($selectedId.val())) {
                    $topicDiv.find('.error-msg').text('请选择发布的话题');
                    return false;
                }
                if(_.isEmpty($picUrl.val())) {
                    $topicDiv.find('.error-msg').text('请选择话题封面');
                    return false;
                }
                
                ajax.post($form.attr('action'), $form.serialize(), function(result){
                    if(result.success){
                        dd.alert('保存成功');
                    }else{
                        dd.alert(result.error);
                    }
                });
                
                return false;
            });
        },
        
        /**
         * 添加话题
         */
        addTopic: function() {
            var self = this,
                $btnAddTopic = $('[role="addTopic"]'),
                $topicDiv = $btnAddTopic.closest('[role="topic"]'),
                $tids = $topicDiv.find('[name="tids"]'),
                $li = $topicDiv.find('ul').find('li'),
                tmpSelectedList = {},
                tmpSortedList = [];
            
            if(!_.isEmpty($.trim($tids.val()))) {
                tmpSortedList = $tids.val().split(',');                
            }
            
            if(tmpSortedList.length > 0) {
                topicDialog.sortedList = tmpSortedList;
                _.each($li, function(item){
                    var $item = $(item),
                        topicId = $item.data('id'),
                        sid = $item.data('sid');
                    var obj = {
                        'topic_id': topicId,
                        'title': $li.find('.title').text(),
                        'sponsor_id': sid
                    }
                    tmpSelectedList[topicId] = obj;
                });
                topicDialog.selectedList = tmpSelectedList;
            }

            $btnAddTopic.click(function() {
                topicDialog.create({
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

                topicDialog.deleteSelectedData($li.attr('data-id'));

                $('#selectedId').val(topicDialog.getSortedList().join(','));
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

                topicDialog.moveTopic($li.attr('data-id'), true);
                $('#selectedId').val(topicDialog.getSortedList().join(','));
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
                
                topicDialog.moveTopic($li.attr('data-id'), false);
                $('#selectedId').val(topicDialog.getSortedList().join(','));
                $li.detach().insertAfter($nextLi);
            });
        },
        
        /**
         * 修改封面图
         */
        fileUpload: function() {
            var sid=$('#sid').val();
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/image/upload',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
                post_params:{sid:sid},

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
                if(res.state != undefined && res.state == 'SUCCESS') {
                    $('#picPreview').attr('src', res.url['720']);
                    $('#picUrl').val(res.url['720']);
                    //$('[]').find('.error-msg').text('');
                }
            }

            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        }
    };
    
    Follow.init();
});