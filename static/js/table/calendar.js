function openCalendarTable(module){
	$.get('/crm/php/calendar/presets.php', {
		get_presets:true,
		module:module
	}, function(data){
		data = JSON.parse(data);
		if(!data){ return createAlertPOPUP(slovar('Empty')) }
		data = data.data;
		if(valEmpty(data.startCol)){ return createAlertPOPUP(slovar('Empty')) }
		if($('.calendarBox').length != 0){ return }

		loadJS('calendar/calendar', function(){
			setupCalendar($('.horizontalTable'), {
				module:module,
				start:data.startCol,
				end:data.endCol,
				color:data.colorCol,
				assigned:data.assignedCol,
				share:data.shareCol,
				noAddButton:true
			})
		})
	})
}