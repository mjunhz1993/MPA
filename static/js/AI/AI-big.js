function AI_window(d = {}){loadJS('AI/slovar/'+slovar(),()=>{loadJS('AI/AI', ()=>{
	if($('#AI').length == 1){ return console.log('ddd') }
	$('#Main').append(AI_window_HTML());
	var box = $('#AI');
	box.fadeIn('fast', function(){ $(this).find('textarea').focus() });
	loadIn_AI_models();
})})}

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

function close_AI_window(){
	$('#AI').fadeOut('fast', function(){ $(this).remove() })
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

function get_last_conversation_bubble(){
	return $('#AI .bubble').last()
}

// --- SELECT AI MODEL

function get_AI_models(callback, id = null){
	$.getJSON('/crm/php/AI/run', {
		loadIn_AI_models: true,
		id: id
	}, function(models){ console.log(models);
		if(models.length == 0){ return false }
		if(id != null){ models = models[0] }
		return callback(models)
	})
}

function loadIn_AI_models(){
	get_AI_models(function(models){
		if(models.length == 0){ return add_conversation_bubble(slovar('I_cant_help_you'), 'au') }
		let selectMenu = $('#AI select');
		models.forEach(m => {
			selectMenu.append(`
				<option value="${m.id}">${m.name}</option>
			`)
		})
		selectMenu.val(selectMenu.find("option:eq(1)").val());
		return select_AI_model(selectMenu);
	})
}

function select_AI_model(el){
	input = $('#AI .input');
	input.hide();

	get_AI_models(function(model){
		input.show();
		add_AI_instructions(model.instructions);
		$('#AI textarea').focus();
	}, el.val())
}

function add_AI_instructions(instructions, showhtml = 0){
	let instructionBox = $('#AI .instruction');
	instructionBox.text(instructions.replace("{user_id}", user_id));
}

// --- TYPING EVENT

function type_to_AI(el, e){
	if(e.keyCode == 13 && !e.shiftKey){ return start_AI_question(el) }
}

function show_AI_processing(){
	let el = $('#AI textarea');
	el.val('').hide();
	el.parent().append(HTML_loader('Oktagon AI Processing...'));
}

function grab_history(h = []){
	var box = $('#AI .conversation');
	box.find('.bubble').each(function(){
		if($(this).hasClass('ignore')){ console.log('ddd'); return; }
		var type = 'model';
		if($(this).closest('.bubbleBox').hasClass('user')){ type = 'user' }
		h.push({role:type, text:$(this).text()});
	});
	return h;
}

function start_AI_question(el){
	var question = el.val();
	if(valEmpty(question.replace(/(\r\n|\n|\r)/gm, ""))){ return }

	let history = grab_history();
	add_conversation_bubble(question);

	show_AI_processing();

	if(valEmpty($('#AI select').val())){
		el.show().focus();
		return add_conversation_bubble(slovar('Not_allowed_to_answer'), 'ai');
	}

	let instructionBox = $('#AI .instruction');

	ask_AI({
		instruction: instructionBox.text(),
		ask: question,
		history: history,
		answer: function(answer){ work_with_answer(el, question, answer) }
	})
}

// --- ANSWER

function work_with_answer(el, question, answer){
	el.show().focus();
	add_conversation_bubble(answer, 'ai');

	get_AI_models(function(model){

		let lastBubble = get_last_conversation_bubble();
		if(model.answer_parse.includes('html')){ console.log('html...'); encodeAnswerWithHTML(lastBubble) }
		if(model.answer_parse.includes('json')){ console.log('json...'); encodeAnswerWithJSON(lastBubble, question) }

	}, $('#AI select').val())
}

// ANSWER - SQL SELECT

function foundSelectStatement(box, statement, question){
	$.post('/crm/php/export/table', {
		exportTable: true,
		stringQuery: statement
	}, function(data){
		data = JSON.parse(data);
		if(data.error){ return createAlertPOPUP(data.error) }
		userFreandlyAnswer(box, SelectStatementTableToString(data), question);
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
function userFreandlyAnswer(box, instruction, question){ console.log(instruction);
	box.closest('.bubbleBox').hide();
	show_AI_processing();
	ask_AI({
		instruction:
		`
			- if user asks this question: "${question}"
			- this is the data for the answer: "${instruction}"
			- make the answer with HTML and STYLE tags
		`,
		ask:question,
		answer: function(answer){
			work_with_answer($('#AI textarea'), question, answer);
			get_last_conversation_bubble().addClass('ignore');
		}
	})
}