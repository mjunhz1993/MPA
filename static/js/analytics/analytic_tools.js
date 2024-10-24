function HTML_ANAL_form(html = ''){
	html += '<form><div class="addFormInner"></div>';
	html += '<button class="button buttonGreen" onclick="analytics_FORM_submit($(this))">'+slovar('Add_new')+'</button>';
	html += '<div class="button buttonGrey" onclick="removePOPUPbox()">'+slovar('Cancel')+'</div>';
	html += '</form>';
	return html;
}

function analytics_FORM_submit(el){
	loadJS('form/form',function(){ checkHiddenRequiredFields(el.closest('form')) })
}

// ANALYTIC

function FORM_analytic(id = null){
	popup = createPOPUPbox();
	popupBox = popup.find('.popupBox');
	popupBox.html(HTML_ANAL_form());

	form = popup.find('.addFormInner');
	form.append('<input type="hidden" name="analytics_create">');
	form.append(createFormField({
		editable:true,
		name:'Name',
		type:'VARCHAR',
		column:'name',
		mandatory:true,
	}));
	form.append(createFormField({
		editable:true,
		name:'Category',
		type:'VARCHAR',
		column:'category',
		mandatory:true,
	}));

	HTML_ANAL_select_users(form, function(){
		if(id){ analytics_get(function(data){ add_analytic_to_form(form, data[0]) }, id) }
	});

	popup.find('form').on('submit', function(e){
		e.preventDefault();
		$.post(ANALobj.post, $(this).serialize(), function(data){ data = JSON.parse(data);
			if(data.error){ return createAlertPOPUP(data.error) }
			removePOPUPbox();
			HTML_ANAL_select('#'+ANALobj.select, function(id){ get_analytic_tables('#'+ANALobj.main, data.id) })
		})
	});

	popup.fadeIn('fast');
}

function HTML_ANAL_select_users(form, callback, html = ''){
	$.get('/crm/php/main/module.php?get_all_users=1', function(data){
        data = JSON.parse(data);
        html += '<label>'+slovar('Share')+'</label>';
        html += '<div class="analshare">';
        for(var i=0; i<data.length; i++){
            html += checkboxInput({
                name:'share[]',
                value:data[i].user_id,
                id:'share'+data[i].user_id,
                label:data[i].user_username,
            })
        }
        html += '</div>';
        form.append(html);
        callback();
    })
}

function add_analytic_to_form(form, data){
	form.prepend('<input type="hidden" name="id" value="'+data.id+'">');
	form.find('[name=name]').val(data.name);
	form.find('[name=category]').val(data.category);
	for(i=0; i<data.share.length; i++){ form.find('#share'+data.share[i]).prop('checked', true) }
	form.parent().find('.buttonGreen').text(slovar('Edit'));
}

// TABLE

function FORM_analytic_table(pid, id = null, html = ''){
	hideDropdownMenu();
	popup = createPOPUPbox();
	popupBox = popup.find('.popupBox');
	popupBox.html(HTML_ANAL_form());

	form = popup.find('.addFormInner');
	form.append('<input type="hidden" name="analytic_tables_create">');
	form.append('<input type="hidden" name="pid" value="'+pid+'">');
	form.append(createFormField({
		editable:true,
		name:'Name',
		type:'VARCHAR',
		column:'name',
		mandatory:true,
	}));
	form.append(createFormField({
		editable:true,
		name:'Width',
		type:'SELECT',
		column:'width',
		list:'30,30|40,40|50,50|60,60|70,70|80,80|90,90|100,100',
		preselected_option:'100',
		mandatory:true,
	}));
	form.append(createFormField({
		editable:true,
		name:'Category',
		type:'VARCHAR',
		column:'category',
		mandatory:true,
	}));

	list = [
		'TABLE,Table','SUM,Sum',
		'pie,Pie','doughnut,Doughnut','polarArea,PolarArea',
		'bar,Bar','line,Line',
		'DATE,Date'
	];

	form.append(createFormField({
		editable:true,
		name:'Type',
		type:'SELECT',
		column:'type',
		list:list.join('|'),
		mandatory:true,
	}));

	if(id){ analytic_tables_get(function(data){ add_analytic_table_to_form(form, data[0]) }, pid, id) }

	popup.find('form').on('submit', function(e){
		e.preventDefault();
		$.post(ANALobj.post, $(this).serialize(), function(data){ data = JSON.parse(data);
			if(data.error){ return createAlertPOPUP(data.error) }
			removePOPUPbox();
			get_analytic_tables('#'+ANALobj.main, pid);
		})
	});

	popup.fadeIn('fast');
}

function add_analytic_table_to_form(form, data){
	form.prepend('<input type="hidden" name="id" value="'+data.id+'">');
	form.find('[name=type]').val(data.type);
	form.find('[name=name]').val(data.name);
	form.find('[name=category]').val(data.category);
	form.find('[name=width]').val(data.width);
	loadJS('form/form', function(){ refreshFormData(form) });
	form.parent().find('.buttonGreen').text(slovar('Edit'));
}

// CONTENT

function FORM_analytic_content(pid, id){loadJS('analytics/tools/table', function(){
	FORM_analytic_content_generate(pid, id)
})}