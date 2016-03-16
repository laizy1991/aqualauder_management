/**
 * @description: FAQ页面交互
 * @author: chenxx
 * @date: 2014-09-02
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/underscore');
    
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');
    var maxConentLen = 2500;
    
    var Faq = {
        init: function() {
            var um = UM.getEditor('faqContent', {
                toolbar:[],
                wordCount: maxConentLen
            });
            this.bindFormSumbit();
        },
        
        bindFormSumbit: function() {
            var $form = $('form'),
                $hidden = $form.find(":hidden"),
                self = this;
            $form.submit(function(){
                var $this = $(this),
                    um = UM.getEditor('faqContent'),
                    content = um.getContent(),
                    $errorMsg = $this.find('.error-msg'),
                    contentLen = um.getContentLength(true);
                
                if(_.isEmpty(content)) {
                    $errorMsg.text('内容为必填项');
                    um.focus();
                    return false;
                } else {
                    $errorMsg.text('');
                }
                if(contentLen > maxConentLen) {
                    $errorMsg.text('内容字数过长');
                    um.focus();
                    return false;
                } else {
                    $errorMsg.text('');
                }
                
                dd.confirm('是否发送内容？', function(){
                    var dia = this;
                    ajax.post($this.attr('action'), $this.serialize(), function(result){
                        if(result.success){
                            dia.close();
                            dd.alert('发送成功！', function(){
                                window.location.reload(false);
                            });
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
                return false;
            });
        }
        
    };
    
    Faq.init();
});