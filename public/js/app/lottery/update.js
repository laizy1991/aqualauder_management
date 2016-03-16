/**
 * @description: 奖池管理页面交互
 * @author: Coming
 * @date: 2015-12-30
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

    var Lottery = {
        init: function() {
            try {
                this.initLotteryForm();
            } catch(e) {}
            this.initChosen();
            this.initDatepicker();
        },
        /**
         * 初始化文本框插件
         */
        initLotteryForm: function() {
            var editor = UM.getEditor('editor', {
                toolbar:[
                    'redo undo | image fullscreen | cleardoc selectall source'
                ]
            });
            var logos = $("#imgUrl").val();
            var logoUrls = logos.split(",");
            for(var i in logoUrls){
                var $ele = "<p><img class='wh-img' src='"+logoUrls[i]+"' _src='"+logoUrls[i]+"'></p>";
                editor.execCommand( 'inserthtml', $ele,true);
            }

            //更新奖品
            $('#btnSubmit').click(function(){
                var $this = $("#lotteryUpdateForm"),
                    $gameId=$this.find('[name="gameId"]'),
                    $type=$this.find('[name="type"]'),
                    $name = $this.find('[name="name"]'),
                    $val = $this.find('[name="val"]'),
                    $desc = $this.find('[name="desc"]'),
                    $logo = $this.find('[name="logo"]'),
                    $beginTime = $this.find('[name="beginTime"]'),
                    $endTime = $this.find('[name="endTime"]');

                if(_.isEmpty($gameId.val()) || $gameId.val()==0) {
                    $("#gameIdTips").removeClass("hide");
                    $("#gameIdTips").text('请选择游戏！');
                    return false;
                } else {
                    $("#gameIdTips").addClass("hide");
                }

                if(_.isEmpty($type.val()) || $type.val()==0) {
                    $("#typeTips").removeClass("hide");
                    $("#typeTips").text('请选择奖品类型！');
                    return false;
                } else {
                    $("#typeTips").addClass("hide");
                }

                if(_.isEmpty($name.val())) {
                    $name.next().removeClass("hide");
                    $name.next().text('奖品名称不能为空！');
                    return false;
                } else {
                    $name.next().addClass("hide");
                }

                if(_.isEmpty($desc.val())) {
                    $desc.next().removeClass("hide");
                    $desc.next().text('奖品描述不能为空！');
                    return false;
                } else {
                    $desc.next().addClass("hide");
                }

                if(_.isEmpty($val.val())) {
                    $val.next().removeClass("hide");
                    $val.next().text('奖品数量不能为空！');
                    return false;
                } else {
                    $val.next().addClass("hide");
                }

                if(_.isEmpty($beginTime.val())) {
                    $("#beginTimeTips").removeClass("hide");
                    $("#beginTimeTips").text('请设置奖品有效开始时间');
                    return false;
                } else {
                    $("#beginTimeTips").addClass("hide");
                }

                if(_.isEmpty($endTime.val())) {
                    $("#endTimeTips").removeClass("hide");
                    $("#endTimeTips").text('请设置奖品有效结束时间');
                    return false;
                } else {
                    $("#endTimeTips").addClass("hide");
                }

                var $imgs = $(".wh-img");
                if($imgs.length==0){
                    $("#editorTips").removeClass("hide");
                    $("#editorTips").text("奖品图片不能为空！");
                    return false;
                }else{
                    $("#editorTips").addClass("hide");
                }
                var logoStr = "";
                $imgs.each(function () {
                    logoStr+=$(this).attr("src")+",";
                });
                logoStr = logoStr.substr(0,logoStr.length-1);
                $logo.val(logoStr);
                ajax.post($this.attr('action'), $this.serialize(), function(result){
                    if(result.success){
                        dd.alert('更新成功！', function(){
                            window.location="/lottery/list";
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
         * 初始化日历插件
         */
        initDatepicker: function() {
            $('#beginTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd HH:mm:ss',
                    readOnly:true,
                    maxDate:'#F{$dp.$D(\'endTime\')}'
                });
            });

            $('#endTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd HH:mm:ss',
                    readOnly:true,
                    minDate:'#F{$dp.$D(\'beginTime\')}'
                });
            });
        }
    };
    Lottery.init();
});
