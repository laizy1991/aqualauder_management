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

    var Posts = {
        init: function() {
            try {
                this.initPostsForm();
            } catch(e) {}
            this.initChosen();
            this.previewPosts($('[role="previewPosts"]'));
            this.editPosts($('[role="editPosts"]'));
            this.list($('[role="list"]'));
            this.check($('[role="check"]'));
            this.checkUser($('[role="checkUser"]'));
           
        },
        /**
         * 初始化文本框插件
         */
        initPostsForm: function() {
            //$("#title").val('');
           // $("#excerpt").val('');
            //$("#origin").val('');
            var maxCount = 5000; 

            //帖子预览
            $('#btnPreview').click(function(){
                content = postsEditor.getContent(),
                contentLen = postsEditor.getContentLength(true);

                if(_.isEmpty(content)) {
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

                var title=$("#title").val();
                var id=$("#author_id").val();
                var params={
                    "pid":id,
                    "title":title,
                    "imgUrl":$("#imgUrl").val(),
                    "excerpt":$("#excerpt").val(),
                    "origin":$("#origin").val(),
                    "content":content
                }

                $.ajax({
                    type:'POST',
                    data:params,
                    url:'/ajax/posts/preview'
                    ,error: function() {
                        dd.alert('网络异常');
                    },
                    dataType:'json',
                    success:function(result){
                        if(result.success){
                            previewHtml(result.data.htmlContent);
                        }
                    }
                });

            });

			//保存 并 发布
			$("#btnSaveAndPublish").click(function(){
				var $this = $("#postsForm"),
                    $title = $this.find('[name="title"]'),
                    $labelIds = $this.find('[name="labelIds"]'),
                    $excerpt = $this.find('[name="excerpt"]'),
                    $imgUrl = $this.find('[name="imgUrl"]'),
                    $origin=$this.find('[name="origin"]'),
                    content = postsEditor.getContent(),
                    contentLen = postsEditor.getContentLength(true),
                    $pid = $this.find('[name="pid"]'),
                    $seoKeywords = $this.find('[name="seoKeywords"]'),
                    $seoDescription = $this.find('[name="seoDescription"]');
                $("#publish").val("1");
                if(_.isEmpty($pid.val())) {
                    $pid.next().removeClass("hide");
                    $pid.next().css("color","red");
                    $pid.next().text('作者ID不能为空！');
                    return false;
                } else {
                    $pid.next().addClass("hide");
                }
                
                if(_.isEmpty($title.val())) {
                    $title.next().removeClass("hide");
                    $title.next().text('标题不能为空！');
                    return false;
                } else {
                    $title.next().addClass("hide");
                }

                if(_.isEmpty($excerpt.val())) {
                    $excerpt.next().removeClass("hide");
                    $excerpt.next().text('摘要不能为空！');
                    return false;
                } else {
                    $excerpt.next().addClass("hide");
                }
                
                var $gameId = $("#gameId option:selected");
                 
                if(_.isEmpty($gameId.val()) || $gameId.val()=='0') {
                    $("#game_error").removeClass("hide");
                    $("#game_error").text('请选择游戏！');
                    return false;
                } else {
                    $("#game_error").addClass("hide");
                }
                
 				if(_.isEmpty($seoKeywords.val())) {
                    $seoKeywords.next().removeClass("hide");
                    $seoKeywords.next().text('SEO搜索关键字不能为空！');
                    return false;
                } else {
                    $seoKeywords.next().addClass("hide");
                }
                
                if(_.isEmpty($seoDescription.val())) {
                    $seoDescription.next().removeClass("hide");
                    $seoDescription.next().text('SEO搜索描述不能为空！');
                    return false;
                } else {
                    $seoDescription.next().addClass("hide");
                }
                if(_.isEmpty($imgUrl.val())) {
                    $("#img-error").removeClass("hide");
                    $("#img-error").text('请选择封面！');
                    return false;
                } else {
                    $("#img-error").addClass("hide");
                }

                if(_.isEmpty(content)) {
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
			 
                var $form=$("#postsForm");
                ajax.post($form.attr('action'), $form.serialize(), function(result){
                    if(result.success){
                        dd.alert('保存&发布成功！', function(){
                            //postsEditor.setContent("");
                            //$title.val('');
                            //$excerpt.val('');
                            //$imgUrl.val('');
                            //$labelIds.val('');
                            //$origin.val('');
                            //$("#picPreview").attr("src","/public/images/default_photo.png");
                            window.location="/posts/list";
                        });
                    }else{
                        dd.alert(result.error);
                    }
                });
                return false;
			});
            //发帖
            $('#btnSubmit').click(function(){
                var $this = $("#postsForm"),
                    $title = $this.find('[name="title"]'),
                    $labelIds = $this.find('[name="labelIds"]'),
                    $excerpt = $this.find('[name="excerpt"]'),
                    $imgUrl = $this.find('[name="imgUrl"]'),
                    $origin=$this.find('[name="origin"]'),
                    content = postsEditor.getContent(),
                    contentLen = postsEditor.getContentLength(true),
                    $pid = $this.find('[name="pid"]'),
                     $seoKeywords = $this.find('[name="seoKeywords"]'),
                    $seoDescription = $this.find('[name="seoDescription"]');
                $("#publish").val("-1");
                if(_.isEmpty($pid.val())) {
                    $pid.next().removeClass("hide");
                    $pid.next().css("color","red");
                    $pid.next().text('作者ID不能为空！');
                    return false;
                } else {
                    $pid.next().addClass("hide");
                }
                
                if(_.isEmpty($title.val())) {
                    $title.next().removeClass("hide");
                    $title.next().text('标题不能为空！');
                    return false;
                } else {
                    $title.next().addClass("hide");
                }

                if(_.isEmpty($excerpt.val())) {
                    $excerpt.next().removeClass("hide");
                    $excerpt.next().text('摘要不能为空！');
                    return false;
                } else {
                    $excerpt.next().addClass("hide");
                }
                
                var $gameId = $("#gameId option:selected");
                 
                if(_.isEmpty($gameId.val()) || $gameId.val()=='0') {
                    $("#game_error").removeClass("hide");
                    $("#game_error").text('请选择游戏！');
                    return false;
                } else {
                    $("#game_error").addClass("hide");
                }
                
 				if(_.isEmpty($seoKeywords.val())) {
                    $seoKeywords.next().removeClass("hide");
                    $seoKeywords.next().text('SEO搜索关键字不能为空！');
                    return false;
                } else {
                    $seoKeywords.next().addClass("hide");
                }
                
                if(_.isEmpty($seoDescription.val())) {
                    $seoDescription.next().removeClass("hide");
                    $seoDescription.next().text('SEO搜索描述不能为空！');
                    return false;
                } else {
                    $seoDescription.next().addClass("hide");
                }
                if(_.isEmpty($imgUrl.val())) {
                    $("#img-error").removeClass("hide");
                    $("#img-error").text('请选择封面！');
                    return false;
                } else {
                    $("#img-error").addClass("hide");
                }

                if(_.isEmpty(content)) {
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
			 
                var $form=$("#postsForm");
                ajax.post($form.attr('action'), $form.serialize(), function(result){
                    if(result.success){
                        dd.alert('保存成功！', function(){
                            //postsEditor.setContent("");
                            //$title.val('');
                            //$excerpt.val('');
                            //$imgUrl.val('');
                            //$labelIds.val('');
                            //$origin.val('');
                            //$("#picPreview").attr("src","/public/images/default_photo.png");
                            window.location="/posts/list";
                        });
                    }else{
                        dd.alert(result.error);
                    }
                });
                return false;
            });

            //清空正在编辑的帖子
            $('#btnClear').click(function(){
                contentLen = postsEditor.getContentLength(true);
                if(contentLen==0){
                    return;
                }
                dd.confirm('是否清空正在编辑的帖子？', function() {
                    postsEditor.setContent("");
                });
            });
            
            //稿件采纳预处理
            var adopt=$("#adopt").val();
             
            if( adopt == "1"){
            	var statusId=$("#statusId").val();
            	var uid=$("#author_id").val();
            	var params={"uid":uid,"statusId":statusId};
            	$.ajax({
                    type:'POST',
                    data:params,
                    url:'/ajax/Posts/findAdoptById'
                    ,error: function() {
                        dd.alert('网络异常');
                    },
                    dataType:'json',
                    success:function(result){
                    	console.log(result);
                        if(result.success){
                            postsEditor.setContent(result.data.text);
                            $("#author_id").trigger("blur"); 
                            for(var v in result.data.photoUrls){
                                var src=result.data.photoUrls[v];
                                var img="<img class='wh-img' src='"+src+"!big' _src='"+src+"'>";
                                postsEditor.execCommand('insertHtml', img, true);
                            } 
                        }
                    }
                });
            }  
            
            $("#public_id").change(function(){ 
            	if( $(this).val() == '-1'){
            		$("#author_id").val('');
            	}else{
            		$("#author_id").val($(this).val());
            	}
        		$("#author_id").next().html("&nbsp;"); 
            });
            
             $("#author_id").blur(function(){
            	if( $("#author_id").val() == ''){
            		return ;
            	}  
        		$("#checkUserLoading").show();
        		$("#author_id").next().text(""); 
        		var id=$("#author_id").val();
                var type=2;
                $.ajax({
                    type:'POST',
                    //async:false,
                    data:{'id':id,'type':type},
                    url:'/ajax/User/checkUser',
                    dataType:'json',
                    success:function(result){
                        $(".userTips").show();
                        $("#checkUserLoading").hide();
                        if(result.success){
                            var nickname=result.data.nickName;
                            $("#author_id").next().show();
                            $("#author_id").next().css("color","green");
                            $("#author_id").next().text("昵称："+nickname);  
                         }else{
                            $("#author_id").next().show();
                            $("#author_id").next().css("color","red");
                            $("#author_id").next().text("用户不存在,请重新输入."); 
                            $("#author_id").val('');
                        }
                    }
                 });
        		
   	 		});
   	 		
        },
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        },

        /**
         * 预览帖子
         */
        previewPosts: function(obj){
            obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    postsId = $wrap.find('.postsId').html().trim();
                $.ajax({
                    type:'POST',
                    async:false,
                    data:{'id':postsId},
                    url:'/ajax/Posts/findById',
                    dataType:'json',
                    success:function(result){
                    	//console.log(result);
                        if(result.success){
                            title=result.data.posts.title;
                            content=result.data.posts.content;
                            pid=result.data.posts.pid;
                            imgUrl=result.data.posts.imgUrl;
                            excerpt=result.data.posts.excerpt;
                            origin=result.data.posts.origin;
                            var params={
                                "pid":pid,
                                "title":title,
                                "imgUrl":imgUrl,
                                "excerpt":excerpt,
                                "origin":origin,
                                "content":content
                            }
                            $.ajax({
                                type:'POST',
                                data:params,
                                url:'/ajax/posts/preview'
                                ,error: function() {
                                    dd.alert('网络异常');
                                },
                                dataType:'json',
                                success:function(result){
                                    if(result.success){
                                        previewHtml(result.data.htmlContent);
                                    }
                                }
                            });
                        }
                    }
                });
            });
        },

        /**
         * 编辑帖子
         */
        editPosts: function(obj){
            obj.click(function () {
                var $this = $(this),
                    $wrap = $this.closest('tr'),
                    postsId = $wrap.find('.postsId').html().trim();
                window.location="/Posts/edit?id="+postsId;
            });
        },

        /*
        * 查找帖子
        * */
        list: function (obj) {
            obj.click(function () {
                var $this = $("#postsSearchForm"),
                    title = $this.find('[name="title"]').val().trim();
                window.location="/posts/list?title="+title;
            });
        },
        
        /*
         * 检查用户是否存在
         */
        checkUser: function (obj) {
            obj.click(function () {
                var id=$("#author_id").val();
                var type=2;
                $.ajax({
                    type:'POST',
                    //async:false,
                    data:{'id':id,'type':type},
                    url:'/ajax/Strategy/checkUser',
                    dataType:'json',
                    success:function(result){
                        $(".userTips").show();
                        if(result.success){
                            var nickname=result.data.nickName;
                            $(".userTips").css("color","green");
                            $(".userTips").html("用户可用，昵称："+nickname);
                            $(".yyCoin").show();
                            $("#uidValid").val('1');
                        }else{
                            $("#uidValid").val('-1');
                            $(".userTips").html("用户不存在！");
                            $(".userTips").css("color","red");
                            $(".yyCoin").hide();
                        }
                    }
                });
            });
        },

        /*
        * 本地化帖子
        */
        check: function (obj) {
            obj.click(function () {
                var total=0;
                var count=0;
                $.ajax({
                    type:'POST',
                    async:false,
                    data:{'flag':1},
                    url:'/ajax/Posts/checkOrCreate',
                    dataType:'json',
                    success:function(result){
                        if(result.success){
                            total=result.data.total;
                            count=result.data.count;
                        }
                    }
                });
                if(count==0){
                    dd.alert("没有未本地化的帖子");
                    return false;
                }
                dd.confirm('帖子总数：'+total+'，未本地化帖子数：<span style="color:red;">'+count+'</span>。是否本地化帖子？', function(){
                    $.ajax({
                        type:'POST',
                        async:false,
                        data:{'flag':2},
                        url:'/ajax/Posts/checkOrCreate',
                        dataType:'json',
                        success:function(result){
                            if(result.success){
                                total=result.data.total;
                                count=result.data.count;
                                dd.alert('成功本地化帖子'+count+'个！');
                            }
                        }
                    });
                });
            });
        },

        /**
         * 修改封面图
         */
        fileUpload: function() {
            var sid=$('#sid').val();
            var uid=10000;
            var scalableImg=1;
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/image/upload',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
                post_params:{sid:sid,uid:uid,type:scalableImg},

                file_types: "*.jpg;*.jpeg;*.gif;*.png;",
                file_types_description: '图片',
                file_size_limit: '102400',

                // handlers
                file_queue_error_handler: fileQueueError,  // 文件加入上传队列失败时触发
                file_dialog_complete_handler: fileDialogComplete,  // 选择文件对话框关闭时触发
                upload_success_handler: uploadSuccess,  // 文件上传成功后触发
                upload_error_handler: uploadError,  //文件上传出错时触发

                button_placeholder_id: 'upload',
                button_text: '<span class="button-text">修改封面</span>',
                button_text_style: '.button-text{color: #333333; font-family: "微软雅黑"; font-size:16px;}',
                button_text_left_padding: 21,
                button_text_top_padding: 5,
                button_width: 110,
                button_height: 38,
                button_cursor: SWFUpload.CURSOR.HAND,
                button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,  // 单文件上传
                debug: false,
                custom_settings: {}
            });

            // 打开文件对话框时的回调
            function fileQueueError() {
            }

            // 选择文件对话框关闭时的回调
            function fileDialogComplete() {
                this.startUpload();
            }

            /**
             * 文件上传成功后的回调
             * @param file 上传的文件
             * @param serverData 服务器在执行完接收文件方法后返回的数据
             * @param response{Boolean}, 表示是否服务器返回数据
             */
            function uploadSuccess(file, serverData, response) {
                var res = JSON.parse(serverData);
                if(res.data.state != undefined && res.data.state == 'SUCCESS') {
                    $('#picPreview').attr('src',res.data.imgUrl+'!big');
                    $('#imgUrl').val(res.data.imgUrl+'!big');
                    //$('#topic').find('.error-msg').text('');
                }else{
                    alert("er");
                }
            }

            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        }

    };
    Posts.init();
});
 
/*
*  预览帖子
* */ 
function previewHtml(htmlContent){
    previewWin = open("", "newWindow", "width=360px, height=640px, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
    previewWin.document.open();
    previewWin.document.write(htmlContent);
    previewWin.document.close();
}