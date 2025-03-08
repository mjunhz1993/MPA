function checkForModuleAddons(module, box, type = '', row = null){
	$.getJSON('/crm/php/admin/module.php?get_module_addons=1&module=' + module, function(data){
        if(data){for(var i=0; i<data.length; i++){
        	var addon = data[i].addon.split('|');
            if(addon[0] == 'JSCommand'){
                var addonF = new Function(addon[2]);
                if(addon[1] == type){ addonF() }
            }
            else if(addon[0] == 'loadJS'){
                if(addon[1] != type){ continue }
                loadJS(window.location.origin+'/crm/php/downloads/'+addon[2]+'.js',function(){ eval(addon[2]+'(row,box)') })
            }
            else{ RUN_addon(module, box, type, addon, i) }
        }}
    })
}

function RUN_addon(module, box, type, addon, i){loadJS('main/addons/' + addon[0], function(){
    var addonF = new Function('module', 'box', 'type', 'addon', 'i', 'return ADDON_' + addon[0] + '(module, box, type, addon, i)');
    addonF(module, box, type, addon, i);
})}