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
            this.editGoods($('[role="editGoods"]'));
            this.updateState($('[role="updateState"]'));
            if($("#gameId_temp").val()!=0){
                $("#gameId-search").trigger("change");
            }
        },
        /**
         * 初始化文本框插件
         */
        initGoodsForm: function() {
            $("#title").val('');
            $("#price").val('');
            $("#salePrice").val('');
            $("#discount").val('');
            $("#channelId").val('');
            $("#continueDiscount").val('');
            $("#storageId").val('');
            $("#giftName").val('');
            $("#goodsDesc").val('由我们注册新账号并充值好游戏币或专用币，后续可联系本店低价代充，密保未设置。');
            $("#warmPrompt").val('首充：首充号是平台为您注册一个账号且完成首次充值；首充与后续充值都可享受高额的优惠，拥有同等充值奖励。\n' +
            '续充：首充号续充是对您在游易平台购买的首充号进行后续充值，由我们帮充值可享受后续低价的优惠，在其它平台购买的首充号不能享受此优惠。');
            $("#goodsType").get(0).selectedIndex = 0;
            $("#gameId").get(0).selectedIndex = 0;
            $(".gift-select").get(0).selectedIndex = 0;

            //添加商品
            $('#btnSubmit').click(function(){
                var $this = $("#goodsForm"),
                    $title = $this.find('[name="createGoodsReq.title"]'),
                    $goodsType = $this.find('[name="createGoodsReq.goodsType"]'),
                    $gameId = $this.find('[name="createGoodsReq.gameId"]'),
                    $channelId = $this.find('[name="createGoodsReq.channelId"]'),
                    $price=$("#price_tmp"),
                    $salePrice=$this.find('[name="createGoodsReq.salePrice"]'),
                    $discount=$this.find('[name="createGoodsReq.discount"]'),
                    $continueDiscount=$this.find('[name="createGoodsReq.continueDiscount"]'),
                    $discountDesc=$this.find('[name="createGoodsReq.discountDesc"]'),
                    goodsDescContent = $this.find('[name="createGoodsReq.goodsDesc"]'),
                    goodsDescContentLen = $this.find('[name="createGoodsReq.goodsDesc"]').val().trim().length,
                    warmPromptContent = $this.find('[name="createGoodsReq.warmPrompt"]'),
                    warmPromptContentLen = $this.find('[name="createGoodsReq.warmPrompt"]').val().trim().length;

                if(_.isEmpty($title.val())) {
                    $title.next().removeClass("hide");
                    $title.next().text('标题不能为空！');
                    return false;
                } else {
                    $title.next().addClass("hide");
                }
                if($goodsType.val()==0) {
                    $goodsType.next().next().removeClass("hide");
                    $goodsType.next().next().text('请选择商品类型！');
                    return false;
                } else {
                    $goodsType.next().next().addClass("hide");
                }
                if($gameId.val()==0) {
                    $gameId.next().next().removeClass("hide");
                    $gameId.next().next().text('请选择游戏类型！');
                    return false;
                } else {
                    $gameId.next().next().addClass("hide");
                }
                $(".channelId").each(function () {
                    if(!isNaN($(this).val())){
//                        $channelId.val($(this).val());
                    }
                });
                if($channelId.val()==0) {
                    $channelId.next().next().find(".error-msg").removeClass("hide");
                    $channelId.next().next().find(".error-msg").text('请选择渠道！');
                    return false;
                }
//                if(_.isEmpty($continueDiscount.val())) {
//                    $continueDiscount.next().removeClass("hide");
//                    $continueDiscount.next().text('续充折扣不能为空！');
//                    return false;
//                } else {
//                    if($continueDiscount.val()>10 || $continueDiscount.val()<=0 || isNaN($continueDiscount.val())){
//                        $continueDiscount.next().text('续充折扣应在1-10之间！');
//                        $continueDiscount.next().removeClass("hide");
//                        return false;
//                    }else{
//                        $continueDiscount.next().addClass("hide");
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
                        $price.next().removeClass("hide");
                        $price.next().text($price.val()*100);
                    }
                }

                if(_.isEmpty($discount.val())) {
                    $discount.next().removeClass("hide");
                    $discount.next().text('折扣不能为空！');
                    return false;
                } else {
                    if($discount.val()>10 || $discount.val()<=0 || isNaN($discount.val())){
                        $discount.next().removeClass("hide");
                        $discount.next().text('折扣应该在1-10之间！');
                        return false;
                    }else{
                        var afterPrice=$discount.val()/10*$price.val();
                        $salePrice.val(afterPrice.toFixed(2));
                        $discountDesc.val($discount.val()+'折');
                        $discount.next().addClass("hide");
                    }
                }

                var $form=$("#goodsForm");
                $("#price").val($price.val()*100);
                ajax.post($form.attr('action'), $form.serialize(), function(result){
                    if(result.success){
                        dd.alert('添加商品成功！', function(){
                            window.location="/goods/list";
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
            $("#gameId").change(function () {
                var selected=$(this).find('option:selected').attr("data-id");
                $("#channelId").val('');
                $(".packName").text('请选择渠道');

                $("#channel_wrap_"+selected).show().siblings('.channel-select').hide();
                $("#gift-"+selected).show().siblings('.gift-select-wrap').hide();
                $(".chosen-container").css("width","200");
                $(".channelId").get(0).selectedIndex = 0;
                $(".gift-select-wrap").get(0).selectedIndex = 0;
                if(selected!=0){
                    var icon=$(this).find('option:selected').attr("data-icon");
                    $("#icon").val(icon);
                }else{
                    $("#icon").val('');
                }
            });

            $("#goodsType").change(function () {
                if($(this).val()!=2){
                    $("#discount").removeAttr("readonly");
                    $("#discount").val('');
                }else{
                    if($("#continueDiscount").val()>0){
                        $("#discount").val($("#continueDiscount").val());
                        $("#discount").attr("readonly",true);
                    }
                }
            });

            $(".channelId").change(function () {
                $("#channelId").val($(this).val());
                $("select[name='channelId']").val($(this).val());
                if($(this).val()==0){
                    $(".packName").text('');
                    $("#continueDiscount").val('');
                    $("#discount").removeAttr("readonly");
                    $("#discount").val('');
                }else{
                    var rechargeDisc=$(this).find('option:selected').attr("rechargeDisc");
                    $("#continueDiscount").val(rechargeDisc);
                    if($("#goodsType").val()==2){
                        $("#discount").attr("readonly",true);
                        $("#discount").val(rechargeDisc);
                    }else{
                        $("#discount").removeAttr("readonly");
                        $("#discount").val('');
                    }
                    $(".packName").text($(this).find('option:selected').attr("packName"));
                }
            });

            $(".gift-select").change(function () {
                var storageId=$(this).val();
                var giftName=$(this).find('option:selected').attr("giftName");
                if(storageId==0){
                    $("#storageId").val('');
                    $("#giftName").val('');
                }else{
                    $("#storageId").val(storageId);
                    $("#giftName").val(giftName);
                }
            });

            $("#gameId-search").change(function () {
                var selected=$(this).find('option:selected').attr("data-id");
                if(selected==0){
                    $('.channel-select-search').hide();
                    return;
                }
                $("#channel_search_wrap_"+selected).show().siblings('.channel-select-search').hide();
                $(".chosen-container").css("width","200");
                $(".channelId").get(0).selectedIndex = 0;
            });
        },
        /**
         * 编辑
         */
        editGoods: function(obj){
            obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    goodsId = $wrap.find('.goodsId').html().trim(),
                    name = $("#name").val(),
                    gameId = $("#gameId_temp").val(),
                    channelId = $("#channelId_temp").val(),
                    pageNow = $("#pageNow_temp").val(),
                    type = $("#type-search").val();
                window.location="/Goods/update?id="+goodsId+"&name="+name+"&gameId="+gameId+"&channelId="+channelId
                +"&pageNow="+pageNow+"&type="+type;
            });
        },

        /*
         * 上下架商品
         * */
        updateState: function (obj) {
            obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    goodsId=$wrap.find(".goodsId").html(),
                    state=$wrap.find(".state").attr("data-id");

                    if(state==1){
                        dd.confirm('确实要下架此商品？', function(){
                            var params={"goodsId":goodsId,"state":0};
                            ajax.post('/ajax/Goods/updateState', params, function(result){
                                if(result.success){
                                    dd.alert('操作成功！', function(){
                                        $wrap.find(".opt2").children().show();
                                        $wrap.find(".opt1").children().hide();
                                        $wrap.find(".state").attr("data-id",0);
                                        $wrap.find(".state").css("color","red");
                                        $wrap.find(".state").text('未上架');
                                    });
                                }else{
                                    dd.alert(result.error);
                                }
                            });
                        });
                    }else{
                        var params={"goodsId":goodsId,"state":1};
                        ajax.post('/ajax/Goods/updateState', params, function(result){
                            if(result.success){
                                dd.alert('操作成功！', function(){
                                    $wrap.find(".opt1").children().show();
                                    $wrap.find(".opt2").children().hide();
                                    $wrap.find(".state").attr("data-id",1);
                                    $wrap.find(".state").css("color","green");
                                    $wrap.find(".state").text('出售中');
                                });
                            }else{
                                dd.alert(result.error);
                            }
                        });
                    }

            });
        }
    };
    Goods.init();
});

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

$("#price").blur(function () {
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