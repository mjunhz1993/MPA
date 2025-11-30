loadCSS('AI');

function ask_AI(d){
	$.post('/crm/php/AI/run', {
		AI: true,
		instruction: d.instruction,
		history: d.history,
		ask: d.ask
	}, function(data){ console.log(data);
		data = JSON.parse(data);
		if(data.error){
			console.log(data.error);
			return createAlertPOPUP(data.error);
		}
		if(typeof d.answer === 'function'){ d.answer(data) }
	})
}

// --- ENCODING

function encodeAnswerWithJSON(box, question){
	if(box.find('.language-json').length != 0){
		return runEncodeAnswerWithJSON(box.find('.language-json').first(), question);	
	}
	return runEncodeAnswerWithJSON(box, question);
}
function runEncodeAnswerWithJSON(thisEl, question){
	let text = thisEl.text();
	const jsonRegex = /{[^}]*}/g;
	const matches = text.match(jsonRegex);
	if(matches){
	  try {
	    const parsed = JSON.parse(matches[0]);
	    statement = encodeAnswerWithSQLselect(parsed);
	    console.log(statement);
	    if(statement){ foundSelectStatement(thisEl, statement, question) }
	  } 
	  catch(error){ return console.log(false); }
	}
	else{ return console.log(false); }
}
function encodeAnswerWithSQLselect(jsonObject) {
	if(jsonObject.sql && /^SELECT\b/i.test(jsonObject.sql)){ return jsonObject.sql; }
	return false;
}

function encodeAnswerWithHTML(box){
	box.find('.language-html').each(function(){
		let thisEl = $(this);

		let iframe = $('<iframe>', {
        class: 'aiFrame',
        frameborder: '0'
        }).appendTo(thisEl.parent());

        let iframeDoc = iframe[0].contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(thisEl.text());
        iframeDoc.close();

        thisEl.remove();
	})
}

function encodeAnswerWithDIV(text){ return text.split('\n').map(line => `<div>${line}</div>`).join(''); }