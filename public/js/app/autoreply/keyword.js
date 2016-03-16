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
    
    var Keyword = {
        init: function() {
            this.toggleReply();
            this.switchTab();
            this.addRule();
            this.initRules();
            this.addKeyword();
            this.deleteKeyword();
            this.editKeyword();
            this.setKeywordMatchType();
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
                var index = $(event.target).parent('.sub-tab-item').index();   // 获取当前点击元素的索引。
                $(event.target).parents('.reply-editor').find('.form-wrap').eq(index).removeClass("hide").siblings().addClass("hide");  //显示当前内容 隐藏其它几个同辈的
                return false;
            })
        },
        
        addRule: function() {
            var self = this;
            $('[role="addRule"]').on('click', function() {
                var $root = $('.rule-con-wrap'),
                    $divRuleList = $root.find('div.rule-con');
                
                if($divRuleList.length > 0 && $divRuleList.first().find('[name="rid"]').length == 0) {
                    $divRuleList.first().remove();
                } else {
                    var $divNewRule = self.createNewRule();
                    $root.prepend($divNewRule);
                    var um = UM.createEditor('newEditor', {
                        toolbar: [],
                        wordCount: maxContentLen
                    });
                    $divNewRule.data('txtEditor', um);
                    
                    var $preview = $divNewRule.find('img.pic'),
                        $picUrl = $divNewRule.find('[name="picUrl"]');
                    self.fileUpload('upload', $preview, $picUrl);
                }
            });
        },
        
        /**
         * 生成新的规则列表
         */
        createNewRule: function() {
            var newRule = $(document.getElementById('newRuleTmpl').innerHTML);
            newRule.delegate('[role="textMessage"]','submit',this.handleTxtForm);
            newRule.delegate('[role="topic"]','submit',this.handleTopicForm);
            newRule.delegate('[role="addTopic"]', 'click', this.addTopic);
            return newRule;
        },
        
        /**
         * 初始化规则列表
         */
        initRules: function() {
            var self = this,
                $root = $('.rule-con-wrap');
            _.each($root.find('[name="rid"]'), function(item){
                var $item = $(item),
                    rid = $item.val(),
                    $divRule = $item.closest('div.rule-con'),
                    $preview = $divRule.find('img.pic'),
                    $picUrl = $divRule.find('[name="picUrl"]');
                var editor = UM.getEditor('contentEditor_' + rid, {
                    toolbar: [],
                    wordCount: maxContentLen
                });
                self.fileUpload('upload_' + rid, $preview, $picUrl);
                $divRule.data('txtEditor', editor);
            });
            $root.delegate('.hd','click',function() {
                var $this = $(this),
                    $parent = $this.parent(),
                    $ruleCon = $this.parents('.rule-con');
                $parent.toggleClass("edit");
                return false;
            });
            $root.delegate('[role="textMessage"]','submit',this.handleTxtForm);
            $root.delegate('[role="topic"]','submit',this.handleTopicForm);
            $root.delegate('[role="delRule"]', 'click', this.delRule);
            $root.delegate('[role="addTopic"]', 'click', this, this.addTopic);
        },
        
        /**
         * 删除规则
         */
        delRule: function() {
            var self = this;
            dd.confirm('确定要删除规则吗？', function() {
                var $btn = $(self),
                    url = $btn.data('url'),
                    $rid = $btn.closest('div.rule-con').find('[name="rid"]');
                    
                ajax.post(url, {
                    'ruleId': $rid.val(),
                }, function(result){
                    if(result.success){
                        window.location.reload(false);
                    }else{
                        dd.alert(result.error);
                    }
                });
                
            });
        },
        
        /**
         * 添加话题
         */
        addTopic: function(event) {
            var self = event.data,
                $topicDiv = $(this).closest('[role="topic"]'),
                $tids = $topicDiv.find('[name="tids"]'),
                $ulTopicList = $topicDiv.find('ul')
                $li = $ulTopicList.find('li'),
                tmpSelectedList = {},
                tmpSortedList = [];
                
            topicDialog.sortedList = [];
            topicDialog.selectedList = {};
            
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
            
            topicDialog.create({
                onAccept: function(sortedList, selectedList) {
                    $ulTopicList.html(template('selectedTopicTmpl', {'list': sortedList, 'selectedList': selectedList}));
                    var $divTopicWrap = $topicDiv.find('.topic-wrap');
                    self.deleteTopic($divTopicWrap.find('[role="delete"]'), $tids);
                    self.moveUp($divTopicWrap.find('[role="moveUp"]'), $tids);
                    self.moveDown($divTopicWrap.find('[role="moveDown"]'), $tids);
                    
                    $tids.val(topicDialog.getSortedList().join(','));
                    $divTopicWrap.removeClass('none-topic');
                }
            }).showModal();
        },
        
        /**
         * 删除话题
         */
        deleteTopic: function($obj, $tids) {
            var self = this;

            $obj.click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    $ul = $this.closest('ul');
                    length = $ul.find('li').length;

                if (length === 1) {
                    $this.closest('.topic-wrap').addClass('none-topic');

                } else if (length === 2) {
                    $ul.first().find('[role="moveDown"]').remove();
                }

                if ($li.index() === 0) {
                    $li.next('li').prepend($li.find('.pic').clone()).addClass('first');
                    $li.next('li').find('.opt-btns').remove().end().append($li.find('.opt-btns').clone(true));

                } else if (length > 2 && $li.index() === length - 1) {
                    $li.prev('li').find('.opt-btns').replaceWith($li.find('.opt-btns').detach());
                }

                topicDialog.deleteSelectedData($li.attr('data-id'));

                $tids.val(topicDialog.getSortedList().join(','));
                $li.remove();
            });
        },

        /**
         * 上移话题
         */
        moveUp: function($obj, $tids) {
            var self = this;
            $obj.click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    $prevLi = $li.prev('li'),
                    $ul = $this.closest('ul');
                    length = $ul.find('li').length;

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
                $tids.val(topicDialog.getSortedList().join(','));
                $li.detach().insertBefore($prevLi);
            });
        },

        /**
         * 下移话题
         */
        moveDown: function($obj, $tids) {
            var self = this

            $obj.click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    $nextLi = $li.next('li')
                    $ul = $this.closest('ul');
                    length = $ul.find('li').length;

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
                $tids.val(topicDialog.getSortedList().join(','));
                $li.detach().insertAfter($nextLi);
            });
        },
        
        /**
         * 修改封面图
         */
        fileUpload: function(id, $preview, $picUrl) {
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
                file_dialog_complete_handler: fileDialogComplete,  // 选择文件对话框关闭时触发
                upload_success_handler: uploadSuccess,  // 文件上传成功后触发
                upload_error_handler: uploadError,  //文件上传出错时触发

                button_placeholder_id: id,
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
                    $preview.attr('src', res.url['720']);
                    $picUrl.val(res.url['720']);
                }
            }
            
            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        },
        
        /**
         * 添加关键字
         */
        addKeyword: function() {
            var self = this;
            $('.rule-con-wrap').delegate('[role="addKeyword"]','click',function(event) {
                var $target = $(event.target),
                    $divRule = $target.closest('div.rule-con'),
                    addKeywordEditor = null,
                    addKeywordDialog = dialog({
                    id: 'addkeywordDialog',
                    title : '添加关键字',                        
                    content: document.getElementById('addKeywordDialogTmpl').innerHTML,   
                    button: [{
                            value: '确定',
                            callback: function () {
                                var dialog = this,
                                    $dialog = $(dialog.__popup),
                                    $keywordList = dialog.__popup.find('div.keyword-con').children(),
                                    $divKeywordShowList = $divRule.find('div.row-keyword');
                                    
                                _.each($keywordList, function(item) {
                                    $divKeywordShowList.append(template('newKeywordTmpl', {'name': $(item).text()}))
                                });
                                var newKeyword = addKeywordEditor.getContentTxt();
                                if(!_.isEmpty(newKeyword)) {
                                    $divKeywordShowList.append(template('newKeywordTmpl', {'name': newKeyword}))
                                }
                            },
                            autofocus: true
                        },{ value: '取消' } 
                    ],
                    onshow: function(){
                        var dialog = this,
                            $dialog = $(dialog.__popup),
                            $divKeyword = dialog.__popup.find('div.keyword-con');
                        
                        addKeywordEditor = UM.createEditor('addKeywordEditor', {
                            toolbar: [],
                            wordCount: 30
                        });
                            
                        $dialog.keyup(function(event){
                            if(event.keyCode == 13){
                                var val = $.trim(addKeywordEditor.getContentTxt());
                                if (!_.isEmpty(val)){
                                    var inputVal = '<span class="keyword">'+val+'<a href="javascript:;" class="del-word"></a></span>';
                                    $dialog.find('.keyword-con').prepend(inputVal);
                                    addKeywordEditor.setContent('<p></p>');
                                }
                            }
                        });
                        
                        $dialog.delegate('.del-word','click',function() {
                            $(this).parent().remove();
                        });
                    }}).showModal();                    
            });
        },
        
        /**
         * 删除关键字
         */
        deleteKeyword: function() {
            var self = this;
            $('.rule-con-wrap').delegate('[role="deleteKeyword"]','click',function() {
                $(this).parent().parent().remove();
            });
        },
        
        setKeywordMatchType: function() {
            var self = this;
            $('.rule-con-wrap').delegate('[role="keywordMatch"]','click',function() {
                var $this = $(this),
                    $keyword = $this.closest('span.keyword-row').find('span.keyword'),
                    mode = $keyword.data('mode');
                    
                if(mode == 0) {
                    $this.text('未全匹配');
                    $keyword.data('mode', 1);
                } else {
                    $this.text('已全匹配');
                    $keyword.data('mode', 0);
                }
            });
        },
        
        /**
         * 修改关键字
         */
        editKeyword: function() {
            var self = this;
            $('.rule-con-wrap').delegate('[role="editKeyword"]','click',function() {
                var $keyword = $(this).closest('span.keyword-row').find('.keyword'),
                    keyword = $keyword.text(),
                    editKeywordEditor = null;
                    
                var editKeywordDialog = dialog({
                    id: 'editKeywordDialog',
                    title : '修改关键字',                        
                    content: document.getElementById('editKeywordDialogTmpl').innerHTML,   
                    button: [
                    {
                        value: '确定',
                        callback: function () {
                            var $dialog = $(this.__popup),
                                updateKeyword = $.trim(editKeywordEditor.getContentTxt()),
                                $errorMsg = $dialog.find('.error-msg');
                                
                                console.log($errorMsg);
                            if(_.isEmpty(updateKeyword)) {
                                $errorMsg.text('关键字不能为空');
                                return false;
                            }
                            if(editKeywordEditor.getContentLength(true) > 30) {
                                $errorMsg.text('关键字不能大于30个字');
                                return false;
                            }
                            $keyword.text(updateKeyword);
                        },
                        autofocus: true
                    },
                    {
                        value: '取消'
                    }
                ],
                onshow: function() {
                    var dialog = this,
                        $dialog = $(dialog.__popup);
                    
                    editKeywordEditor = UM.createEditor('editKeywordEditor', {
                        toolbar: [],
                        wordCount: 30
                    });
                    editKeywordEditor.setContent(keyword);
                    
                }}).showModal();                    
            });
        },
        
        handleTxtForm: function() {
            var $form = $(this).find('form'),
                $root = $form.closest('div.rule-con'),
                $ruleName = $root.find('[name="ruleName"]'),
                $keywordList = $root.find('span.keyword'),
                editor = $root.data('txtEditor'),
                ruleName = $.trim($ruleName.val()),
                $rid = $root.find('[name="rid"]');
                
            if(_.isEmpty(ruleName)) {
                dd.alert('规则名不能为空');
                return false;
            }
            
            if($keywordList.length == 0) {
                dd.alert('请至少输入一个关键词');
                return false;
            }
            
            if($keywordList.length > 10) {
                dd.alert('最多10个关键词');
                return false;
            }
            
            var content = $.trim(editor.getContentTxt());
            if(_.isEmpty(content)) {
                dd.alert('内容为必填项');
                return false;
            } 
            if(editor.getContentLength(true) > maxContentLen) {
                dd.alert('内容字数过长');
                return false;
            }
            
            var keywordList = new Array();
            _.each($keywordList, function(item) {
                var $item = $(item);
                var keyword = {
                    'id': $item.data('id'),
                    'name': $item.text(),
                    'matchType': $item.data('mode')
                }
                keywordList.push(keyword);
            });
            
            ajax.post($form.attr('action'), {
                'ruleId': $rid.val(),
                'content': content,
                'ruleName': ruleName,
                'keywordListStr': JSON.stringify(keywordList)
            }, function(result){
                if(result.success){
                    dd.alert('保存成功', function() {
                        window.location.reload(false);
                    });
                }else{
                    dd.alert(result.error);
                }
            });
            return false;
        },
        
        handleTopicForm: function() {
            var $form = $(this).find('form'),
                $root = $form.closest('div.rule-con'),
                $ruleName = $root.find('[name="ruleName"]'),
                $keywordList = $root.find('span.keyword'),
                $picUrl = $root.find('[name="picUrl"]'),
                $tids = $root.find('[name="tids"]'),
                ruleName = $.trim($ruleName.val()),
                $rid = $root.find('[name="rid"]');
            
            if(_.isEmpty(ruleName)) {
                dd.alert('规则名不能为空');
                return false;
            }
            
            if($keywordList.length == 0) {
                dd.alert('请至少输入一个关键词');
                return false;
            }
            
            if($keywordList.length > 10) {
                dd.alert('最多10个关键词');
                return false;
            }
            
            if(_.isEmpty($tids.val())) {
                dd.alert('请选择发布的话题');
                return false;
            }
            
            if(_.isEmpty($picUrl.val())) {
                dd.alert('请选择话题封面');
                return false;
            }
            
            var keywordList = new Array();
            _.each($keywordList, function(item) {
                var $item = $(item);
                var keyword = {
                    'id': $item.data('id'),
                    'name': $item.text(),
                    'matchType': $item.data('mode')
                }
                keywordList.push(keyword);
            });
            
            ajax.post($form.attr('action'), {
                'ruleId': $rid.val(),
                'tids': $tids.val(),
                'picUrl': $picUrl.val(),
                'ruleName': ruleName,
                'keywordListStr': JSON.stringify(keywordList)
            }, function(result){
                if(result.success){
                    dd.alert('保存成功', function() {
                        window.location.reload(false);
                    });
                }else{
                    dd.alert(result.error);
                }
            });
            return false;
        }
        
    };
    
    Keyword.init();
    
});