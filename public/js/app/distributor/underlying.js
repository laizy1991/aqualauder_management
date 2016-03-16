/**
 */

define(function(require) {
    require('../common/common');  // 公共模块
    var dd = require('../util/dialog');
    var ajax = require('../util/ajax');
    
    var Obj = {
            init: function() {
                this.exportData($('[role="export"]'));
            },
            exportData: function (obj) {
                obj.click(function () {
    	            var superior =$('#superior').val();
    	            if(superior.length < 1)
    	            {
    	            	dd.alert("请输入关键词查询");
    	            	return;
    	            }
    	            
    	            var params={
    	            	"superior":superior,
    	            };

                    ajax.post('/ajax/Distributor/exportUnderlying',params, function(result) {
                        if(result.success){
                            window.location="/Statistics/download?path="+result.data.path;
                        }else{
                            dd.alert(result.error);
                        }
                    });
                });
            }
    }
        Obj.init();
});

