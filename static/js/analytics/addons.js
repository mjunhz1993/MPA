function checkForAnalyticAddons(module, box, type = ''){
	$.get('/crm/php/admin/module.php?get_module_addons=1&module=' + module, function(data){
        data = JSON.parse(data);
        if(data){for(var i=0; i<data.length; i++){
        	var addon = data[i].addon.split('|');
            if(addon[0] == 'JSCommand'){
                var addonF = new Function(addon[2]);
                if(addon[1] == type){ addonF() }
            }
        }}
    })
}