function GET_conversation(d){
	$.get('/crm/php/chat/chat.php?get_all_conversations=1', {
		subject:d.subject,
		limit:d.limit
	}, function(data){
		data = JSON.parse(data);
		if(d.error && data.error){ return d.error(data.error) }
		if(d.each){for(var i=0; i<data.length; i++){ d.each(data[i]) }}
		if(d.done){ d.done(data) }
	}).fail(function(){console.log('ERROR: backend napaka')});
}