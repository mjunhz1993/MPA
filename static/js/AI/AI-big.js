function AI_window(d = {}){loadJS('AI/AI', function(){
	if($('#AI').length == 1){ return }
	$('body').append(AI_window_HTML());
	var box = $('#AI');
	box.fadeIn('fast', function(){ $(this).find('textarea').focus() });

	loadIn_AI_models();
})}

function AI_window_HTML(){
	return `
	<div id="AI" style="display:none">
		<div class="top">
			<div class="title">
				<div class="ai_icon"></div>
				<h2>Oktagon AI</h2>
			</div>
			<select onchange="select_AI_model($(this))">
				<option value="">${slovar('Select')}</option>
			</select>
			<a onclick="close_AI_window()">${getSVG('x')}</a>
		</div>
		<div class="instruction" style="display:none"></div>
		<div class="conversation"></div>
		<div class="input" style="display:none">
			<textarea onkeyup="type_to_AI($(this), event)"></textarea>
		</div>
	</div>
	`
}

function loadIn_AI_models(){
	$.get('/crm/php/AI/AI.php', {loadIn_AI_models:true}, function(data){
		data = JSON.parse(data);
		data.forEach(m => {
			$('#AI select').append(`
				<option value="${m.id}">${m.name}</option>
			`)
		})
	})
}

function select_AI_model(el){
	input = $('#AI .input');
	input.hide();
	$.get('/crm/php/AI/AI.php', {loadIn_AI_models:true, id:el.val()}, function(data){
		data = JSON.parse(data);
		if(!data[0]){ return }
		input.show();
		add_AI_instructions(data[0].instructions);
		$('#AI textarea').focus();
	})
}

function add_AI_instructions(t){
	$('#AI .instruction').text(t.replace("{user_id}", user_id));
}

function add_conversation_bubble(text, type = 'user'){
	var box = $('#AI .conversation');
	if(box.find('.bubble').length > 50){ box.find('.bubble').first().remove() }
	box.append(conversation_bubble_HTML(text, type))
	setTimeout(function(){ $('#AI').animate({ scrollTop: $('#AI').prop('scrollHeight') }, 200) }, 101);
	remove_HTML_loader($('#AI'));
}

function conversation_bubble_HTML(text, type){
	return `
	<div class="bubbleBox ${type}">
		<div class="bubble">${text}</div>
	</div>
	`
}

function type_to_AI(el, e){
	if(e.keyCode == 13 && !e.shiftKey){ return start_AI_question(el) }
}

function start_AI_question(el){
	var text = el.val();
	if(valEmpty(text.replace(/(\r\n|\n|\r)/gm, ""))){ return }
	el.val('').hide();
	el.parent().append(HTML_loader())
	add_conversation_bubble(text);

	if(valEmpty($('#AI select').val())){
		el.show().focus();
		return add_conversation_bubble(slovar('Not_allowed_to_answer'), 'ai');
	}

	ask_AI({
		instruction: $('#AI .instruction').text(),
		ask:text,
		history: grab_history(),
		answer: function(d){ work_with_answer(el, text, d) }
	})
}

function grab_history(h = []){
	var box = $('#AI .conversation');
	box.find('.bubble').each(function(){
		var type = 'model';
		if($(this).closest('.bubbleBox').hasClass('user')){ type = 'user' }
		h.push({role:type, text:$(this).text()});
	});
	return h;
}

// --- ANSWER

function work_with_answer(el, text, d){
	object = encodeAnswerWithJSON(d);
	if(object){ return if_JSON_answer(el, text, object) }
	d = encodeAnswerWithHTML(d);
	default_answer(el, d);
}

function if_JSON_answer(el, text, jsonObject){
	if(encodeAnswerWithSQLselect(jsonObject)){ return foundSelectStatement(jsonObject.sql, text) }
	default_answer(el, 'Action_denied');
}

function default_answer(el, d){
	el.show().focus();
	add_conversation_bubble(d, 'ai');
}

// SQL SELECT

function foundSelectStatement(statement, text){
	$.post('/crm/php/export/table.php', {
		exportTable: true,
		stringQuery: statement
	}, function(data){
		data = JSON.parse(data);
		if(data.error){ return createAlertPOPUP(data.error) }
		userFreandlyAnswer(SelectStatementTableToString(data), text);
	})
}
function SelectStatementTableToString(data) {
    const objectToString = (obj) => {
        return Object.entries(obj)
            .map(([key, value]) => `${key} = ${value === null ? 'null' : value}`)
            .join(' | ');
    };
    return data.map(objectToString).join('\n');
}
function userFreandlyAnswer(instruction, text){ console.log(instruction);
	var currentInstructions = $('#AI .instruction').text();
	add_AI_instructions(`
		- if user asks this question: "${text}"
		- this is the data for the answer: "${instruction}"
		- make the answer read freandly with HTML tags
	`);
	ask_AI({
		instruction: $('#AI .instruction').text(),
		ask:text,
		answer: function(d){
			$('#AI textarea').show().focus();
			add_conversation_bubble(d, 'ai');
			add_AI_instructions(currentInstructions);
		}
	})
}

function close_AI_window(){
	$('#AI').fadeOut('fast', function(){ $(this).remove() })
}