define(function(require, exports, module) {
    
    require('../../../thirdParty/dialog');
    var pagination = require('./pagination');
    var template = require('./template_native');
    
    var TopicDialog = {
        id: 'topicDialog',
        title: '选择帖子',
        postsDataUrl: '/ajax/posts/list?pid='+$("#pid").val(),
        onAccept: null,
        onCancel: null,
        limit:null,
        multiSelect: true,
        selectedList: {},
        sortedList: new Array(), 
        create: function(setting) {
            var limit=setting.limit;
            var self = this;
            $.extend(self, setting);
            return dialog({
                id: self.id,
                title: self.title,
                skin: 'remove-body-padding',
                content: self.getTpl(limit),
                button: [
                    {
                        value: '确定',
                        callback: function () {
                            if (self.sortedList.length < 1) {
                                this.__popup.find('.msg').show();
                                return false;
                            } else {
                                if (self.onAccept && $.isFunction(self.onAccept)) {
                                    self.onAccept.call(self, self.sortedList, self.selectedList);
                                }
                            }
                        },
                        autofocus: true
                    }
                ],
                cancelValue: '取消',
                cancel: function() {
                    self.sortedList = [];
                    self.selectedList = {};
                    if (self.onCancel && $.isFunction(self.onCancel)) {
                        self.onCancel.call(self);
                    }
                },
                onshow: function() {
                    var dialog = this;
                    var args = dialog.__popup.find('.dialog-bd').data('param');
                    args.element =  dialog.__popup.find('.dialog');
                    args.onInit = function() {
                        if(self.multiSelect) {
                            self.multiSelectOnShow(dialog,limit);
                        } else {
                            self.singleSelectOnShow(dialog);
                        }
                    }
                    pagination.init(args);
                    self.bindSearchTopic(dialog.__popup.find('.search-combobox-form'));
                }
            });
        },
        
        bindSearchTopic: function(form) {
            form.submit(function(){
                var $this = $(this),
                    $input = $this.find('.keyword');
                var type = $("#typeId option:selected").val();
                var publishState = $("#publishState option:selected").val();
                pagination.reload({keyword: $input.val(),type:type,publishState:publishState});
                return false;
            });
        },
        
        multiSelectOnShow: function(dialog,limit) {
            var self = this,
                $dialogBd = dialog.__popup.find('.dialog-bd'),
                $selectedNum = dialog.__popup.find('#selectedNum'),
                selectedNum = parseInt(self.sortedList.length);

            $selectedNum.text(selectedNum);

            if(limit>0 && selectedNum >= limit){
                $dialogBd.find(':checkbox').attr('disabled', 'disabled');
            }
            if (limit>0 && selectedNum >= limit) {
                $dialogBd.find(':checkbox').attr('disabled', 'disabled');
            }


            for (var i = 0; i < self.sortedList.length; i++) {
                var $selectedCk = $dialogBd.find(':checkbox[value="' + self.sortedList[i] + '"]');
                $selectedCk.removeAttr('disabled').prop('checked', true);
            }

            $dialogBd.find(':checkbox').on('click', function() {
                var $this = $(this),
                    isChecked = $this.prop('checked'),
                    $parent = $this.closest('.ck-label'),
                    postsId = $this.val();

                if (isChecked) {
                    selectedNum ++;

                    var obj = {
                        'posts_id': postsId,
                        'title': $parent.find('.title').text(),
                        'content_url': $parent.find('[name="contentUrl"]').val(),
                        'video_cover': $parent.find('[name="videoCover"]').val(),
                        'img_url': $parent.find('[name="imgUrl"]').val()
                    }
                    self.sortedList.push(postsId);
                    self.selectedList[postsId] = obj;

                    //if (contentType==0 && selectedNum >= limit) {
                    //    $dialogBd.find('input:not(:checked)').attr('disabled', 'disabled');
                    //}
                    //if (contentType==9 && selectedNum >= limit) {
                    //    $dialogBd.find('input:not(:checked)').attr('disabled', 'disabled');
                    //}
                    //if (contentType==10 && selectedNum >= limit) {
                    //    $dialogBd.find('input:not(:checked)').attr('disabled', 'disabled');
                    //}

                    if (selectedNum >= limit) {
                        $dialogBd.find('input:not(:checked)').attr('disabled', 'disabled');
                    }

                } else {
                    selectedNum --;

                    self.sortedList = _.without(self.sortedList, postsId)
                    delete self.selectedList[postsId];
                    //if (contentType==9 && selectedNum < 1) {
                    //    $dialogBd.find('input:disabled').removeAttr('disabled');
                    //}
                    //if (contentType==10 && selectedNum < 5) {
                    //    $dialogBd.find('input:disabled').removeAttr('disabled');
                    //}
                    if (selectedNum < limit) {
                        $dialogBd.find('input:disabled').removeAttr('disabled');
                    }
                }

                $selectedNum.text(selectedNum);
            });
        },
        
        singleSelectOnShow: function(dialog) {
            var self = this,
                $dialogBd = dialog.__popup.find('.dialog-bd');
            
            for (var i = 0; i < self.sortedList.length; i++) {
                var $selectedRb = $dialogBd.find(':radio[value="' + self.sortedList[i] + '"]');
                $selectedRb.removeAttr('disabled').prop('checked', true);
            }
            
            $dialogBd.find(':radio').on('click', function() {
                var $this = $(this),
                    $parent = $this.closest('.ck-label'),
                    postsId = $this.val();

                var obj = {
                    'posts_id': postsId,
                    'title': $parent.find('.title').text(),
                    'content_url': $parent.find('[name="contentUrl"]').val(),
                    'video_cover': $parent.find('[name="videoCover"]').val(),
                    'img_url': $parent.find('[name="imgUrl"]').val()
                }
                
                self.selectedList = {};
                self.sortedList = new Array();
                self.sortedList.push(postsId);
                self.selectedList[postsId] = obj;
            });
        },
        
        getTpl: function(limit) {
            return '<div class="dialog dialog-topic">' +
                        '<div class="dialog-hd">' +
                            '<div class="search-bar">' +
                                '<div class="">' +
                                    '<form class="search-combobox-form form-field" action="#">' +
                                    	'类型：<select id="typeId" class="gameId st-type chosen-select" name="type" style="width:100px;">' +
								                    '<option value="0">请选择</option>' +
								                    '<option value="4">攻略</option>' +
								                    '<option value="1">活动</option>' + 
								                    '<option value="2">新闻</option>' +
								                    '<option value="3">公告</option>' +
								                '</select> ' +
								       '&nbsp&nbsp发布状态：<select id="publishState" class="gameId st-type chosen-select" name="type" style="width:100px;">' +
								                    '<option value="0">请选择</option>' +
								                    '<option value="1">已发布</option>' +
								                    '<option value="-1">未发布</option>' +  
								                '</select> ' +
                                        '&nbsp&nbsp标题：<input type="text" class="keyword" name="keyword" value="" placeholder="请输入关键字">' + 
                                        '<button type="submit" style="background-color: #007aff; width: 80px; line-height: 40px; height: 40px; margin-right: 20px;color:#fff;">搜索</button>' +
                                    '</form>' +
                                '</div>' +
                            '</div>' +
                            (this.multiSelect ? '<p class="right">已选 <span id="selectedNum" class="stronger-text">0</span> 个，最多能选择'+limit+'个帖子</p>' : '') +
                        '</div>' +
                        '<div class="dialog-bd" role="listWrap" data-param=\'{"url":"' + this.postsDataUrl + '", "tmplId":"topicListTmpl"}\'><div class="ajax-loading">数据加载中...</div></div>' +
                        '<div class="dialog-ft">' +
                            '<p class="msg error-text">请先选择话题！</p>' +
                            '<div class="pagination-wrap" style="border: none;" role="pageWrap"></div>' +
                        '</div>' +
                    '</div>' + this.resultTpl();
        },
        
        resultTpl: function() {

            return '<script id="topicListTmpl" type="text/html">' +
                        '<ul class="dialog-topic-list">' +
                            '<% var list = data.list %>' +
                            '<% for (var i=0; i < list.length; i++) { %>' +
                            '<li>' +
                                '<label class="ck-label">' +
                                    '<input type="' + (this.multiSelect ? 'checkbox': 'radio') + '" name="chosen_topic" value="<%= list[i].posts_id %>">' +
                                    '<span class="title"><a target="_blank" href="<%= list[i].content_url %>"><%= list[i].title %></a></span>' +
                                    '<input type="hidden" name="contentUrl" value="<%= list[i].content_url %>">' +
                                    '<input type="hidden" name="videoCover" value="<%= list[i].video_cover %>">' +
                                    '<input type="hidden" name="imgUrl" value="<%= list[i].img_url %>">' +
                                '</label>' +
                            '</li>' +
                            '<% } %>' +
                        '</ul>' +
                    '</script>';
        },
        
        deleteSelectedData: function(tid) {
            var self = this;
            self.sortedList.splice($.inArray(tid, self.sortedList), 1);
            delete self.selectedList[parseInt(tid)];
        },
        
        getSelectedList: function() {
            return this.selectedList;
        },
        
        setSelectedList: function(selectedList) {
            this.selectedList = selectedList;
        },
        
        getSortedList: function() {
            return this.sortedList;
        },
        
        setSortedList: function(sortList) {
            this.sortedList = sortList;
        },
        
        moveTopic: function(tid, up) {
            this.sortedList = adjustArray(this.sortedList, tid, up);
        }
        
    };
    
    /**
     * 上下移动数组项
     * @param {Object} arr
     * @param {Object} data
     * @param {Object} up
     */
    function adjustArray(arr, data, up) {
        var index = $.inArray(data, arr);

        if(up && index > 0) {
            var tmpIndex = index - 1;
            var tmp = arr[index];
            arr[index] = arr[tmpIndex];
            arr[tmpIndex] = tmp;
        } else if(!up && index < (arr.length - 1)){
            var tmpIndex = index + 1;
            var tmp = arr[index];
            arr[index] = arr[tmpIndex];
            arr[tmpIndex] = tmp;
        }
        return arr;
    }
    
    module.exports = TopicDialog;
});