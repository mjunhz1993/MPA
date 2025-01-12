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

function AI_box_display_result(el, box, tools, d){loadJS('AI/AI', () => {
	ask_AI({
		instruction: d.instruction,
		ask: d.val,
		answer: function(data){
			box.html(`
				<div class="ai">
					<div class="ai_icon"></div>
					<div>${encodeAnswerWithDIV(data)}</div>
				</div>
			`);
			tools.html(`<button class="buttonSquare buttonBlue">${d.button2}</button>`);
			tools.find('button').click(function(){ d.done(data) })
		}
	});
})}