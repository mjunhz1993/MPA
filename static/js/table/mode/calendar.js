function openCalendarTable(box){
	module = box.attr('data-module');
	box = box.find('.horizontalTable');

	$.getJSON('/crm/php/presets/presets.php', {
		get_presets:true,
		module:module,
		type:'calendar'
	}, function(data){
		console.log(data);
		if(!data){ return createAlertPOPUP(slovar('Empty')) }
		data = data.data;
		if(valEmpty(data.startCol)){ return createAlertPOPUP(slovar('Empty')) }
		if($('.calendarBox').length != 0){ return }

		loadJS('calendar/calendar', function(){
			setupCalendar(box, {
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