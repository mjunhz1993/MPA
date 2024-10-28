function AI_box(el, d){loadJS('main/read-box-mini', function(){
	open_readBoxMini(el, 'custom', 'Oktagon AI', 1, function(box, tools){
		if(d.type == 'ask'){ return AI_box_type_HTML(el, d, box, tools) }
	});
})}

function AI_box_type_HTML(el, d, box, tools, html = ''){
	html += '<textarea placeholder="'+d.placeholder+'"></textarea>';
	box.html(html);
	tools.html('<button class="buttonSquare buttonBlue">'+d.button1+'</button>');
	tools.find('button').click(function(){ AI_box_click_button(el, box, tools, d) });
	setTimeout(function(){ box.find('textarea').focus() }, 500);
}

function AI_box_click_button(el, box, tools, d){
	d.val = box.find('textarea').val();
	if(valEmpty(d.val)){ return }
	tools.empty();

	clickIn_readBoxMini(box.closest('.readBoxMini'), 'custom', 'Oktagon AI', 2, function(){
		AI_box_display_result(el, box, tools, d)
	});
}

function AI_box_display_result(el, box, tools, d, html = ''){
	AI({
		instruction: d.instruction,
		ask: d.val,
		answer: function(data){
			html += '<div class="ai"><div class="ai_icon"></div><div>'+encodeAnswerWithDIV(data)+'</div></div>';
			box.html(html);
			tools.html('<button class="buttonSquare buttonBlue">'+d.button2+'</button>');
			tools.find('button').click(function(){ d.done(data) })
		}
	});
}

// ----- EVENTS

function AI(d){
	ask_AI(d);
}

function ask_AI(d){
	$.post('/crm/php/AI/AI.php', {
		AI: true,
		instruction: d.instruction,
		ask: d.ask
	}, function(data){
		data = JSON.parse(data);
		if(data.error){ console.log(data.error); return createAlertPOPUP('Oktagon_AI_not_available') }
		if(typeof d.answer === 'function'){ d.answer(grab_AI_answer(data)) }
	})
}

function grab_AI_answer(data, str = ''){ console.log(data);
	data = data.candidates[0].content.parts;
	for(let i = 0; i < data.length; i++){ str += data[i].text }
	return str
}

function encodeAnswerWithBR(text){ return text.replace(/\n/g, '<br>'); }
function encodeAnswerWithDIV(text){ return text.split('\n').map(line => `<div>${line}</div>`).join(''); }

loadCSS('AI')