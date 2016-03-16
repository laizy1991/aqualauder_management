/**
 * @description: 登录页面交互
 * @author: chenxx
 * @date: 2014-09-02
 */

define(function(require) {
   
    require('../common/common');
    require('../../thirdParty/underscore');
    var cookie = require('../util/cookie');
    
    var Login = {
        init: function() {
            this.bindEvent();
            this.initData();
            this.initTab();
        },
        
        initData: function() {
            var mobile = cookie.getCookie("yyUser");
            if(mobile != undefined && mobile != '') {
                $('#remember').attr("checked", true);
                $('#mobile').val(mobile);
            } else {
                $('#remember').attr("checked", false);
            }
        },
        
        initTab: function() {
            var $navCase = $(".nav-case .nav-case-item")
            $navCase.hover(function(){
                $(this).parent().addClass("current").siblings().removeClass("current");
                var index = $navCase.index(this);  // 获取当前点击的<li>元素 在 全部li元素中的索引。
                $(".con-case li").eq(index).show().siblings().hide();
            })
        },
        
        bindEvent: function() {
            $('form').submit(function(){
                var $mobile = $('#mobile'),
                    $password = $('#password'),
                    $remember = $('#remember'),
                    $errorMsg = $('.error-msg');
                /*if(!(/^1[0-9][0-9]\d{4,8}$/.test($mobile.val()))){ 
                    $errorMsg.text('请输入正确的手机号码');
                    $mobile.focus();
                    return false; 
                }*/
                if(_.isEmpty($password.val())) {
                    $errorMsg.text('请输入密码');
                    $password.focus();
                    return false;
                }
                
                if($remember.get(0).checked) {
                    cookie.setCookie('yyUser', $mobile.val(), 60 * 60 * 60, '/');
                }
            });
        }
    };
    
    Login.init();
});