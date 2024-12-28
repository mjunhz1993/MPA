function openAnalytic(box){
	module = box.attr('data-module');
	box = box.find('.horizontalTable');

	$.get('/crm/php/presets/presets.php', {
		get_presets:true,
		module:module,
		type:'analytic'
	}, function(data){
		data = JSON.parse(data);
		if(!data){ return createAlertPOPUP(slovar('Empty')) }
		data = data.data;
		if(valEmpty(data.id)){ return createAlertPOPUP(slovar('Empty')) }
		loadJS('analytics/analytics', function(){
			analytics(box, {id:data.id})
		})
	})
}