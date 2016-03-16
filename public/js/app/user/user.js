/**
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    require('../../thirdParty/chosen');  // 下拉选择框插件
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    var template = require('../common/module/template_native');

    var User = {
        init: function() {
            //$.get("/User/list");
            this.initChosen();
            this.createUser($('[role="create"]'));
            this.editUser($('[role="edit"]'));
            this.recommend($('[role="recommend"]'));
            this.deductScore($('[role="deduct"]'));
            this.addYoumi($('[role="addYoumi"]'));
            this.reduceYoumi($('[role="reduceYoumi"]'));
            try {
                this.initCreateForm();
            } catch(e) {}
        },
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        },

        /**
         * 添加普通用户
         */
        createUser: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('.folded-panel'),
                    $hiddenInputs = $wrap.find('input:hidden');

                var createDialog = dialog({
                    id: 'createDialog',
                    title: '添加用户',
                    content: document.getElementById('createDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '保存',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form'),
                                    $text = dia.__popup.find('.in-t'),
                                    $msg = $text.siblings('.msg');

                                $msg.hide();
                                if ($.trim($text.val()) == '') {
                                    $msg.show();
                                    return false;
                                }
                                var nickname=$("#nickname").val();
                                var result=$.ajax({
                                    type:'POST',
                                    async:false,
                                    data:{'nickname':nickname},
                                    url:'/ajax/User/checkByNickname',
                                    dataType:'json',
                                    success:function(result){
                                        if(result.error){
                                            dd.alert('创建失败，用户“'+nickname+'”已存在！');
                                        }
                                    }
                                });
                                if(result.responseJSON.error){
                                    return;
                                }

                                var $check = $(".role-list").find(':input:checked');
                                if ($check.length) {
                                    var roleIds="";
                                    for(var i=0;i<$check.length;i++){
                                        roleIds+=$check[i].value+',';
                                    }
                                    $(".role-list").find('[role="roleIds"]').val(roleIds);
                                    //this.__popup.find('[role="roleIds"]').val(roleIds);
                                }

                                ajax.post($form.attr('action'), $form.serialize(), function(result){
                                    if(result.success){
                                        dia.close();
                                        dd.alert('创建用户成功！', function(){
                                            window.location.reload(false);
                                       });
                                    }else{
                                        dd.alert(result.error);
                                    }
                                });
                                return false;
                            },
                            autofocus: true
                        }
                    ],
                    cancelValue: '取消',
                    cancel: function() {

                    },
                    onshow: function() {
                        //$("#nickname").val('init').val(' ');
                        var $li=$(".role-list");
                        ajax.get('/ajax/Role/list', function(result){
                            for(var v in result.data){
                                var role=result.data[v];
                                if(v!=0 && v%4==0){
                                    $li.append("<br>");
                                }
                                $li.append("<label  style='display:inline-block;width: 110px;' for='role_"+role.roleId+"'>" +
                                "<input type='checkbox'" +"id='role_"+role.roleId+"'"+
                                "value='"+role.roleId+"'>&nbsp;<span class='name'>"+role.cnName+
                                "&nbsp;&nbsp;&nbsp;&nbsp;</span></label>");
                            }
                        })
                    }
                }).showModal();
            });
        },

        /**
         * 编辑普通用户
         */
        editUser: function(obj) {
            obj.click(function() {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $userId = $wrap.find('.userId'),
                    userId = $userId.val(),
                    nickname ='',
                    password='',
                    deleted='';

                    $.ajax({
                        type:'POST',
                        async:false,
                        data:{'userId':userId},
                        url:'/ajax/User/findById',
                        dataType:'json',
                        success:function(result){
                            if(result.success){
                                nickname=result.data.nickname;
                                password=result.data.password;
                                deleted=result.data.deleted;
                            }
                        }
                    });


                var editDialog = dialog({
                    id: 'editDialog',
                    title: '编辑用户信息',
                    content: document.getElementById('editDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form'),
                                    $nickname = dia.__popup.find('#nickname');
                                    $password = dia.__popup.find('#password');
                                if (_.isEmpty($.trim($nickname.val()))) {
                                    $nickname.next().css("display","inline");
                                    $nickname.next().text('用户名称为必填项');
                                } else if(_.isEmpty($.trim($password.val()))){
                                    $password.next().css("display","inline");
                                    $password.next().text('密码为必填项');
                                }else {
                                    var $check = $(".role-list").find(':input:checked');
                                    if ($check.length) {
                                        var roleIds="";
                                        for(var i=0;i<$check.length;i++){
                                            roleIds+=$check[i].value+',';
                                        }
                                        $(".role-list").find('[role="roleIds"]').val(roleIds);
                                    }

                                    ajax.post($form.attr('action'), $form.serialize(), function(result) {
                                        if(result.success){
                                            editDialog.close().remove();
                                            dd.alert('修改成功！', function(){
                                                window.location.reload(false);
                                            });
                                        }else{
                                            dd.alert(result.error);
                                        }
                                    });
                                } 
                                return false;
                            },
                            autofocus: true
                        },
                        {
                            value: '取消'
                        }
                    ],
                    onshow: function() {
                        $("#userId").val(userId);
                        $("#nickname").val(nickname);
                        $("#password").val(password);
                        if(deleted==0){
                            $("#able").attr("checked","checked");
                        }else{
                            $("#unable").attr("checked","checked");
                        }
                        roleIds  = new Array();
                        $.ajax({
                            type:'POST',
                            async:false,
                            data:{'userId':userId},
                            url:'/ajax/UserRole/findByUser',
                            dataType:'json',
                            success:function(result){
                                if(result.success){
                                    for(var v in result.data){
                                        roleIds.push(result.data[v].roleId);
                                    }
                                }
                            }
                        });

                        var $li=$(".role-list");
                        ajax.get('/ajax/Role/list', function(result){
                            for(var v in result.data){
                                var role=result.data[v];
                                var checkbox="";
                                if(roleIds.indexOf(role.roleId)>-1){
                                    checkbox="checked='checked'";
                                }
                                if(v!=0 && v%4==0){
                                    $li.append("<br/>");
                                }
                                $li.append("<label style='display:inline-block;width: 110px;' for='role_"+role.roleId+"'>" +
                                "<input type='checkbox'" +"id='role_"+role.roleId+"'"+checkbox+
                                "value='"+role.roleId+"'>&nbsp;<span class='name'>"+role.cnName+
                                "&nbsp;&nbsp;&nbsp;&nbsp;</span></label>");
                            }
                        });
                    }

                }).showModal();
            });
        },

        /**
         * 推荐游易用户
         */
        recommend: function (obj) {
            obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $recommend=$wrap.find('.recommend'),
                    $recommended=$wrap.find('.recommended'),
                    uid=$wrap.find('.uid').val();
                    ajax.post('/ajax/User/recommend', {"uid":uid}, function(result){
                    if(result.success){
                        dd.alert('推荐成功！', function(){
                            //window.location.reload(false);
                            $recommend.css("display","none");
                            $recommended.css("display","block");
                        });
                    }else{
                        dd.alert(result.error);
                    }
                });
            });
        },
        
        /**
         * 用户降分
         */
        deductScore: function (obj) {
        	obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $uid = $wrap.find('.uid');
                    
                var editDialog = dialog({
                    id: 'deductScore',
                    title: '用户降分',
                    content: document.getElementById('deductScoreDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form'),
                                    $deduct = $form.find("#deduct");
                                        
                                    if (_.isEmpty($.trim($deduct.val()))) {
                                        $deduct.next().css("display","inline");
                                        $deduct.next().text('分数为必填项');
                                        return false;
                                    } else{
                                        if(isNaN($deduct.val()) || $deduct.val()<1){
                                            $deduct.next().css("display","inline");
                                            $deduct.next().text('分数必须大于等于1');
                                            return false;
                                        }else{
                                            $deduct.next().css("display","none");
                                        }
                                    }
                                    var params={"uid":$uid.val(),"score":$deduct.val()};
                                    ajax.post($form.attr('action'), params, function(result) {
                                        if(result.success){
                                            editDialog.close().remove();
                                            dd.alert('降分成功！', function(){
                                                window.location.reload();
                                            });
                                        }else{
                                            dd.alert(result.error);
                                        }
                                    });
                                return false;
                            },
                            autofocus: true
                        },
                        {
                            value: '取消'
                        }
                    ],
                    onshow: function() {
                       
                    }

                }).showModal();
        	});
        },
        
        
        /**
         * 加游米
         */
        addYoumi: function (obj) {
        	obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $uid = $wrap.find('.uid');
                    
                var editDialog = dialog({
                    id: 'addYoumiDialog',
                    title: '加游米',
                    content: document.getElementById('addYoumiDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form'),
                                    $youmi = $form.find("#youmi");
                                        
                                    if (_.isEmpty($.trim($youmi.val()))) {
                                        $youmi.next().css("display","inline");
                                        $youmi.next().text('游米数量为必填项');
                                        return false;
                                    } else{
                                        if(isNaN($youmi.val()) || $youmi.val()<1){
                                            $youmi.next().css("display","inline");
                                            $youmi.next().text('游米数量必须大于等于1');
                                            return false;
                                        }else{
                                            $youmi.next().css("display","none");
                                        }
                                    }
                                    ajax.post($form.attr('action'), $form.serialize()+"&uid="+$uid.val(), function(result) {
                                        if(result.success){
                                            editDialog.close().remove();
                                            dd.alert('添加游米成功！', function(){
                                                window.location.reload();
                                            });
                                        }else{
                                            dd.alert(result.error);
                                        }
                                    });
                                return false;
                            },
                            autofocus: true
                        },
                        {
                            value: '取消'
                        }
                    ],
                    onshow: function() {
                    }

                }).showModal();
        	});
        },
        
        /**
         * 减游米
         */
        reduceYoumi: function (obj) {
        	obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    $uid = $wrap.find('.uid');
                    
                var editDialog = dialog({
                    id: 'reduceYoumiDialog',
                    title: '减游米',
                    content: document.getElementById('reduceYoumiDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var dia = this,
                                    $form = this.__popup.find('form'),
                                    $youmi = $form.find("#youmi");
                                        
                                    if (_.isEmpty($.trim($youmi.val()))) {
                                        $youmi.next().css("display","inline");
                                        $youmi.next().text('游米数量为必填项');
                                        return false;
                                    } else{
                                        if(isNaN($youmi.val()) || $youmi.val()<1){
                                            $youmi.next().css("display","inline");
                                            $youmi.next().text('游米数量必须大于等于1');
                                            return false;
                                        }else{
                                            $youmi.next().css("display","none");
                                        }
                                    }
                                    ajax.post($form.attr('action'), $form.serialize()+"&uid="+$uid.val(), function(result) {
                                        if(result.success){
                                            editDialog.close().remove();
                                            dd.alert('扣除游米成功！', function(){
                                                window.location.reload();
                                            });
                                        }else{
                                            dd.alert(result.error);
                                        }
                                    });
                                return false;
                            },
                            autofocus: true
                        },
                        {
                            value: '取消'
                        }
                    ],
                    onshow: function() {
                    }

                }).showModal();
        	});
        },
        
        initCreateForm: function () {
        	$('#submitBtn').click(function(){
                var $this = $("#userCreateForm"),
                    $mobile = $this.find('[name="mobile"]'),
                    $nickname = $this.find('[name="nickname"]'),
                    $sex = $this.find('[name="sex"]');
                	$userType = $this.find('[name="userType"]');
                
                if(_.isEmpty($mobile.val())) {
                    $mobile.next().removeClass("hide");
                    $mobile.next().text('手机不能为空！');
                    return false;
                } else {
                    $mobile.next().addClass("hide");
                }
                
                var patten = new RegExp(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
        		if (!patten.test($mobile.val())) {
        			$mobile.next().removeClass("hide");
                    $mobile.next().text('手机格式不对！');
                    return false;
        		} else {
                    $mobile.next().addClass("hide");
                }
                
                if(_.isEmpty($nickname.val())) {
                    $nickname.next().removeClass("hide");
                    $nickname.next().text('昵称不能为空！');
                    return false;
                } else {
                    $nickname.next().addClass("hide");
                }
                
                if(_.isEmpty($sex.val()) || $sex.val() == 0) {
                    $sex.next().removeClass("hide");
                    $sex.next().text('性别不能为空！');
                    return false;
                } else {
                    $sex.next().addClass("hide");
                }
                
                if(_.isEmpty($userType.val()) || $userType.val() == 0) {
                    $userType.next().removeClass("hide");
                    $userType.next().text('用户类型不能为空！');
                    return false;
                } else {
                    $userType.next().addClass("hide");
                }
                
                var $form=$("#userCreateForm");
                ajax.post($form.attr('action'), $form.serialize(), function(result){
                    if(result.success){
                        dd.alert('创建成功！账号：' + result.id, function(){
                            window.location="/user/yyUserList";
                        });
                    }else{
                        dd.alert(result.error);
                    }
                });
                return false;
        	});
        }
        
    }

    User.init();
});

/**
 * 通过姓名检查用户
 */
function checkUserByNickname(nickname){
    $.ajax({
        type:'POST',
        async:false,
        data:{'nickname':nickname},
        url:'/ajax/User/checkByNickname',
        dataType:'json',
        success:function(result){
            if(result.error){
                $("#nickname").next().html('用户名已存在！');
                $("#nickname").next().css('display','inline');
            }else{
                $("#nickname").next().html('必填项！');
                $("#nickname").next().css('display','none');
            }
        }
    });
}