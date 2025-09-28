function ADDON_external_table_select(module, box, type, addon, i){
    if(!['ADD','EDIT'].includes(type)){ return }

    loadJS('form/externalTableSelector', function(){
    	externalTableSelector({
            input:{
                el:box.find(`[name=${addon[1]}]`),
                id:addon[2],
                label:addon[3]
            },
            table:{
                module:addon[4],
                columns:addon[5].split(','),
                labels:addon[6].split(',')
            }
    	})
    })
}