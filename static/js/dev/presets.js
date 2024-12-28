function openPreset(module){
	hideDropdownMenu();
	popup = createPOPUPbox();
	popupBox = popup.find('.popupBox');
	popupBox.html(`
		<button class="button buttonBlue" onclick="openEditPreset('${module}', 'calendar')">${slovar('Calendar')}</button>
		<button class="button buttonBlue" onclick="openEditPreset('${module}', 'pipeline')">${slovar('Pipeline')}</button>
		<button class="button buttonBlue" onclick="openEditPreset('${module}', 'analytic')">${slovar('Analytic')}</button>
	`)
	popup.fadeIn('fast');
}

function openEditPreset(module, type){
	popup = $('.popup').last();
	popupBox = popup.find('.popupBox');

	popupBox.html(`
	<form>
		<input type="hidden" name="module" value="`+module+`">
		<input type="hidden" name="type" value="`+type+`">
		`+HTML_forForm(type)+`
		<button class="button buttonBlue">`+slovar('Save_changes')+`</button>
		<span class="button buttonGrey" onclick="removePOPUPbox()">`+slovar('Cancel')+`</span>
	</form>
	`);

	GET_column({
		module:module,
		showAll:true,
		each:function(c){ appendColumnToForm(popup, c, type) },
		done:function(){ checkPreSelectedValuesForForm(popup, module, type) }
	})

	popup.find('form').on('submit', function(e){
		e.preventDefault();
		updateEditCalendar(popup);
	})
}

function HTML_forForm(type){
	if(type == 'calendar'){ return HTML_calendarForm() }
	if(type == 'pipeline'){ return HTML_pipelineForm() }
	if(type == 'analytic'){ return HTML_analyticForm() }
}

function appendColumnToForm(popup, c){
	html = '<option value="'+c.column+'">'+slovar(c.name)+'</option>';
	if(c.type == 'VARCHAR'){ popup.find('.text-type').append(html) }
	if(c.type == 'SELECT'){ popup.find('.select-type').append(html) }
	if(c.type == 'DATETIME'){ popup.find('.date-type').append(html) }
	if(c.type == 'JOIN_ADD'){ popup.find('.join-type').append(html) }
	if(c.type == 'PRICE'){ popup.find('.price-type').append(html) }
	if(c.type == 'VARCHAR' && c.list.includes('MULTISELECT')){ popup.find('.share-type').append(html) }
	if(c.type == 'VARCHAR' && c.list == 'COLOR'){ popup.find('.color-type').append(html) }
}

function checkPreSelectedValuesForForm(popup, module, type){
	$.get('/crm/php/presets/presets.php', {
		get_presets:true,
		module:module,
		type:type
	}, function(data){ data = JSON.parse(data);
		if(!data){ return }
		Object.entries(data.data).forEach((value) => {
			popup.find('[name="data['+value[0]+']"]').val(value[1])
		});
	})
}

function updateEditCalendar(popup){
	$.post('/crm/php/presets/presets.php?update_presets=1', popup.find('form').serialize(), function(data){
		data = JSON.parse(data);
		if(data.error){ return createAlertPOPUP(data.error) }
		removePOPUPbox();
	})
}

// HTML

function HTML_calendarForm(){
	return `
	<div class="col col40">
		<label>Subject column</label>
		<input type="text" name="data[subject_custom]">
	</div><div class="col col30">
		<label>LEFT JOIN table</label>
		<input type="text" name="data[LEFT_JOIN]">
		</div><div class="col col30">
		<label>LEFT JOIN column</label>
		<input type="text" name="data[LEFT_JOIN_COL]">
	</div>
	<label>Start date</label>
	<select class="date-type" name="data[startCol]"><option></option></select>
	<label>End date</label>
	<select class="date-type" name="data[endCol]"><option></option></select>
	<label>Assigned column</label>
	<select class="join-type" name="data[assignedCol]"><option></option></select>
	<label>Share column</label>
	<select class="share-type" name="data[shareCol]"><option></option></select>
	<label>Color column</label>
	<select class="color-type" name="data[colorCol]"><option></option></select>
	`
}

function HTML_pipelineForm(){
	return `
	<div class="col col50">
		<label>Status Column</label>
		<select class="select-type" name="data[status]" required><option></option></select>
	</div><div class="col col50">
		<label>Status options ( <b>|</b> )</label>
		<input type="text" name="data[statusOptions]">
	</div>
	<div class="col col50">
	<label>Subject Column</label>
	<select class="text-type" name="data[subject]" required><option></option></select>
	</div><div class="col col50">
		<label>Extra text column</label>
		<select class="text-type" name="data[text]"><option></option></select>
	</div>
	<div class="col col50">
		<label>Price Column</label>
		<select class="price-type" name="data[price]"><option></option></select>
	</div><div class="col col50">
		<label>Date Column</label>
		<select class="date-type" name="data[date]" required><option></option></select>
	</div>
	<div class="col col50">
		<label>Assigned column</label>
		<select class="join-type" name="data[assigned]" required><option></option></select>
	</div><div class="col col50">
		<label>Share column</label>
		<select class="share-type" name="data[share]"><option></option></select>
	</div>
	`
}

function HTML_analyticForm(){
	return `
	<label>Analytic ID</label>
	<input type="number" name="data[id]">
	`
}