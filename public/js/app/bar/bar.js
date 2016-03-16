/**
 * @description: 公会吧页面交互
 * @author: zhongna
 * @date: 2014-09-01
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../common/module/selectRange');  // 设置光标
    try {
        require('../common/module/umeditor_custom');  // 自定义UMeditor控件
    } catch(e) {}
    require('../../thirdParty/underscore');
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');

    var Bar = {
        init: function() {
            this.showListOpts();
            this.subReply();
            this.reReply();
            this.initSetTop();
            this.initSetHighlight();
            this.initDel();
            this.commentSubmit();
            this.replySubmit();
            this.initCommentSetTop();
            this.initCommentDel();
            this.floorExplain();
            try {
                this.initTopicPostForm();
            } catch(e) {}
            this.delReply();
        },
        
        initTopicPostForm: function() {
            var maxCount = 1000;
            var topicEditor = UM.getEditor('topicEditor', {
                toolbar:[
                    'fontfamily fontsize bold italic underline forecolor backcolor link unlink | justifyleft justifycenter justifyright justifyjustify |',
                    'emotion image fullscreen ' + ((type == 2) ? '| invitation sharespace topic' : ' | topic'),
                ],
                wordCount: maxCount,
                filterRules: function(){
                   function transP(node){
                       node.tagName = 'p';
                       node.setStyle();
                   }
                   return {
                       //直接删除及其字节点内容
                       '-' : 'script style object iframe embed input select',
                       'a': {$:{}},
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
            $('#topicPostForm').submit(function(){
                var $this = $(this),
                    $title = $this.find('[name="form.title"]'),
                    content = topicEditor.getContent(),
                    isSteppedFloor = $('#isSteppedFloor'),
                    $steppedFloor = $this.find('[name="form.steppedFloor"]'),
                    contentLen = topicEditor.getContentLength(true);
                    
                if(_.isEmpty($title.val())) {
                    $title.next().text('标题为必填项');
                    return false;
                } else {
                    $title.next().text('');
                }
                if(_.isEmpty(content)) {
                    $('.editor-wrap').find('.error-msg').text('内容为必填项');
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
                
                if(isSteppedFloor.get(0).checked && !checkStepFloor($steppedFloor.val())) {
                    $steppedFloor.parent().find('.error-msg').text('请输入正确的楼层');
                    return false;
                } else {
                    $steppedFloor.parent().find('.error-msg').text('');
                }
            });
        },
        
        replySubmit: function() {
            $('.item').find('form').submit(function(){
                var $this = $(this),
                    content = $this.find('textarea').val();
                if(_.isEmpty(content)) {
                    $this.find('.error-msg').text('回复内容不能为空');
                    return false;
                }
                
                ajax.post($this.attr('action'), $this.serialize(), function(result) {
                    if(result.success){
                        window.location.reload(false);
                    }else{
                        dd.alert(result.error);
                    }
                });
                
                return false;
            });
        },
        
        commentSubmit: function() {
            $('#cmtForm').submit(function() {
                var $this = $(this),
                    content = $this.find('textarea').val();
                if(_.isEmpty(content)) {
                    $this.find('.error-msg').text('回复内容不能为空');
                    return false;
                }
                ajax.post($this.attr('action'), $this.serialize(), function(result) {
                    if(result.success){
                        window.location.reload(false);
                    }else{
                        dd.alert(result.error);
                    }
                });
                
                return false;
            });
        },
        
        initSetTop: function() {
            $('[role="setTop"]').click(function() {
                var noticeMsg,
                    $this = $(this),
                    isSet = $this.attr("set"),
                    $li = $this.closest('[role="topic"]'),
                    tid = $li.find('[name="tid"]').val(),
                    sid = $li.find('[name="sid"]').val();
                    
                if(isSet == 1) {
                    noticeMsg = '是否置顶？';
                } else {
                    noticeMsg = '是否取消置顶？';
                }

                dd.confirm(noticeMsg, function() {
                    ajax.post("/ajax/topic/setTop", 
                        {
                            tid: tid,
                            sid: sid,
                            isTop: (isSet == 1)
                        }, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },
        
        initSetHighlight: function() {
            $('[role="setHighlight"]').click(function() {
                var noticeMsg,
                    $this = $(this),
                    isSet = $this.attr("set"),
                    $li = $this.closest('[role="topic"]'),
                    tid = $li.find('[name="tid"]').val(),
                    sid = $li.find('[name="sid"]').val();
                
                if(isSet == 1) {
                    noticeMsg = '是否加精？';
                } else {
                    noticeMsg = '是否取消加精？';
                }

                dd.confirm(noticeMsg, function() {
                    ajax.post("/ajax/topic/setHighlight", 
                        {
                            tid: tid,
                            sid: sid,
                            isHighlight: (isSet == 1)
                        }, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },
        
        initDel: function() {
            $('[role="del"]').click(function() {
                var $this = $(this),
                    $li = $this.closest('[role="topic"]'),
                    tid = $li.find('[name="tid"]').val(),
                    sid = $li.find('[name="sid"]').val(),
                    delRtn = $this.attr("delrtn");

                dd.confirm('是否删除话题？', function() {
                    ajax.post("/ajax/topic/del", 
                        {
                            tid: tid,
                            sid: sid,
                        }, function(result) {
                        if(result.success){
                            if(delRtn != undefined && delRtn != '') {
                                location.href = delRtn;
                            } else {
                                window.location.reload(false);
                            }
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },
        
        initCommentSetTop: function() {
            $('[role="cmtSetTop"]').click(function() {
                var noticeMsg,
                    $this = $(this),
                    isSet = $this.attr("set"),
                    $li = $(this).closest('.item'),
                    oid = $li.find('[name="form.objId"]').val(),
                    cid = $li.find('[name="form.parentId"]').val();
                
                if(isSet == 1) {
                    noticeMsg = '是否置顶？';
                } else {
                    noticeMsg = '是否取消置顶？';
                }

                dd.confirm(noticeMsg, function() {
                    ajax.post("/ajax/comment/setTop", 
                        {
                            cid: cid,
                            oid: oid,
                            isTop: (isSet == 1)
                        }, function(result) {
                        if(result.success){
                            window.location.reload(false);
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        },
        
        initCommentDel: function() {
            $('[role="cmtDel"]').click(function() {
                var $this = $(this),
                    $li = $(this).closest('.item'),
                    oid = $li.find('[name="form.objId"]').val(),
                    cid = $li.find('[name="form.parentId"]').val();;

                dd.confirm('是否删除回复？', function() {
                    ajax.post("/ajax/comment/del", 
                        {
                            cid: cid,
                            oid: oid,
                        }, function(result) {
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
         * 显示列表操作项
         */
        showListOpts: function() {
            $('.list .item').hover(function() {
                $(this).addClass('hover');
            },function() {
                $(this).removeClass('hover');
            });
        },

        /**
         * 显示回复列表
         */
        subReply: function() {
            $('[role="subReplyToggle"]').click(function() {
                var $this = $(this),
                    $subReply = $this.closest('.item').find('[role="subReply"]');
                    
                $this.parent().toggleClass('active');
                $subReply.toggle();
            });
        },

        /**
         * 点击内容中的回复
         */
        reReply: function() {
            $('[role="replyBtn"]').click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    $name = $li.find('.name'),
                    $wrap = $this.closest('[role="subReply"]'),
                    $textarea = $wrap.find('textarea');

                var name = $name.text();

                $textarea.val('回复 ' + name);

                var len = $textarea.val().length;
                $textarea.selectRange(len, len);
            });
        },
        
        /**
         * 删除点评
         */
        delReply: function() {
            $('[role="replyDelBtn"]').click(function() {
                var $this = $(this),
                    $div = $(this).closest('.reply'),
                    oid = $div.find('[name="form.objId"]').val(),
                    cid = $this.data("id");

                dd.confirm('是否删除回复？', function() {
                    ajax.post("/ajax/comment/del", 
                        {
                            cid: cid,
                            oid: oid,
                        }, function(result) {
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
         * 楼层详细说明
         */
        floorExplain: function() {
            $('#floorExplain').click(function() {
                var $this = $(this);

                var d = dialog({
                    align: 'right',
                    skin: 'remove-body-padding',
                    content: document.getElementById('floorExplainTmpl').innerHTML,
                    quickClose: true  // 点击空白处关闭
                });

                d.show(document.getElementById('floorExplain'));
            });
        }
    };
    
    function checkStepFloor(floorStr) {
        if(_.isEmpty(floorStr)) {
            return false;
        }
        var floors = floorStr.split(',');
        for(var i=0; i<floors.length; i++) {
            if(/^\d*$/.test(floors[i])) {
                continue;
            } else if(/^\*\d*$/.test(floors[i])) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    }

    Bar.init();
    
});