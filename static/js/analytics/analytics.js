ANALobj = {
	'post' : '/crm/php/analytics/exec.php',
	'select': '#anal_select',
	'main': '#anal_main',
	'box': '.analbox',
	'content': 'analcontent',
	'fragment': 'fragment',
};

function analytics_get(callback, id = null){
	$.post(ANALobj.post, {analytics_get:true, id:id}, function(data){ callback(JSON.parse(data)) })
}

function analytic_tables_get(callback, pid, id = null){
	$.post(ANALobj.post, {analytic_tables_get:true, pid:pid, id:id}, function(data){ callback(JSON.parse(data)) })
}

function analytic_content_get(callback, pid){
	$.post(ANALobj.post, {analytic_content_get:true, pid:pid}, function(data){ callback(JSON.parse(data)) })
}

function analytic_content_data(d){
	$.post(ANALobj.post, {analytic_content_data:true, pid:d.pid, data:d.data}, function(data){ d.done(JSON.parse(data)) })
}

function analytics(box = $('#Main'), html = ''){analytics_connect(function(){
	html += '<table class="h1_table"><tr>'
	html += '<td><h1>'+slovar('Analytics')+'</h1></td>';
	html += '<td>';
	if(user_id == 1){
		html += '<button class="buttonSquare buttonGreen" ';
		html += 'onclick="loadJS(\'analytics/analytic_tools\',function(){FORM_analytic()})">Add Analytic</button>';
	}
	html += '<select id="anal_select"></select>'
	html += '</td>'
	html += '</tr></table>';
	html += '<div id="anal_main"></div>';
	box.html(html);
	HTML_ANAL_select(ANALobj.select, function(id){ get_analytic_tables(ANALobj.main, id) });
})}

function analytics_connect(callback){
	loadCSS('analytics');
	loadJS('analytics/slovar/'+slovar(), function(){
		$.post(ANALobj.post, {analytics_connect:true}, function(data){
			data = JSON.parse(data);
			if(data.error){ return createAlertPOPUP(data.error) }
			callback()
		})
	})
}

function HTML_ANAL_select(el, callback, html = ''){
	analytics_get(function(data){
		thisCat = '';
		for(var i=0; i<data.length; i++){ a = data[i];
			if(thisCat != a.category){
				thisCat = a.category;
				html += '<optgroup label="'+a.category+'"></optgroup>';
			}
			html += '<option value="'+a.id+'">'+a.name+'</option>';
		}
		$(el).html(html);
		$(ANALobj.select).change(function(){ callback($(this).val()) });
		callback($(ANALobj.select).val())
	})
}

function get_analytic_tables(mainBox, id){
	mainBox = $(mainBox);
	mainBox.empty();
	analytic_tables_get(function(data){
		if(data.error){ return createAlert(mainBox, 'Red', slovar('Is_empty')) }
		HTML_ANAL_tools(mainBox, id);
		mainBox.append('<div id="anal_box"></div>');
		mainBox = $('#anal_box');
		for(var i=0; i<data.length; i++){ HTML_ANAL_tables(mainBox, id, data[i]) }
		resetDropdownMenuConfig();
		find_loading_analytic_tables(mainBox);
	}, id)
}

function HTML_ANAL_tools(el, id, html = ''){
	if(user_id != 1){ return }
	html += '<div id="anal_tools">';
	html += '<div>';
	html += '<button ';
	html += 'onclick="loadJS(\'analytics/analytic_tools\',function(){FORM_analytic_table('+id+')})" ';
	html += 'class="button buttonGreen">Add Analytic Box</button>';
	html += '</div><div>';
	html += '<a class="linksvg" onclick="loadJS(\'analytics/analytic_tools\',function(){FORM_analytic('+id+')})">';
	html += getSVG('edit')+'<span>'+slovar('Edit')+'</span></a>'
	html += '<a class="linksvg" onclick="delete_analytic('+id+','+id+')">'+getSVG('delete')+'</a>';
	html += '</div>';
	html += '</div>';
	el.html(html);
}

