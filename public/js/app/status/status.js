/**
 * @description: 动态管理页面交互
 * @author: Coming
 * @date: 2015-05-14
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../common/module/selectRange');  // 设置光标
    require('../../thirdParty/chosen');  // 下拉选择框插件
    try {
        require('../common/module/umeditor_custom');  // 自定义UMeditor控件
    } catch(e) {}
    require('../../thirdParty/underscore');
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');

    var Status = {
        init: function() {
            this.initChosen();
            this.viewLgPic($('[role="viewLgPic"]'));//查看大图
            try {
                this.initStatusPostForm();
            } catch(e) {}
            $("#photoUrls").val("");
            $("#postsId").val("-1");
        },
        
        initStatusPostForm: function() {
            var maxCount = 1000;
            var statusEditor = UM.getEditor('topicEditor', {
                toolbar:['emotion2 image posts'],
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
            $('#btnSubmit').click(function(){
                var $this = $("#statusPostForm"),
                    $userId = $this.find('[name="userId"]'),
                    content = statusEditor.getContent(),
                    contentLen = statusEditor.getContentLength(true);


                if(_.isEmpty($userId.val())) {
                    $userId.next().text('游易号为必填项');
                    return false;
                } else {
                    $userId.next().text('');
                }
                var photoUrls=$("#photoUrls").val().trim();
                var postsId=$("#postsId").val();
                content=content.replace("&nbsp;","");
                if(_.isEmpty(content) && photoUrls.length==0 && postsId==-1) {
                    $('.editor-wrap').find('.error-msg').text('随便说点什么吧');
                    return false;
                } else {
                    $('.editor-wrap').find('.error-msg').text('');
                }
                if(contentLen > maxCount) {
                    $('.editor-wrap').find('.error-msg').text('内容字数过长');
                    return false;
                } else {
                    $('.editor-wrap').find('.error-msg').text('');
                }
                var $form=$("#statusPostForm");
                ajax.post($form.attr('action'), $form.serialize(), function(result){
                    if(result.success){
                        dd.alert('发表动态成功！', function(){
                            statusEditor.setContent("");
                            $("#postsId").val('-1');
                            $(".uploadPreview").each(function () {
                                $(this).remove();
                            })
                            $(".label-wrap").empty();
                            $(".img-wrap").hide();
                            $("#picCount").html('0');
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

    Status.init();
    
});

$(function(){
    $("#btnFind").click(function(){   
    	if($("#yyid").val().trim().length>0){
        var id=$("#yyid").val();
            if(isNaN(id)){
                type=1;
            }else{
                type=2;
            }
		var param = {'id':id,'type':type};
		$.ajax({ 
        type : "POST", 
        url  : "/ajax/UserInfo/findUserInfoById",
        cache : false,
        data : param, 
		dataType:"text", 		 
        success : function(data,status){      
				console.log(data);
	        	var json =  eval( '(' + data + ')' );	
	        	if( !json || !json.success ){ 
					$("#errormsg").html("请输入正确的用户ID或游易号");
					$("#errormsg").show();
	        		return ;
	        	}        	
	        	if( json.data == null || json.data == 'null' ){ 
					$("#errormsg").html("请输入正确的用户ID或游易号");
					$("#errormsg").show();
	        		return ;
	        	}	
				$("#errormsg").hide();			
				$("#userId").val(json.data.userId);	 
				
				$.each($(".tochose"),function(){ 
					if( $(this).val() == json.data.userId){
						$(this).attr( "checked", true);
					}else{
						$(this).attr( "checked", false); 
					}
				}); 		
				
		
		
		var $userId=$("#userId"),
            userId=$("#userId").val(),
            $maxStatusId=$("#maxStatusId"),
            maxStatusId=$("#maxStatusId").val(),
            $size=$("#size"),
            size=$("#size").val()
            yyid = $("#yyid").val()
            ;

        if(userId.trim().length==0){
            $(".errormsg").html("请输入用户ID");
        }else{
            if(size.trim().length>0){
                if(!Number(size) && size!=0){
                    $(".errormsg").html("查找条数必须为整数");
                    return;
                }
            }else{
                size=0;
            }
            if(Number(userId)){
                window.location="/Status/list?userId="+userId+"&size="+size+"&yyid="+yyid;
            }else{
                //$(".error-msg").html("用户ID必须为整数");
                $(".errormsg").html("请输入正确的游易号");
            }
        }
        
        		
	        }
			});       
	    }else{
			$("#errormsg").html("请输入正确的用户游易号");
	        $("#errormsg").show();
		}
    	
    
        
    });
})

$("#userId").blur(function(){
    if($("#userId").val().trim().length>0){
        if(!Number($("#userId").val().trim())){
            //$(this).next().html("用户ID必须为整数");
            $(this).next().html("请输入正确的用户ID");
        }else{
            //$(this).next().html(' ');
            $(this).next().html('&nbsp;');
        }
    }
});