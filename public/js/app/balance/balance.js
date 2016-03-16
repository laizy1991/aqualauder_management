/**
 * @author: lox@warthog.cn
 * @date: 2015-05-06
 */

define(function(require) {
    require('../common/common');
    require('../../thirdParty/dialog');  // 弹窗插件
    require('../../thirdParty/underscore');
    require('../../thirdParty/chosen');  // 下拉选择框插件
    
    var ajax = require('../util/ajax');
    var dd = require('../util/dialog');
    
    /**              
     * 时间戳转换日期              
     * @param <int> unixTime    待时间戳(秒)              
     * @param <bool> isFull    返回完整时间(Y-m-d 或者 Y-m-d H:i:s)              
     * @param <int>  timeZone   时区              
     */
    function tsToDate(timeStamp) {
        var time = new Date(timeStamp);
        var ymdhis = "";
        ymdhis += time.getUTCFullYear() + "-";
        ymdhis += (time.getUTCMonth()+1) + "-";
        ymdhis += time.getUTCDate();
            ymdhis += " " + time.getUTCHours() + ":";
            ymdhis += time.getUTCMinutes() + ":";
            ymdhis += time.getUTCSeconds();
        return ymdhis;
    }
    
    function toDecimal2(x) {  
        var f = parseFloat(x);  
        if (isNaN(f)) {  
            return false;  
        }  
        var f = Math.round(x*100)/100;  
        var s = f.toString();  
        var rs = s.indexOf('.');  
        if (rs < 0) {  
            rs = s.length;  
            s += '.';  
        }  
        while (s.length <= rs + 2) {  
            s += '0';  
        }  
        return s;  
    } 
    
    var Balance = {
        init: function() {
        	this.initDatepicker();
            this.initChosen();
            this.switchType();
            this.checkAll();
            this.initCheck();
        	this.add($('[role="add"]'));
        	this.view($('[role="view"]'));
        	this.triger($('[role="triger"]'));
        },
        
        initCheck:function(){
            $("#ckAll").attr("checked",false);
            $('input[name="id"]:checked').each(function(){
                $(this).attr("checked",false);
            });
        },
        
        /**
         * 全选、反选效果
         */
        checkAll: function() {
            var $ckAll = $('[role="ckAll"]'),
                $ck = $('[role="ck"]:not(":disabled")'),
                $ckNum = $('[role="ckNum"]');

            var isCheckAll;

            // 点击ckAll
            $ckAll.click(function() {
                isCheckAll = $ckAll.prop('checked');

                $ck.prop('checked', isCheckAll);

                if (isCheckAll) {
                    $ck.closest('tr').addClass('selected');
                    $ckNum && $ckNum.html($ck.length);

                } else {
                    $ck.closest('tr').removeClass('selected');
                    $ckNum && $ckNum.html(0);
                }
            });

            // 点击ck
            $ck.click(function() {
                var $curCk = $(this),
                    isChecked = $curCk.prop('checked');

                $curCk.closest('tr').toggleClass('selected');

                if (isChecked) {
                    isCheckAll = true;
                    $ckNum && $ckNum.html(parseInt($ckNum.text()) + 1);

                    $ck.each(function() {
                        if (!$(this).prop('checked')) {
                            isCheckAll = false;
                        }
                    });

                } else {
                    isCheckAll = false;
                    $ckNum && $ckNum.html(parseInt($ckNum.text()) - 1);
                }

                $ckAll.prop('checked', isCheckAll);
            });
        },

        
        /**
         * 初始化日历插件
         */
        initDatepicker: function() {
            $('#startTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd',
                    readOnly:true,
                    maxDate:'#F{$dp.$D(\'endTime\')}'
                });
            });

            $('#endTime').focus(function() {
                WdatePicker({
                    dateFmt:'yyyy-MM-dd',
                    readOnly:true,
                    minDate:'#F{$dp.$D(\'startTime\')}'
                });
            });
        },

        /**
         * 切换筛选类型
         */
        switchType: function() {
            $('#filter-by-time').change(function() {
                var $this = $(this),
                    $conditions = $('[role="conditions"]'),
                    id = $this.find('option:selected').data('id');
                if (id != 5) {
                    $conditions.hide();
                } else {
                    $('#conditions-' + id).show().siblings('[role="conditions"]').hide();
                }
            });
        },
        /**
         * 初始化下拉选择框插件
         */
        initChosen: function() {
            $('.chosen-select').chosen({disable_search_threshold: 10});
        },
        
        /**
         * 添加
         */
        add: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'addDialog',
                    title: '批量创建清算订单',
                    content: document.getElementById('addDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确认',
                            callback: function () {
                            	  //把当前选择的数据ID，列出来
                            	  var $td=$(".auditId");
                            	  var auditIds = new Array();
                            	  $td.each(function(item){
                            		  if($(this)[0].checked)
                            	      {
                            			  auditIds.push($(this).val());
                            	      }
                                 });
                            	  if(auditIds.length < 1)
                            	  {
                            		  dd.alert('请至少勾选一个订单!！', function(){
                                          window.location.reload(false);
                                      });
                            		  return;
                            	  }
                                var params={"ids":auditIds.toString()};
                            	//
                                ajax.post("/ajax/balance/add", params, function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，添加成功！', function(){
                                        	window.location.reload(true);
                                        });
                                    }else{
                                    	addDialog.close();
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
                        $msg = this.__popup.find('.msg');
                    }

                }).showModal();
                
            });
        },
        
        
        
        /**
         * 
         */
        view: function(obj) {
            var self = this;
            obj.click(function() {
                var $this = $(this);
                var id = $this.closest('[role="view"]').attr("targetId");
                
                $.ajax({
                    type:'POST',
                    async:true,
                    data:{'id':id},
                    url:'/ajax/balance/view',
                    dataType:'json',
                    success:function(result){
                        if(result.success){
                        	var bodyEle = $("#order-detail-tbody"); 
                        	//清理对应的数据
                        	bodyEle.html('');
                        	var bTd = '<td>';
                        	var eTd = '</td>';
                        	//根据对应的结果，封装对应的显示
                        	$.each(result.data,function(index,val){
                        		var finishT = '';
                        		if(val.finishTime > 0)
                        		{
                        			finishT = tsToDate(val.finishTime);
                        		}
                        		var state = '';
                        		switch (val.state) {
                        		case 0:
                        			state = '待支付';
                        			break;
                        		case 1:
                        			state = '完成支付';
                        			break;
                        		case 2:
                        			state = '待发货';
                        			break;
                        		case 3:
                        			state = '完成发货';
                        			break;
                        		case 4:
                        			state = '交易成功';
                        			break;
                        		case 5:
                        			state = '交易关闭';
                        			break;
                        		case 6:
                        			state = '已结算';
                        			break;
								case 7:
									state = '待结算';
									break;
								default:
									break;
								}
                        		
                        		var refundState = '';
                        		switch (val.refundState) {
                        		case 0:
                        			refundState = '';
                        			break;
                        		case 1:
                        			refundState = '申请退款中';
                        			break;
                        		case 2:
                        			refundState = '商家不同意';
                        			break;
                        		case 3:
                        			refundState = '商家同意';
                        			break;
                        		case 4:
                        			refundState = '退款中';
                        			break;
                        		case 5:
                        			refundState = '退款成功';
                        			break;
                        		case 6:
                        			refundState = '不退款';
                        			break;
                        		case 7:
                        			refundState = '取消退款';
                        			break;
								case 8:
									refundState = '平台同意';
									break;
								default:
									break;
								}
                        		
                        		var sName = val.sellerName;
                        		if(val.sellerUid == 0)
                        	    {
                        			sName = '游易平台';
                        	    }
                        		
                        		var trInfo = '<tr>'+bTd+val.orderId+eTd
                        		+bTd+val.outTradeNo+eTd
                        		+bTd+tsToDate(val.createTime)+eTd
                        		+bTd+finishT+eTd
                        		+bTd+val.buyerName+'('+val.buyerUid+')'+eTd
                        		+bTd+sName+'('+val.sellerUid+')'+eTd
                        		+bTd+toDecimal2(parseFloat(val.needPayFee/100))+eTd
                        		+bTd+toDecimal2(parseFloat(val.totalFee/100))+eTd
                        		+bTd+state+eTd
                                +bTd+refundState+eTd
                        		+bTd+val.goodsNumber+eTd+'</tr>';
                        		bodyEle.append(trInfo);
                        	});
                        	//根据实际的内容大小，调整整个对话框的大小
                        	var dialogEle = $("#content:editDialog");
                        	dialogEle.height(200+bodyEle.height());
                        }
                    }
                });
                
                var editDialog = dialog({
                    id: 'editDialog',
                    title: '订单详情',
                    width:1000,
                    content: document.getElementById('viewDialogTmpl').innerHTML,
                    button: [
                    ],
                    cancelValue: '确定',
                    cancel: function() {
                    },
                    onshow: function() {
                    }
                }).showModal();
            });
        },
        
        /**
         * 添加
         */
        triger: function(obj) {
            var self = this;

            obj.click(function() {
                var $this = $(this);

                var addDialog = dialog({
                    id: 'trigerDialog',
                    title: '手工触发清算任务',
                    content: document.getElementById('trigerDialogTmpl').innerHTML,
                    button: [
                        {
                            value: '确认',
                            callback: function () {
                            	//
                                ajax.post("/ajax/balance/triger", "", function(result){
                                    if(result.success){
                                        addDialog.close();
                                        dd.alert('恭喜，操作成功！', function(){
                                            window.location.reload(false);
                                        });
                                    }else{
                                    	addDialog.close();
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
                    }

                }).showModal();
                
            });
        },
    };
    
    Balance.init();
});