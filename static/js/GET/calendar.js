function GET_event(d){
	$.getJSON('/crm/php/calendar/calendar.php?get_events=1', {
		module:d.module,
		startCol:d.startCol,
		endCol:d.endCol,
		startDate:d.startDate,
		endDate:d.endDate,
		assignedCol:d.assignedCol,
		shareCol:d.shareCol,
		colorCol:d.colorCol,
		users:d.users,
		limit:d.limit
	}, function(data){
		if(data.error){ return createAlertPOPUP(data.error) }
		if(d.done){ d.done(data) }
	})
}