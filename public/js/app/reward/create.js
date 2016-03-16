/**
 * @description: 添加红包
 * @author: Coming
 * @date: 2015-09-08
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

    var Reward = {
        init: function() {
            try {
                this.initRewardForm();
            } catch(e) {}
            this.initChosen();
            this.create($('[role="create"]'));
            this.delete($('[role="delete"]'));
            this.distribute($('[role="distribute"]'));
            this.addItem($('[role="addItem"]'));
        },
        /**
         * 初始化文本框插件
         */
        initRewardForm: function() {
            $("#title").val('');
            $("#excerpt").val('');
            $("#origin").val('');

            var length=$("#rewardTable tr").length;
            if(length<2){
                $("#rewardTh").html('请添加红包');
                $("#rewardTh").css("color","red");
            }else{
                $("#rewardTh").css("color","black");
                $("#rewardTh").html('红包列表');
            }
        },
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
            $("#itemType").change(function () {
                var $label=$("#itemLabel");
                var $itemVal=$("#itemVal");
                $itemVal.val('');
                if($(this).val()!=0){
                    $("#values").show();
                    $("#itemType").next().next().addClass("hide");
                    $("#itemType").next().next().text('');
                    if($(this).val()==1){
                        $label.html("礼包ID");
                        $itemVal.attr("placeholder","请输入仓库ID");
                    }else if($(this).val()==2){
                        $label.html("&nbsp;游&nbsp;米&nbsp;");
                        $itemVal.attr("placeholder","请输入游米数");
                    }else{
                        $label.html("&nbsp;月&nbsp;卡&nbsp;");
                        $itemVal.attr("placeholder","请输入月卡数");
                    }
                }else{
                    $("#values").hide();
                }
            });
        },
        /**
         * 创建红包
         */
        create: function(obj) {
            obj.click(function () {
                var $this = $("#rewardForm"),
                    $bizType = $this.find('[name="bizType"]'),
                    $name = $this.find('[name="name"]'),
                    $bizId = $this.find('[name="bizId"]'),
                    $itemType = $this.find('[name="itemType"]');

                if($bizType.val()==0) {
                    $bizType.next().next().removeClass("hide");
                    $bizType.next().next().text('请选择红包类型！');
                    return false;
                } else {
                    $bizType.next().next().addClass("hide");
                }

                if(_.isEmpty($name.val())) {
                    $name.next().removeClass("hide");
                    $name.next().text('名字不能为空！');
                    return false;
                } else {
                    $name.next().addClass("hide");
                }

                if(_.isEmpty($bizId.val())) {
                    $bizId.next().removeClass("hide");
                    $bizId.next().text('群ID不能为空！');
                    return false;
                } else {
                    if(isNaN($bizId.val()) || $bizId.val()<1){
                        $bizId.next().removeClass("hide");
                        $bizId.next().text('群ID必须为正整数！');
                        return false;
                    }
                    $bizId.next().addClass("hide");
                }
                if($itemType.val()==0) {
                    $itemType.next().next().removeClass("hide");
                    $itemType.next().next().text('请选择奖励类型！');
                    return false;
                } else {
                    $itemType.next().next().addClass("hide");
                }

                var table=$("#rewardForm");
                var trGift=$("#rewardForm .gift");
                var trYyCoin=$("#rewardForm .yyCoin");
                var trMonthCard=$("#rewardForm .monthCard");
                var count=0;
                var typeValue;
                var itemVal;
                var item={};
                var items = new Array();
                trGift.each(function () {
                    var itemVal=$(this).find(".itemVal").val();
                    var count=$(this).find(".count").val();
                    var item={"itemVal":itemVal,"itemType":1};
                    for(var v=0;v<count;v++){
                        items.push(item);
                    }
                });

                trYyCoin.each(function () {
                    var typeValue=2;
                    var itemVal=$(this).find(".itemVal").val();
                    var count=$(this).find(".count").val();
                    var item={"itemVal":itemVal,"itemType":2};
                    for(var v=0;v<count;v++){
                        items.push(item);
                    }
                });

                trMonthCard.each(function () {
                    var typeValue=3;
                    var itemVal=$(this).find(".itemVal").val();
                    var count=$(this).find(".count").val();
                    var item={"itemVal":count,"itemType":3};
                    items.push(item);
                });

                if(items.length==0) {
                    $("#rewardTh").html("红包内容不能为空，请添加红包。");
                    return false;
                } else {
                    //$itemType.next().next().addClass("hide");
                }
                var params={
                    "req.name":$name.val(),
                    "req.bizId":$bizId.val(),
                    "req.bizType":$bizType.val(),
                    "jsonString":JSON.stringify(items)
                }
                var $form=$("#rewardForm");
                ajax.post($form.attr('action'),params, function(result){
                    if(result.success){
                        dd.alert('添加成功！', function(){
                            window.location="/reward/list";
                        });
                    }else{
                        dd.alert(result.error);
                    }
                });
            });
        },
        /**
         * 添加红包内容
         */
        addItem: function(obj) {
            obj.click(function () {
                var itemType=$("#itemType").val();
                var itemVal=$("#itemVal").val();

                var tr='<tr class="group-item"></tr>';
                var $tr=$(tr);
                var typeName='';
                var $typeValue='';
                var typeValue='';
                var $itemCount='';
                var itemCount='';
                var removeOtp='<td class=""><span class="opt removeItem" role="removeItem"><a href="javascript:;" >X</a></span></td>';
                var $table=$("#rewardTable");
                if(itemType==1){
                    if(_.isEmpty(itemVal)){
                        $("#addItem").next().html("请输入仓库ID");
                        return false;
                    }else{
                        if(isNaN(itemVal) || itemVal<1){
                            $("#addItem").next().html("仓库ID只能为正整数");
                            return false;
                        }
                        $("#addItem").next().html("");
                        $tr.addClass("gift");
                        typeName='<td class="typeValue" data-id="1">礼包</td>';
                        $typeValue='<td>仓库ID</td>';
                        typeValue='<td><input type="text" class="itemVal" style="width: 150px;" value="'+itemVal+'"></td>';
                        $itemCount='<td>数量</td>';
                        itemCount='<td><input type="number" class="count" min="1" style="width: 30px;" value="1"></td>';
                        $tr.css("backgroundColor",'azure');

                    }
                }else if(itemType==2){
                    if(_.isEmpty(itemVal)){
                        $("#addItem").next().html("请输入游米数");
                        return false;
                    }else{
                        $("#addItem").next().html("");
                        $tr.addClass("yyCoin");
                        typeName='<td class="typeValue" data-id="2">游米</td>';
                        $typeValue='<td>游米值</td>';
                        typeValue='<td><input type="text" class="itemVal" style="width: 150px;" value="'+itemVal+'"></td>';
                        $itemCount='<td>数量</td>';
                        itemCount='<td><input type="number" class="count" min="1" style="width: 30px;" value="1"></td>';
                        $tr.css("backgroundColor",'moccasin');
                    }
                }else{
                    if(_.isEmpty(itemVal)){
                        $("#addItem").next().html("请输入月卡数");
                        return false;
                    }else{
                        $("#addItem").next().html("");
                        $tr.addClass("monthCard");
                        typeName='<td class="typeValue" data-id="3">月卡</td>';
                        $typeValue='<td></td>';
                        typeValue='<td></td>';
                        $itemCount='<td>数量</td>';
                        itemCount='<td><input type="number" class="count" min="1" style="width: 30px;" value="'+itemVal+'"></td>';
                        $tr.css("backgroundColor",'lightpink');
                    }
                }
                $tr.append(typeName);
                $tr.append($typeValue);
                $tr.append(typeValue);
                $tr.append($itemCount);
                $tr.append(itemCount);
                $tr.append(removeOtp);
                $table.append($tr);
                $("#itemVal").val('');
                var length=$("#rewardTable tr").length;
                if(length<2){
                    $("#rewardTh").html('请添加红包');
                    $("#rewardTh").css("color","red");
                }else{
                    $("#rewardTh").css("color","black");
                    $("#rewardTh").html('红包列表');
                }
            });
        },
        /*
        * 发放红包
        * */
        distribute: function (obj) {
            obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    rewardId = $wrap.find('.rewardId').val(),
                    bizId= $wrap.find('.bizId').html().trim();

                $.ajax({
                    type:'POST',
                    async:false,
                    data:{'groupId':bizId},
                    url:'/ajax/reward/getGroupInfo',
                    dataType:'json',
                    success:function(result){
                        if(result.success){
                            var groupName=result.data.name;
                            dd.confirm('是否要发放此红包给 ‘<span style="color:red;">'+groupName+'</span>’ 群的群主？', function() {
                                ajax.post('/ajax/reward/distribute',{"rewardId":rewardId}, function(result){
                                    if(result.success){
                                        dd.alert("发放成功！");
                                        window.location.reload(false);
                                    }else{
                                        dd.alert(result.error);
                                    }
                                });
                            });
                        }
                    },error: function (result) {
                        dd.alert("找不到群信息!");
                    }
                });
                return;
            });
        },
        /*
         * 删除红包
         * */
        delete: function (obj) {
            obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    rewardId = $wrap.find('.rewardId').val();

                dd.confirm('<span style="color:red;">确定删除此红包？!</span>', function() {
                    ajax.post('/ajax/reward/delete',{"rewardId":rewardId}, function(result){
                        if(result.success){
                            dd.alert('删除成功！', function(){
                                //window.location="/reward/list";
                                window.location.reload(false);
                            });
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            });
        }
    };
    Reward.init();
});


$(function () {
    $("body").on("click",".removeItem", function () {
        var $this = $(this),
            $tr = $this.closest('tr'),
            length=$("#rewardTable tr").length;

        $tr.remove();
        if(length<=2){
            $("#rewardTh").html('请添加红包');
            $("#rewardTh").css("color","red");
        }else{
            $("#rewardTh").css("color","black");
            $("#rewardTh").html('红包列表');
        }
    });
});