function check_analytic_table_category(el, category){
	if(el.find('legend[data-category="'+category+'"]').length == 1){ return }
	el.append('<fieldset><legend data-category="'+category+'">'+category+'</legend></fieldset>');
}

function HTML_ANAL_tables(el, id, data, html = ''){
	check_analytic_table_category(el, data.category);
	el = el.find('legend[data-category="'+data.category+'"]').parent();
	html += '<div class="col col'+data.width+'"><div class="analbox loading" ';
	html += 'data-id="'+data.id+'" data-type="'+data.type+'" data-extra="'+data.extra+'">';
	html += '<div class="top">';
	html += '<h2>'+data.name+'</h2>';
	html += '<div class="settings">';
	if(user_id == 1){
		html += '<button class="linksvg" onclick="showDropdownMenu($(this))">';
		html += getSVG('more');
		html += '<div class="DropdownMenuContent">';
		html += '<a onclick="loadJS(\'analytics/analytic_tools\',function(){FORM_analytic_content('+data.id+')})"'
		html += '>'+getSVG('edit')+' Add Analytic Content</a>';
		html += '<a onclick="loadJS(\'analytics/analytic_tools\',function(){FORM_analytic_table('+id+','+data.id+')})"';
		html += '>'+getSVG('edit')+' Edit Analytic Box</a>';
		html += '<hr><a onclick="delete_analytic('+id+','+data.id+', \'_tables\')">'+getSVG('delete')+' '+slovar('Delete')+'</a>';
		html += '</div>';
		html += '</button>'
	}
	html += '</div></div>';
	html += '<div class="'+ANALobj.content+'"></div>';
	html += '</div></div>';
	el.append(html);
}

function find_loading_analytic_tables(mainBox){setTimeout(function(){
	box = mainBox.find(ANALobj.box+'.loading').first();
	if(box.length == 0){ return }
	box.removeClass('loading');
	get_analytic_content(mainBox, box);
}, 200)}

function get_analytic_content(mainBox, box, data = {}){
	analytic_content_data({
		pid: box.data('id'),
		data: data,
		done: function(data){ find_analytic_content_type(mainBox, box, data) }
	})
}

function find_analytic_content_type(mainBox, box, data){
	contentBox = box.find('.'+ANALobj.content);
	contentBox.empty();
	if(data.error){
		createAlert(contentBox, 'Red', slovar('Is_empty'));
		return find_loading_analytic_tables(mainBox);
	}

	if(box.data('type') == 'TABLE'){loadJS('analytics/content/table', function(){
		HTML_ANAL_table(contentBox, data);
		return find_loading_analytic_tables(mainBox);
	})}

	if(box.data('type') == 'SUM'){loadJS('analytics/content/sum', function(){
		HTML_ANAL_sum(contentBox, data);
		return find_loading_analytic_tables(mainBox);
	})}

	if(['pie','doughnut','polarArea'].includes(box.data('type'))){loadJS('analytics/content/pie', function(){
		HTML_ANAL_pie(contentBox, data);
		return find_loading_analytic_tables(mainBox);
	})}

	if(['bar','line'].includes(box.data('type'))){loadJS('analytics/content/bar', function(){
		HTML_ANAL_bar(contentBox, data);
		return find_loading_analytic_tables(mainBox);
	})}

	if(['DATE'].includes(box.data('type'))){loadJS('analytics/content/date', function(){
		HTML_ANAL_date(contentBox, data);
		return find_loading_analytic_tables(mainBox);
	})}
}

function delete_analytic(pid, id, type = ''){
	hideDropdownMenu();
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		$.post(ANALobj.post, {
			analytics_delete:true,
			pid:pid,
			id:id,
			type:type
		}, function(data){ data = JSON.parse(data);
			if(data.error){ return createAlertPOPUP(slovar(data.error)) }
			if(type == '_table'){ return $(ANALobj.box+'[data-id='+id+']').remove() }
			return HTML_ANAL_select(ANALobj.select, function(id){ get_analytic_tables(ANALobj.main, id) })
		})
	})
}