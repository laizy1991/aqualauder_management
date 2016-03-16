/**
 * @description: 礼包页面交互
 * @author: chenxx
 * @date: 2014-09-02
 */

define(function(require) {
    require('../common/common');  // 公共模块
    require('../../thirdParty/underscore');
    require('../../thirdParty/dialog');
    
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');
    var pagination = require('../common/module/pagination');  // ajax分页插件
    var template = require('../common/module/template_native');
    var maxCount = 500;
    
    var Ka = {
        selectedList: new Array(),
        
        init: function() {
            try {
                this.initPost();
            } catch(e) {}
            this.initList();
            this.initAssign();
            this.toggleKaCodeImport();
        },
        
        initPost: function() {
            var contentEditor = UM.getEditor('contentEditor', {
                toolbar:[
                    'fontfamily fontsize bold italic underline forecolor backcolor link unlink | justifyleft justifycenter justifyright justifyjustify |',
                    'emotion image fullscreen'
                ],
                wordCount: maxCount,
                filterRules: function(){
                   function transP(node){
                       node.tagName = 'p';
                       node.setStyle();
                   }
                   return {
                       //直接删除及其字节点内容
                       '-' : 'script style object iframe embed input select',
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
            
            var instructionEditor = UM.getEditor('instructionEditor', {
                toolbar:[
                    'fontfamily fontsize bold italic underline forecolor backcolor link unlink | justifyleft justifycenter justifyright justifyjustify |',
                    'emotion image fullscreen'
                ],
                wordCount: maxCount,
                filterRules: function(){
                   function transP(node){
                       node.tagName = 'p';
                       node.setStyle();
                   }
                   return {
                       //直接删除及其字节点内容
                       '-' : 'script style object iframe embed input select',
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
            
            $('#startTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd HH:mm',
                    readOnly:true,
                    maxDate:'#F{$dp.$D(\'endTime\')}'
                });
            });

            $('#endTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd HH:mm',
                    readOnly:true,
                    minDate:'#F{$dp.$D(\'startTime\')}'
                });
            });
            this.bindGame();
            this.bindUpload();
            this.bindFormSubmit();
        },
        
        /**
         * 选择关联游戏
         */
        bindGame: function() {
            var self = this;

            $('[role="gameChosen"]').on('click', function() {
                var $this = $(this),
                    url = $this.data('url');
                    
                var gameDialog = dialog({
                    id: 'bindGameDialog',
                    title: '选择关联游戏',
                    skin: 'remove-body-padding',
                    content: document.getElementById('bindGameDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var $radio = this.__popup.find(':radio:checked');

                                if ($radio.length) {
                                    var $hidden = $this.closest(".form-field-game").find(":hidden");
                                    $hidden.val($radio.val());
                                    $hidden.next().text($radio.siblings('.name').text());
                                }
                            },
                            autofocus: true
                        },{value: '取消'}
                    ],
                    onshow: function() {
                        self.searchGames(this.__popup.find('.search-combobox-form'));
                    }
                }).showModal();
                
                ajax.get(url, function(res){
                    gameDialog.__popup.find('.game-wrap').html(template('gameListDialogTmpl', res));
                });

            });
        },
        
        /**
         * 搜索游戏
         */
        searchGames: function(form) {
            form.off().on('submit', function() {
                var url = form.attr('action'),
                    keyword = form.find('.search-combobox-input').val();
                
                ajax.get(url + '?keyword=' + encodeURIComponent(keyword), function(res) {
                    if (res.data.list != undefined && res.data.list.length > 0) {
                        form.closest('.search-bar').siblings('.game-wrap').html(template('gameListDialogTmpl', res));
                    } else {
                        form.closest('.search-bar').siblings('.game-wrap').html('<p style="text-align:center;">抱歉，没有搜索到任何结果！</p>');
                    }
                });
                return false;
            });
        },
        
        bindUpload: function() {
            var sid=$('#sid').val();
            var swfUpload = new SWFUpload({
                upload_url: '/ajax/ka/uploadCode',
                flash_url: '/public/js/thirdParty/swfupload/swfupload.swf',

                file_post_name: 'upfile',  // POST信息中上传文件的name值
                post_params:{sid:sid},

                file_types: "*.xls",
                file_types_description: 'XLS',
                file_size_limit: '102400',

                // handlers
                file_queue_error_handler: function(){},  // 文件加入上传队列失败时触发
                file_dialog_complete_handler: fileDialogComplete,  // 选择文件对话框关闭时触发
                upload_success_handler: uploadSuccess,  // 文件上传成功后触发
                upload_error_handler: uploadError,  //文件上传出错时触发

                button_placeholder_id: 'upload',
                button_text: '<span class="button-text">上传礼包激活码</span>',
                button_text_style: '.button-text{color: #333333; font-family: "微软雅黑"; font-size:16px;padding: 0 0 0 10px;}',
                button_text_left_padding: 12,
                button_text_top_padding: 6,
                button_width: 145,
                button_height: 35,
                button_cursor: SWFUpload.CURSOR.HAND,
                button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,  // 单文件上传

                debug: false,

                custom_settings: {}
            });
            
            // 选择文件对话框关闭时的回调
            function fileDialogComplete() {
                this.startUpload();
            }
            
            function uploadSuccess(file, serverData, response) {
                var result = JSON.parse(serverData);
                if(result.success){
                    var $resTxt = $('#uploadRes'),
                        count = result.data.count;
                    $resTxt.html('<span class="hot">新上传：'+ count + '个</span>');
                    $resTxt.closest('.form-field-gift').find(':hidden').val(count);
                }else{
                    dd.alert(result.error);
                }
            }
            
            function uploadError() {
                dd.alert('上传失败，请重试！');
            }
        },
        
        bindFormSubmit: function() {
            $('#form').submit(function() {
                var $this = $(this),
                    $name = $this.find('.input-gift-title'),
                    contentEditor = UM.getEditor('contentEditor'),
                    instructionEditor = UM.getEditor('instructionEditor'),
                    $gameId = $this.find('[name="form.gameId"]'),
                    $startTime = $this.find('.begin-time'),
                    $endTime = $this.find('.end-time'),
                    $timeErrorMsg = $startTime.closest('.filter-bar').find('.error-msg'),
                    $giftDiv = $('#uploadRes').closest('.form-field-gift');
                    
                if(_.isEmpty($.trim($name.val()))) {
                    $name.next().html('礼包名称为必填项');
                    return false;
                } else {
                    $name.next().html('&nbsp;');
                }
                
                if(!_.isUndefined($gameId.get(0)) && _.isEmpty($gameId.val())) {
                    $this.find('.form-field-game').find('.error-msg').html('关联游戏为必填项');
                    return false;
                } else {
                    $this.find('.form-field-game').find('.error-msg').html('&nbsp;');
                }
                
                if(_.isEmpty($startTime.val()) || _.isEmpty($endTime.val())) {
                    $timeErrorMsg.html('礼包有效期为必填项')
                    return false;
                } else {
                    $timeErrorMsg.html('&nbsp;')
                }
                
                var beginTime = getDate($startTime.val()),
                    endTime = getDate($endTime.val());
                if((endTime.getTime() - beginTime.getTime()) < 0) {
                    $timeErrorMsg.html('开始时间不能大于结束时间')
                    return false;
                } else {
                    $timeErrorMsg.html('&nbsp;')
                }
                
                if(_.isEmpty($.trim(contentEditor.getContentTxt()))) {
                    $('#contentErrorMsg').html('礼包内容为必填项');
                    return false;
                } else {
                    $('#contentErrorMsg').html('&nbsp;');
                }
                
                if(contentEditor.getContentLength(true) > maxCount) {
                    $('#contentErrorMsg').html('礼包内容字数过长');
                    return false;
                } else {
                    $('#contentErrorMsg').html('&nbsp;');
                }
                
                if(_.isEmpty($.trim(instructionEditor.getContentTxt()))) {
                    $('#instrErrorMsg').html('礼包说明为必填项');
                    return false;
                } else {
                    $('#instrErrorMsg').html('&nbsp;');
                }
                
                if(instructionEditor.getContentLength(true) > maxCount) {
                    $('#instrErrorMsg').html('礼包说明字数过长');
                    return false;
                } else {
                    $('#instrErrorMsg').html('&nbsp;');
                }
                
                var importType = $this.find('input[name="importType"]:checked').val();
                if(importType == 0) {
                    if(_.isEmpty($giftDiv.find(':hidden').val())) {
                        $giftDiv.find('.error-msg').html('礼包激活码为必填项');
                        return false;
                    } else {
                        $giftDiv.find('.error-msg').html('&nbsp;');
                    }
                } else if(importType == 1){
                    var kid = $this.find('input[name="form.kaId"]').val();
                    var codes = $.trim($this.find('textarea[name="form.codes"]').val());
                    //礼包ID为空时，表示为添加新礼包，需要进行激活码为空判断
                    if(_.isEmpty(kid) && _.isEmpty(codes)) {
                        $giftDiv.find('.error-msg').html('礼包激活码为必填项');
                        return false;
                    } else {
                        $giftDiv.find('.error-msg').html('&nbsp;');
                    }
                    //不管新增还是修改礼包，只要激活码框内容有输入，都需要进行判断
                    if(!_.isEmpty(codes) && !checkCode(codes)) {
                        dd.alert('礼包激活码必须为英文，数字或下划线 组合');
                        return false;
                    }
                }
            });
            
            function getDate(datestr){
                var temp = datestr.split('-');
                var date = new Date(temp[0], (temp[1] - 1), temp[2]);
                return date;
            }
            
            function checkCode(codes) {
                var arr = codes.split("\r\n");
                if(arr.length == 1) {
                    arr = codes.split("\n");
                }
                
                for(var i=0; i<arr.length; i++) {
                    if(arr[i] == '') {
                        continue;
                    }
                    if(!/^[-_!\$%\w\d]+$/.test(arr[i])) {
                        return false;
                    }
                }
                return true;
            }
        },
        
        /**
         * 显示列表操作项
         */
        initList: function() {
            $('.list .item').hover(function() {
                $(this).addClass('hover');
            }, function() {
                $(this).removeClass('hover');
            });
            this.showGift();
        },
        
        /**
         * 显示礼包详情
         */
        showGift: function() {
            var self = this;

            $('[role="showGift"]').on('click', function() {
                var $this = $(this),
                    url = $this.data('url');
                
                ajax.get(url, function(result) {
                    if(result.success){
                        var myTitle = $this.children(".name").text(); 
                        var showGiftDialog = dialog({
                            id: 'showGiftDialog',
                            title :  myTitle,
                            skin: 'remove-body-padding',
                            content: document.getElementById('showGiftDialogTmpl').innerHTML,
                            onshow: function() {
                                this.content(template('showGiftDialogTmpl', {'ka': result.data}));
                            }
                        }).showModal();
                    }else{
                        dd.alert(result.error);
                    }
                });
            });
        },
        
        initAssign: function() {
            $('#setCondition').click(function() {
                var conditionDialog = dialog({
                    id: 'conditionDialog',
                    title: '设置条件',
                    content: document.getElementById('conditionDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确定',
                            callback: function () {
                                var $form = this.__popup.find('form'),
                                    url = $form.attr('action'),
                                    $radio = $form.find(':checked'),
                                    $kaId = $('#kaId'),
                                    $st = $('#st');
                                    
                                if(_.isUndefined($radio.attr('name'))) {
                                    $form.find('p.error-msg').text('请选择条件');
                                    return false;
                                } else {
                                    $form.find('p.error-msg').text('');
                                }
                                
                                var $value = $radio.next();
                                if(_.isEmpty($value.val())) {
                                    $value.next().text('请输入条件值');
                                    return false;
                                } else {
                                    $value.next().text('');
                                }
                                var intVal = parseInt($value.val());
                                if(intVal != $value.val()) {
                                    $value.next().text('条件值必须为整数');
                                    return false;
                                } else {
                                    $value.next().text('');
                                    $value.val(intVal);
                                }
                                
                                $form.append($kaId.clone());
                                $form.append($st.clone());
                                
                                ajax.post(url, $form.serialize(), function(result) {
                                    if(result.success){
                                        conditionDialog.close().remove();
                                        dd.alert('设置成功！', function(){
                                            window.location.reload(false);
                                        });
                                    }else{
                                        dd.alert(result.error);
                                    }
                                });
                                return false;
                            },
                            autofocus: true
                        },{value: '取消'}
                    ],
                    onshow: function() {
                        this.__popup.find(':radio').change(function(){
                            $(this).closest('.col').find('span.error-msg').text('');
                        });
                    }
                }).showModal();
            });
            
            $('#btnSaveAuto').click(function() {
                var $this = $(this),
                    $autoCount = $this.closest('.con').find('[name="autoTotalCount"]'),
                    $kaId = $('#kaId'),
                    $st = $('#st');
                
                if(_.isEmpty($autoCount.val())) {
                    dd.alert('请输入自动领取个数');
                    return false;
                }
                var autoCount = parseInt($autoCount.val());
                if(autoCount != $autoCount.val()) {
                    dd.alert('自动领取个数必须为整数');
                    return false;
                }
                
                if((autoCount < parseInt($('#autoGotCount').text())) 
                    || (autoCount > parseInt($('#totalCount').text()) - parseInt($('#hasAssigned').text()))) {
                    dd.alert('自动领取个数设置有误');
                    return false;
                }
                
                ajax.post($this.data('url'), {kid:$kaId.val(), count:$autoCount.val(), st:$st.val()}, function(result) {
                    if(result.success){
                        window.location.reload(false);
                    }else{
                        dd.alert(result.error);
                    }
                });
                
                return false;
            });
            this.initMemberSelector();
        },
        
        initMemberSelector: function() {
            var self = this;
            $('[role="sendMember"]').click(function() {
                 var $this = $(this),
                    url = $this.data('url');

                    var sendMemberDialog = dialog({
                        id: 'sendMemberDialog',
                        title: '选择分配成员',
                        skin: 'remove-body-padding',
                        content: document.getElementById('sendMemberDialogTmpl').innerHTML,
                        button: [
                            {
                                value: '保存',
                                callback: function () {
                                    var $kaId = $('#kaId'),
                                    $st = $('#st');
                                    
                                    if (self.selectedList.length < 1) {
                                        this.__popup.find('.msg').show();
                                        return false;
                                    } else {
                                        ajax.post(url, {kid:$kaId.val(), st: $st.val(), mlist: self.selectedList}, function(result){
                                            if(result.success){
                                                window.location.reload(false);
                                            }else{
                                                sendMemberDialog.close();
                                                dd.alert(result.error, function() {
                                                    sendMemberDialog.show();
                                                });
                                            }
                                        });
                                    }
                                    return false;
                                },
                                autofocus: true
                            }
                        ],
                        cancelValue: '取消',
                        cancel: function() {
                            self.selectedList = [];
                        },
                        onshow: function() {
                            var dialog = this,
                                $dialogBd = dialog.__popup.find('[role="listWrap"]');

                            var args = $dialogBd.data('param');
                            args.element = dialog.__popup.find('.dialog');
                            args.onInit = function() {
    
                                for (var i = 0; i < self.selectedList.length; i++) {
                                    var $selectedCk = $dialogBd.find(':checkbox[value="' + self.selectedList[i] + '"]');
                                    $selectedCk.removeAttr('disabled').prop('checked', true);
                                }
    
                                $dialogBd.find(':checkbox').on('click', function() {
                                    var $this = $(this),
                                        isChecked = $this.prop('checked'),
                                        $parent = $this.closest('.ck-label'),
                                        userId = $this.val();
                                        
                                    if (isChecked) {
                                        self.selectedList.push(userId);
                                    } else {
                                        self.selectedList = _.without(self.selectedList, userId);
                                    }
                                });
                            };
                            pagination.init(args);
                            self.bindSearchMember(dialog.__popup.find('.search-combobox-form'));
                        }
                    }).showModal();
            });
        },
        
        bindSearchMember: function(form) {
            form.submit(function(){
                var $this = $(this),
                    $input = $this.find('.search-combobox-input');
                pagination.reload({keyword: $input.val()});
                return false;
            });
        },
        
        /**
         * 切换礼包激活码导入方式
         */
        toggleKaCodeImport:function(){
            var $divCon = $(".form-tag-con .form-field-gift-con");
            $('div.form-tag :radio').change(function(){
                var $this = $(this),
                    $div = $divCon.eq($this.val()); 
                $div.removeClass("hide").siblings().addClass("hide");
                if($this.val() == 0) {
                    $div.siblings().find('textarea').attr("disabled", true);
                } else {
                    $div.find('textarea').attr("disabled", false);
                }
            });
        }
    };
    
    Ka.init();
});