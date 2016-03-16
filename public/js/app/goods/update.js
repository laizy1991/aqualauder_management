/**
 * @description: 帖子管理页面交互
 * @author: Coming
 * @date: 2015-05-21
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/chosen');  // 下拉选择框插件
    require('../common/module/selectRange');  // 设置光标
    require('../../thirdParty/underscore');
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');

    var Goods = {
        init: function() {
            try {
                this.initGoodsForm();
            } catch(e) {}
            this.initChosen();
        },
        /**
         * 初始化文本框插件
         */
        initGoodsForm: function() {
            if(_.isEmpty($("#goodsDesc").val())) {
                $("#goodsDesc").val('由我们注册新账号并充值好游戏币或专用币，后续可联系本店低价代充，密保未设置。');
            }

            if(_.isEmpty($("#warmPrompt").val())) {
                $("#warmPrompt").val('首充：首充号是平台为您注册一个账号且完成首次充值；首充与后续充值都可享受高额的优惠，拥有同等充值奖励。\n' +
                '续充：首充号续充是对您在游易平台购买的首充号进行后续充值，由我们帮充值可享受后续低价的优惠，在其它平台购买的首充号不能享受此优惠。');
            }


            //更新商品
            $('#btnSubmit').click(function(){
                var $this = $("#goodsForm"),
                    $title = $this.find('[name="updateGoodsReq.title"]'),
                    $price=$("#price_tmp"),
                    $salePrice=$this.find('[name="updateGoodsReq.salePrice"]'),
                    $discount=$this.find('[name="updateGoodsReq.discount"]'),
                    $discountDesc=$this.find('[name="updateGoodsReq.discountDesc"]'),
                    $continueDiscount=$this.find('[name="updateGoodsReq.continueDiscount"]');

                if(_.isEmpty($title.val())) {
                    $title.next().removeClass("hide");
                    $title.next().text('标题不能为空！');
                    return false;
                } else {
                    $title.next().addClass("hide");
                }

//                if(_.isEmpty($continueDiscount.val())) {
//                    $continueDiscount.next().removeClass('hide');
//                    $continueDiscount.next().text('续充折扣不能为空！');
//                    return false;
//                } else {
//                    if($continueDiscount.val()>10 || $continueDiscount.val()<=0 || isNaN($continueDiscount.val())){
//                        $continueDiscount.next().removeClass('hide');
//                        $continueDiscount.next().text('续充折扣应在1-10之间！');
//                        return false;
//                    }else{
//                        $continueDiscount.next().addClass('hide');
//                    }
//                }

                if(_.isEmpty($price.val())) {
                    $price.next().removeClass("hide");
                    $price.next().text('价格不能为空！');
                    return false;
                } else {
                    if(isNaN($price.val())){
                        $price.next().removeClass("hide");
                        $price.next().text('价格必须为正数！');
                        return false;
                    }else{
                        $price.next().addClass("hide");
                    }
                }

                if(_.isEmpty($discount.val())) {
                    $discount.next().removeClass('hide');
                    $discount.next().text('折扣不能为空！');
                    return false;
                } else {
                    if($discount.val()>10 || $discount.val()<=0 || isNaN($discount.val())){
                        $discount.next().removeClass('hide');
                        $discount.next().text('折扣应该在1-10之间！');
                        return false;
                    }else{
                        var afterPrice=$discount.val()/10*$price.val();
                        $salePrice.val(afterPrice.toFixed(2));
                        $discount.next().addClass('hide');
                    }
                }

                if(_.isEmpty($discountDesc.val())) {
                    $discountDesc.next().removeClass("hide");
                    $discountDesc.next().text('折扣描述不能为空！');
                    return false;
                } else {
                    $discountDesc.next().addClass("hide");
                }
                var $form=$("#goodsForm");
                $("#price").val($price.val()*100);
                ajax.post($form.attr('action'), $form.serialize(), function(result){
                    if(result.success){
                        dd.alert('更新商品成功！', function(){
                            var url = window.location.href;
                            var urlParams= url.substring(url.indexOf("?"),url.length);
                            window.location="/goods/search"+urlParams;
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
            if($("#goodsType").val()==2){
                $("#discount").attr("readonly",true);
            }

            $('.chosen-select').chosen({disable_search_threshold: 10});
            $("#gameId").change(function () {
                var selected=$(this).find('option:selected').attr("data-id");
                $("#channel_wrap_"+selected).show().siblings('.channel-select').hide();
                $("#gift-"+selected).show().siblings('.gift-select').hide();
                $(".chosen-container").css("width","200");
                $(".channelId").get(0).selectedIndex = 0;
                $(".gift-select").get(0).selectedIndex = 0;
            });

            $(".channelId").change(function () {
                $("#channelId").val($(this).val());
                if($(this).val()==0){
                    $(".packName").text('');
                }else{
                    $(".packName").text($(this).find('option:selected').attr("packName"));
                }
            });

        }
    };
    Goods.init();
});

//$("#continueDiscount").blur(function () {
//    if(_.isEmpty($(this).val())) {
//        $(this).next().removeClass('hide');
//        $(this).next().text('续充折扣不能为空！');
//        return false;
//    } else {
//        if($(this).val()>10 || $(this).val()<=0 || isNaN($(this).val())){
//            $(this).next().removeClass('hide');
//            $(this).next().text('续充折扣应在1-10之间的正数！');
//            return false;
//        }else{
//            $(this).next().addClass('hide');
//        }
//    }
//});
//
//$("#discount").change(function () {
//    $("#discountDesc").val('');
//    $(this).trigger("blur");
//});
//
//$("#discount").blur(function () {
//    var $price=$("#price"),
//        $discount=$("#discount"),
//        $discountDesc=$("#discountDesc"),
//        $salePrice=$("#salePrice");
//
//    if(_.isEmpty($price.val())) {
//        $price.next().removeClass("hide");
//        $price.next().text('价格不能为空！');
//        $salePrice.val('');
//        return false;
//    } else {
//        if(isNaN($price.val())){
//            $price.next().removeClass("hide");
//            $price.next().text('价格必须为正数！');
//            $salePrice.val('');
//            return false;
//        }else{
//            $price.next().addClass("hide");
//        }
//    }
//
//    if(_.isEmpty($discount.val())) {
//        $discount.next().removeClass('hide');
//        $discount.next().text('折扣不能为空！');
//        return false;
//    } else {
//        if($discount.val()>10 || $discount.val()<=0 || isNaN($discount.val())){
//            $discount.next().removeClass('hide');
//            $discount.next().text('折扣应为1-10之间的正数！');
//            return false;
//        }else{
//            var afterPrice=$discount.val()/10*$price.val();
//            $salePrice.val(afterPrice.toFixed(2));
//            if(_.isEmpty($discountDesc.val())){
//                $discountDesc.val($discount.val()+'折');
//            }
//            $discount.next().addClass('hide');
//        }
//    }
//});

$("#continueDiscount").blur(function () {
    if(_.isEmpty($(this).val())) {
        $(this).next().removeClass('hide');
        $(this).next().text('续充折扣不能为空！');
        return false;
    } else {
        if($(this).val()>10 || $(this).val()<=0 || isNaN($(this).val())){
            $(this).next().removeClass('hide');
            $(this).next().text('续充折扣应在1-10之间的正数！');
            return false;
        }else{
            $(this).next().addClass('hide');
        }
    }
});

$("#discount").change(function () {
    $("#discountDesc").val('');
    $(this).trigger("blur");
});

$("#price_tmp").blur(function () {
        var $price=$("#price_tmp"),
        $discount=$("#discount");

        if(_.isEmpty($price.val())) {
            $price.next().removeClass("hide");
            $price.next().text('价格不能为空！');
            $salePrice.val('');
            return false;
        } else {
            if(isNaN($price.val())){
                $price.next().text('价格必须为正数！');
                $salePrice.val('');
                return false;
            }else{
                $price.next().removeClass("hide");
                $price.next().text(parseInt($price.val()*100)+' 分');
            }
        }
        if(!_.isEmpty($discount.val())){
            autoComplete();
        }
});


$("#discount").blur(function () {
       var $price=$("#price_tmp");
       if(_.isEmpty($price.val())) {
            $price.trigger("blur");
        }else{
           autoComplete();
        }
});

function autoComplete(){
   var $price=$("#price_tmp"),
           $discount=$("#discount"),
           $discountDesc=$("#discountDesc"),
           $salePrice=$("#salePrice");

       if(_.isEmpty($price.val())) {
           $price.next().removeClass("hide");
           $price.next().text('价格不能为空！');
           $salePrice.val('');
           return false;
       } else {
           if(isNaN($price.val())){
               $price.next().text('价格必须为正数！');
               $salePrice.val('');
               return false;
           }else{
               $price.next().removeClass("hide");
               $price.next().text(parseInt($price.val()*100)+' 分');
           }
       }

       if(_.isEmpty($discount.val())) {
           $discount.next().removeClass('hide');
           $discount.next().text('折扣不能为空！');
           return false;
       } else {
           if($discount.val()>10 || $discount.val()<=0 || isNaN($discount.val())){
               $discount.next().removeClass('hide');
               $discount.next().text('折扣应为1-10之间的正数！');
               return false;
           }else{
               var afterPrice=$discount.val()/10*$price.val();
               $salePrice.val(afterPrice.toFixed(2));
               $salePrice.next().text(parseInt(afterPrice.toFixed(3)*100)+' 分');
               if(_.isEmpty($discountDesc.val())){
                   $discountDesc.val($discount.val()+'折');
               }
               $discount.next().text(($discount.val()/10).toFixed(3));
           }
       }
}