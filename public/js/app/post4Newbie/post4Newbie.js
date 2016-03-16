/**
 * Created by junefsh on 2015/11/25.
 */
/**
 * @description: 公众号消息页面交互
 * @author: zhongna
 * @date: 2014-09-05
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');

    var pagination = require('../common/module/pagination');  // ajax分页插件
    var template = require('../common/module/template_native');  // js模板引擎
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');
    var topicDialog = require('../common/module/postsDialog');

    var maxContentLen = 400;
    var Pa = {
        init: function() {
            this.addTopic();
            this.initRegTopic();
            this.deleteTopic($('[role="delete"]'));
            this.moveUp($('[role="moveUp"]'));
            this.moveDown($('[role="moveDown"]'));
            this.initFormEvent();
            this.fileUpload();
        },

        initRegTopic:function()
        {
            var dataEle = $('#init-table');
            var childredArray = dataEle.children();
            if(childredArray.length < 1)
            {
                return;
            }
            var sortedList = new Array();
            var selectedList = new Array();
            for(var i = 0;i<childredArray.length ;i++)
            {
                var trEle = childredArray[i];
                var postsId = trEle.children[0].innerHTML;
                var obj = {
                    'posts_id': postsId,
                    'title': trEle.children[1].innerHTML,
                    'content_url': trEle.children[2].innerHTML,
                    'img_url': trEle.children[3].innerHTML
                }
                sortedList.push(postsId);
                selectedList[postsId] = obj;
            }
            //填充模板数据
            $('.topic-list').html(template('selectedTopicTmpl', {'list': sortedList, 'selectedList': selectedList}));
            sortedListG = sortedList;
            selectedListG = selectedList;
            topicDialog.setSortedList(sortedListG);
            topicDialog.setSelectedList(selectedListG);
            $('#selectedId').val(sortedList.join(','));
            $('#topic').find('.error-msg').text('');
            $('.topic-wrap').removeClass('none-topic');
        },
        /**
         * 添加话题
         */
        addTopic: function() {
            var self = this;

            $('[role="addTopic"]').click(function() {
                var $this = $(this);
                var picUrl = $('#picUrl').val();
                var limit=5;
                var url='/ajax/posts/list?pid=10000';
                topicDialog.create({
                    limit: limit,
                    postsDataUrl:url,
                    sortedList:sortedListG,
                    selectedList:selectedListG,
                    onAccept: function(sortedList, selectedList) {
                        $('.topic-list').html(template('selectedTopicTmpl', {'list': sortedList, 'selectedList': selectedList}));
                        sortedListG = sortedList;
                        selectedListG = selectedList;
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
            $('#set-posts').click(function(){
                var $topic = $('#topic');
                dd.confirm('是否更新数据？', function(){
                    var dia = this,$form = $('#postForm');
                    ajax.post($form.attr('action'), $form.serialize(), function(result){
                        if(result.success){
                            //更新当前页面数据
                            location.href = '/posts4newbie/get';
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

