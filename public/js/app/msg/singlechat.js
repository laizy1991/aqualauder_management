/**
 * @description: 页面交互
 * @author: Coming
 * @date: 2015-05-14
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

    var SingleChat = {
        init: function() {
            this.viewLgPic($('[role="viewLgPic"]'));//查看大图
            try {
                this.initMessagePostForm();
            } catch(e) {}
            $("#photoUrls").val("");
        },

        initMessagePostForm: function() {
            var maxCount = 400;
            var messageEditor = UM.getEditor('messageEditor', {
                toolbar:[
                    //'fontfamily fontsize bold italic underline forecolor backcolor link unlink | justifyleft justifycenter justifyright justifyjustify |',
                    //'emotion image fullscreen ' + ((type == 2) ? '| invitation sharespace topic' : ' | topic'),
                    //'emotion image fullscreen ' ,//+ (' | topic'),
                    'emotion2'
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
           
        },

        /**
         * 查看大图
         */
        viewLgPic: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    hrc=$(this).attr("hrc");

                var picDialog = dialog({
                    id: 'picDialog',
                    title: '查看大图',
                    content: document.getElementById('viewPicDialogTmpl').innerHTML,
                    cancelValue: '关闭',
                    cancel: function() {

                    },
                    onshow: function() {
                        var pic=this.__popup.find('.statusPic');
                        pic.attr("src",hrc);
                        $("#viewPicDialog").css("width",$(".statusPic").css("width")+20);
                        $("#viewPicDialog").css("height",$(".statusPic").css("height")+20);
                    }
                }).showModal();
            });
        }

    };
    SingleChat.init();   
}); 