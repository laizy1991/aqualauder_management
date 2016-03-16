define(function(require) {
    
    var topicDialog = require('./topicDialog');
    var postsDialog = require('./postsDialog');
    var labelDialog = require('./labelDialog');
    var editor = null;

    // 礼包
    UM.registerWidget('gift', {
        initContent: function( _editor, $widget ) {
            var me = this,
                $root = me.root();

            if (me.inited) {
                me.preventDefault();
                return;
            }

            me.inited = true;

            editor = _editor;
            this.widget = $widget;

            var html = '<div class="toolbar-share-list">' +
                       '<ul>';

            $.getJSON('/ajax/ka/list', function(res) {
                if(res.success && res.data.length > 0) {
                    $.each(res.data, function(index, item) {
                        html += '<li data-url="kk://page/goto?target=giftDetail&id=' + item.ka_id + '">' + item.name + '</li>';
                    });
                } else {
                    html += '<li data-url="#">暂无礼包</li>';
                }

                html += '</ul>' +
                        '</div>';

                $root.html(html);
            });
        },

        initEvent: function() {
            var me = this;

            //点击插入
            me.root().delegate( 'li', 'click', function( evt ){

                var $li = $(this);
                var html = '<a href="' + $li.data('url') + '">' + $li.html() + '</a>';
                editor.execCommand('insertHtml', html);
            });
        }
    });

    // 邀请群
    UM.registerWidget('invitation', {
        initContent: function( _editor, $widget ) {
            var me = this,
                $root = me.root();

            if (me.inited) {
                me.preventDefault();
                return;
            }

            me.inited = true;

            editor = _editor;
            this.widget = $widget;

            var html = '<div class="toolbar-share-list">' +
                       '<ul>';

            $.getJSON('/ajax/group/list', function(res) {
                if(res.success && res.data.length > 0) {
                    $.each(res.data, function(index, item) {
                        html += '<li data-url="kk://page/goto?target=groupDetail&id=' + item.group_id + '">' + item.group_name + '</li>';
                    });
                } else {
                    html += '<li data-url="#">暂无群</li>';
                }

                html += '</ul>' +
                        '</div>';

                $root.html(html);
            });
        },

        initEvent: function() {
            var me = this;

            //点击插入
            me.root().delegate( 'li', 'click', function( evt ){

                var $li = $(this);
                var html = '<a href="' + $li.data('url') + '">' + $li.html() + '</a>';
                editor.execCommand('insertHtml', html);
            });
        }
    });

    UM.registerUI('gift invitation', function(name) {
        var me = this;

        var $btn = $.eduibutton({
            icon: 'share',
            title: ''
        });

        switch(name) {
            case 'gift':
                $btn.html('礼包');
                break;

            case 'invitation':
                $btn.html('邀请群');

                break;

            default:
                break;
        }

        $.eduipopup().css('zIndex', me.options.zIndex + 1)
            .addClass('edui-popup-share')
            .edui()
            .on('beforeshow',function(){
                var $root = this.root();
                if(!$root.parent().length){
                    me.$container.find('.edui-dialog-container').append($root);
                }
                UM.setWidgetBody(name, $root, me);
                UM.setTopEditor(me);

            }).attachTo($btn, {
                offsetTop: -8,
                offsetLeft: 0,
                caretLeft: 25,
                caretTop: -8
            });

        return $btn;

    });

    // 共享区
    UM.registerUI('sharespace', function(name) {
        var me = this;

        var $btn = $.eduibutton({
            icon: 'share',
            title: '',
            click: function() {
                var html = '<a href="kk://page/goto?target=shareSpace">共享区</a>';
                me.execCommand('insertHtml', html);
            }

        }).html('共享区');

        return $btn;
    });
    
    // 话题按钮
    UM.registerUI('topic', function(name) {
        var me = this;

        var $btn = $.eduibutton({
            icon: 'share',
            title: '',
            click: function() {
                topicDialog.create({
                    multiSelect: false,
                    onAccept: function(sortedList, selectedList) {
                        var obj = selectedList[sortedList[0]],
                            url = 'wh://page/topicStatusListPage?id=' + obj.id + '&name=' + obj.name;
                            console.log(obj);
                        //var html = '<a href="' + url + '" >' + obj.name + '</a>';
                        var html = '<a class="wh-label" style="color:#576b95;font-size: 16px;text-decoration: none;" href="javascript:alert(\''+url+'\');">#' + obj.name + '#</a>';
                        me.execCommand('insertHtml', html);
                    }
                }).showModal();
            }

        }).html('话题列表');

        return $btn;
    });

    // 帖子按钮
    UM.registerUI('posts', function(name) {
        var me = this;

        var $btn = $.eduibutton({
            icon: 'share',
            title: '',
            click: function() {
                var pid=-1,
                    current_page=window.location.toString();
                if(current_page.indexOf('topic\/post')>0 || current_page.indexOf('topic\/edit')>0){
                    pid=0;
                }
                postsDialog.create({
                    multiSelect: false,
                    //limit:-1,
                    postsDataUrl:'/ajax/posts/list?pid='+pid,
                    onAccept: function(sortedList, selectedList) {
                        var obj = selectedList[sortedList[0]],
                            //url = 'kk://page/goto?target=topicDetail&id=' + obj.topic_id + '&extra=' + obj.sponsor_id;
                            url = obj.content_url;
                        if(current_page.indexOf('topic\/post')>0 || current_page.indexOf('topic\/edit')>0){
                            var html = '<a href="' + url + '">' + obj.title + '</a>';
                            me.execCommand('insertHtml', html);
                            return;
                        }
                        if( $("#postsId") ){
                        	$("#postsId").val(obj.posts_id);
                        }
                        if($(".label-wrap")){
                            $(".label-wrap").empty();
                            var label='<span class="label">'+obj.title+'<a href="javascript:void(0);" class="close" onclick="removePosts(this);" title="移除帖子">x</a></span>';
                            $(".label-wrap").append(label);
                        }
                    }
                }).showModal();
                 $('.chosen-select').chosen({disable_search_threshold: 10});
            }

        }).html('帖子');

        return $btn;
    }); 
    
    
    // 标签按钮
    UM.registerUI('label', function(name) {
        var me = this;
        var $btn = $.eduibutton({
            icon: 'share',
            title: '',
            click: function() {
            	var gameId = 0;
            	if ($('#gameId') != undefined) {
            		gameId = $('#gameId').val();
            	}
                labelDialog.create({
                    multiSelect: true,
                    //limit:-1,
                    labelDataUrl:'/ajax/label/list?gameId=' + gameId,
                    onAccept: function(sortedList, selectedList) {
                        var obj = selectedList[sortedList[0]],
                            url = obj.content_url; 
                        
                        //每次编辑先清理旧标签
                        if( $("#labelEditor") ){
                        	$("#labelEditor").remove();
                        }
                        
                        var html = ' <div id="labelEditor"><a style="color:#e05012;font-size: 16px;text-decoration: none;" href="javascript:void();">标签</a>：';
						var labelIds ='';
						var count = 0;
						
						$.each(selectedList,function(){
							count++;
							var wh = 'wh://page/expStatusListPage?id='+this.labelId;
							html += '<a class="wh-label" style="color:#576b95;font-size: 16px;text-decoration: none;" href="javascript:alert(\''+wh+'\');">' + this.labelName + '</a>&nbsp;';
							labelIds += this.labelId+","
						});
						html += '</div>';
						if( count > 0 ){ 
							if( $("#labelIds") ){
                        		$("#labelIds").val($("#labelIds").val()+labelIds);
                        	} 
                        	me.execCommand('insertHtml', html);
                        }
                    }
                }).showModal();
            }

        }).html('标签');

        return $btn;
    }); 
});