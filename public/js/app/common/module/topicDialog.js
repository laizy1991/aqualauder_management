define(function(require, exports, module) {
    
    require('../../../thirdParty/dialog');
    var pagination = require('./pagination');
    var template = require('./template_native');
    
    var TopicDialog = {
        
        id: 'topicDialog',
        title: '选择话题',
        topicDataUrl: '/ajax/topic/list',
        onAccept: null,
        onCancel: null,
        multiSelect: true,
        selectedList: {},
        sortedList: new Array(),
        
        create: function(setting) {
            var self = this;
            $.extend(self, setting);
            return dialog({
                id: self.id,
                title: self.title,
                skin: 'remove-body-padding',
                content: self.getTpl(),
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
                            self.multiSelectOnShow(dialog);
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
                    $input = $this.find('.search-combobox-input');
                pagination.reload({keyword: $input.val()});
                return false;
            });
        },
        
        multiSelectOnShow: function(dialog) {
            var self = this,
                $dialogBd = dialog.__popup.find('.dialog-bd'),
                $selectedNum = dialog.__popup.find('#selectedNum'),
                selectedNum = parseInt(self.sortedList.length);

            $selectedNum.text(selectedNum);

            if (selectedNum >= 8) {
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
                    topicId = $this.val();

                if (isChecked) {
                    selectedNum ++;

                    var obj = {
                        'id': topicId,
                        'name': $parent.find('.name').text(),
                        //'sponsor_id': $parent.find('[name="sponsorId"]').val(),
                        'avatarUrl': $parent.find('[name="avatarUrl"]').val()
                    }

                    self.sortedList.push(topicId);
                    self.selectedList[topicId] = obj;

                    if (selectedNum >= 8) {
                        $dialogBd.find('input:not(:checked)').attr('disabled', 'disabled');
                    }
                } else {
                    selectedNum --;

                    self.sortedList = _.without(self.sortedList, topicId)
                    delete self.selectedList[topicId];

                    if (selectedNum < 8) {
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
                    topicId = $this.val();
                var obj = {
                    'id': topicId,
                    'name': $parent.find('.name').text(),
                    //'sponsor_id': $parent.find('[name="sponsorId"]').val(),
                    'avatarUrl': $parent.find('[name="avatarUrl"]').val()
                }
                
                self.selectedList = {};
                self.sortedList = new Array();
                self.sortedList.push(topicId);
                self.selectedList[topicId] = obj;
            });
        },
        
        getTpl: function() {
            return '<div class="dialog dialog-topic">' +
                        '<div class="dialog-hd">' +
                            '<div class="search-bar">' +
                                '<div class="search-combobox">' +
                                    '<form class="search-combobox-form" action="#">' +
                                        '<input type="text" class="search-combobox-input" name="keyword" value="" placeholder="请输入关键字">' +
                                        '<button type="submit" class="search-combobox-button"><i class="icon icon-search"></i></button>' +
                                    '</form>' +
                                '</div>' +
                            '</div>' +
                            (this.multiSelect ? '<p class="right">已选 <span id="selectedNum" class="stronger-text">0</span> 个，最多能选择8条话题</p>' : '') +
                        '</div>' +
                        '<div class="dialog-bd" role="listWrap" data-param=\'{"url":"' + this.topicDataUrl + '", "tmplId":"topicListTmpl"}\'><div class="ajax-loading">数据加载中...</div></div>' +
                        '<div class="dialog-ft">' +
                            '<p class="msg error-text">请先选择话题！</p>' +
                            '<div class="pagination-wrap" role="pageWrap"></div>' +
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
                                    '<input type="' + (this.multiSelect ? 'checkbox': 'radio') + '" name="chosen_topic" value="<%= list[i].id %>">' +
                                    '<span class="name"><%= list[i].name %></span>' +
                                    //'<input type="hidden" name="sponsorId" value="<%= list[i].sponsor_id %>">' +
                                    '<input type="hidden" name="avatarUrl" value="<%= list[i].avatarUrl %>">' +
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