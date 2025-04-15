function GET_conversation(d){
	$.getJSON('/crm/php/chat/chat?get_all_conversations=1', {
		subject:d.subject,
		limit:d.limit
	}, function(data){
		if(d.error && data.error){ return d.error(data.error) }
		if(d.each){for(var i=0; i<data.length; i++){ d.each(data[i]) }}
		if(d.done){ d.done(data) }
	})
}