// 帖子相关JS
$(function () {
    var home="http://www.youyi123.cn",
        downloadUrl = "http://otherfiles.b0.upaiyun.com/app/youyi.apk";

    if(!platform.isWarthog()){ //是否在外部浏览器打开？
        if(!platform.isMobile()){ //在电脑打开
            addCssByLink("pc.css");
            $("body").before("<div class='qr-code'>" +
                "<img src='http://youyi123.cn/public/images/index/code.png'>" +
                "<div class='qr-intro'>扫一扫下载 游易</div></div>");
            $(".wh-label").attr("href","javascript:;");
            var screenWidth=window.innerWidth;
            var bodyWidth=700;
            var right=screenWidth-bodyWidth;
            right=right/2-200;
            $(".qr-code").css("right",right);$("body").append("<p class='line'/>");
            $(window).scroll(function(){
                $(".qr-code").css("top",0);
            });
            $(".iframe-video").attr("width",510);
            $(".iframe-video").attr("height",498);
        }else{
            addCssByLink("mobile.css");
            if($(".iframe-video").length>0){
                var width=parseInt($(".iframe-video").css("width"));
                var height=width*10/16+70;
                $(".iframe-video").height(height);
            }
            if(platform.isWeixin() && (downloadUrl == "http://otherfiles.b0.upaiyun.com/app/youyi.apk")){
                downloadUrl="http://a.app.qq.com/o/simple.jsp?pkgname=cn.warthog.playercommunity";
            }
            if(!platform.isIOS()){ //在IOS上不显示下载
                //downloadUrl='#';
                $("body").before("<div class='download_panel'>" +
                    "<img id='logo' src='../../../mng/public/images/logo.png'/>" +
                    "<div id='intro-box'>" +
                    "<div id='yy'>游易</div>" +
                    "<div id='yy-intro'>上游易，一起玩游戏</div>" +
                    "</div>" +
                    "<span id='download'><a href='"+downloadUrl+"'>下载</a></span>" +
                    "</div>");
            }else{
                $("body").css("marginTop",0);
            }

        }
        $("a[href*='wh://']").attr("href","javascript:;");
        $("#paInfo").attr("onclick","");
        $("#paInfo").attr("href",home);
    }else{
        addCssByLink("default.css");
        if($(".wh-img")){
            var urls = "";
            $(".wh-img").each(function () {
                urls+=$(this).attr("_src")+'`';
            });
            if(urls.lastIndexOf('`')>2){
                urls=urls.substring(0,urls.length-1);
				urls=encodeURI(urls);
            }
            var pos=0;
            $(".wh-img").each(function () {
                $(this).attr("onclick","alert('wh://page/gallery?urls="+urls+"&pos="+pos+"')");
                pos++;
            });
        }
        if($(".iframe-video").length>0){
            var width=parseInt($(".iframe-video").css("width"));
            var height=width*10/16+70;
            $(".iframe-video").height(height);
        }
    }
})


/*
*  动态导入css
* */
function addCssByLink(url){
    var doc = document,
        link = doc.createElement("link"),
        domain = window.location.host,
        heads = doc.getElementsByTagName("head");

    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
	//link.setAttribute("href", "../../../mng/public/css/" + url);//test
    link.setAttribute("href", "http://" + domain + "/mng/public/css/" + url);

    if(heads.length){
        heads[0].appendChild(link);
    }else{
        doc.documentElement.appendChild(link);
    }
}


/*
 * 检测平台
 * */
var platform = {
    isAndroid: function() {
        return navigator.userAgent.match(/Android/i) ? true : false;
    },
    isBlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;
    },
    isIOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    isWindows: function() {
        return navigator.userAgent.match(/IEMobile/i) ? true : false;
    },
    isWeixin: function () {
        return navigator.userAgent.match(/MicroMessenger/i) ? true : false;
    },
    isWarthog: function () {
        return navigator.userAgent.match(/warthog/i) ? true : false;
    },
    isWarthogYY: function () {
        return navigator.userAgent.match(/cn.warthog.playercommunity/i) ? true : false;
    },
    isWarthogSDK: function () {
        return navigator.userAgent.match(/cn.warthog.sdk/i) ? true : false;
    },
    isMobile: function () {
        return (platform.isAndroid() || platform.isBlackBerry() || platform.isIOS() || platform.isWeixin());
    },
    any: function() {
        return (platform.isAndroid() || platform.isBlackBerry() || platform.isIOS() || platform.isWindows());
    }
};



