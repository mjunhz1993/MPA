loadCSS('AI');

function ask_AI(d){
	$.post('/crm/php/AI/AI', {
		AI: true,
		instruction: d.instruction,
		history: d.history,
		ask: d.ask
	}, function(data){
		data = JSON.parse(data);
		if(data.error){
			console.log(data.error);
			return createAlertPOPUP(data.error.message ?? data.error);
		}
		if(typeof d.answer === 'function'){ d.answer(grab_AI_answer(data)) }
	})
}

function grab_AI_answer(data, str = ''){ console.log(data);
	data = data.candidates[0].content.parts;
	for(let i = 0; i < data.length; i++){ str += data[i].text }
	return str
}

// --- ENCODING

function encodeAnswerWithJSON(text){
	const jsonRegex = /{[^}]*}/g;
	const matches = text.match(jsonRegex);
	if(matches){
	  try {
	    const parsed = JSON.parse(matches[0]);
	    return parsed;
	  } 
	  catch(error){ return false }
	}
	else{ return false }
}

function encodeAnswerWithHTML(text){
	return text.replace(/```html/g, '<div class="code">').replace(/```/g, "</div>").trim();
}

function encodeAnswerWithSQLselect(jsonObject) {
	if(jsonObject.sql && /^SELECT\b/i.test(jsonObject.sql)){ return jsonObject.sql; }
	return false;
}

function encodeAnswerWithBR(text){ return text.replace(/\n/g, '<br>'); }
function encodeAnswerWithDIV(text){ return text.split('\n').map(line => `<div>${line}</div>`).join(''); }