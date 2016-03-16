/**
 * @description: 消息列表页面交互
 * @author: zhongna
 * @date: 2014-09-05
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../common/module/selectRange');  // 设置光标
    require('../../thirdParty/underscore');
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');
    
    var Msg = {
        
        init: function() {
            this.showMsgReply();
            this.sendMsg();
        },
        
        /**
         * 回复按钮
         */
        showMsgReply: function(){
            $(".msg-list .reply").click(function() {
                var $this = $(this),
                    $li = $this.closest('li'),
                    $name = $li.find('.name').text(),
                    $textarea = $li.find('.textarea');
                $li.toggleClass("show-reply");
                $textarea.attr('placeholder', '回复 ' + $name+': ');
                $this.text($li.hasClass("show-reply") ? '收起' : '回复');
            });
        },
        
        /**
         * 消息发送按钮 
         */
        sendMsg: function() {
            $('[role="replyMsg"]').click(function(){
                var $this = $(this),
                    $li = $this.closest('li'),
                    $form = $li.find('form'),
                    $hidden = $li.find(':hidden'),
                    userId = $hidden.val(),
                    content = $li.find('.textarea').val();
                
                if(_.isEmpty(content)) {
                    dd.alert('请输入回复内容');
                    return false;
                }
                
                ajax.post($form.attr('action'), $form.serialize(), function(result) {
                    if(result.success){
                        setTimeout("window.location.reload(false);", 1000);
                    }else{
                        dd.alert(result.error);
                    }
                })
                
            });
        }
    };
    
    Msg.init();
});