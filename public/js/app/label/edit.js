/**
 * @description: 帖子管理页面交互
 * @author: Coming
 * @date: 2015-05-21
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/chosen');  // 下拉选择框插件
    require('../common/module/selectRange');  // 设置光标
    try {
        require('../common/module/umeditor_custom');  // 自定义UMeditor控件
    } catch(e) {}
    require('../../thirdParty/underscore');
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');
    var Label = {
        init: function() {
            try {
            this.initChosen();
                this.initLabelForm();
            } catch(e) {} 
        },
        
         /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        },
        /**
         * 初始化文本框插件
         */
        initLabelForm: function() {
            //新建标签
            $('#btnSubmit').click(function(){
                var $this = $("#labelForm"),
                    $labelName = $this.find('[name="labelName"]'),
                    $priority = $this.find('[name="priority"]');

                if(_.isEmpty($labelName.val())) {
                    $labelName.next().html('标签名不能为空！');
                    return false;
                } else {
                    if($labelName.val().trim().length>5){
                        $labelName.next().html('标签名不能不能超过5个字符！');
                        return false;
                    }else{
                        $labelName.next().html('&nbsp;');
                    }
                }

                if(_.isEmpty($priority.val())) {
                    $priority.next().html('权重不能为空！');
                    return false;
                } else {
                    if(isNaN($priority.val()) || $priority.val()<1){
                        $priority.next().html('权重必须为正整数！');
                        return false;
                    }else{
                        $priority.next().html('&nbsp;');
                    }
                }

                var $form=$("#labelForm");
                ajax.post($form.attr('action'), $form.serialize(), function(result){
                    if(result.success){
                        dd.alert('保存成功！', function(){
                           
                        });
                    }else{
                        dd.alert('保存失败!');
                    }
                });
                return false;
            }); 
        }
    };
    Label.init();
});