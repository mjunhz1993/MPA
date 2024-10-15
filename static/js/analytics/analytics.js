ANALobj = {
	'post' : '/crm/php/analytics/exec.php',
	'select': 'anal_select',
	'main': 'anal_main',
	'box': 'analbox',
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

function analytics(box = $('#Main'), html = ''){analytics_connect(function(){
	html += '<table class="h1_table"><tr>'
	html += '<td><h1>'+slovar('Analytics')+'</h1></td>';
	html += '<td>';
	if(user_id == 1){
		html += '<button class="buttonSquare buttonGreen" ';
		html += 'onclick="loadJS(\'analytics/analytic_tools\',function(){FORM_analytic()})">'+slovar('Add_analytic')+'</button>';
	}
	html += '<select id="'+ANALobj.select+'"></select>'
	html += '</td>'
	html += '</tr></table>';
	html += '<div id="'+ANALobj.main+'"></div>';
	box.html(html);
	HTML_ANAL_select('#'+ANALobj.select, function(id){ get_analytic_tables('#'+ANALobj.main, id) });
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
		$('#'+ANALobj.select).change(function(){ callback($(this).val()) });
		callback($('#'+ANALobj.select).val())
	})
}

function get_analytic_tables(el, id){
	el = $(el);
	el.empty();
	analytic_tables_get(function(data){
		if(data.error){ return createAlert(el, 'Red', slovar('Is_empty')) }
		HTML_ANAL_tools(el, id);
		el.append('<div id="anal_box"></div>');
		el = $('#anal_box');
		for(var i=0; i<data.length; i++){ HTML_ANAL_tables(el, id, data[i]) }
		resetDropdownMenuConfig();
		find_loading_analytic_tables(el);
	}, id)
}

function HTML_ANAL_tools(el, id, html = ''){
	if(user_id != 1){ return }
	html += '<div id="anal_tools">';
	html += '<div>';
	html += '<button ';
	html += 'onclick="loadJS(\'analytics/analytic_tools\',function(){FORM_analytic_table('+id+')})" ';
	html += 'class="button buttonGreen">'+slovar('Add_analytic_table')+'</button>';
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
	html += '<div class="col col'+data.width+'"><div class="'+ANALobj.box+' loading" ';
	html += 'data-id="'+data.id+'" data-type="'+data.type+'">';
	html += '<div class="top">';
	html += '<h2>'+data.name+'</h2>';
	html += '<div class="settings">';
	if(user_id == 1){
		html += '<button class="linksvg" onclick="showDropdownMenu($(this))">';
		html += getSVG('more');
		html += '<div class="DropdownMenuContent">';
		html += '<a onclick="loadJS(\'analytics/analytic_tools\',function(){FORM_analytic_content('+id+','+data.id+')})"'
		html += '>'+getSVG('edit')+' '+slovar('Generate_analytic_content')+'</a>';
		html += '<a onclick="loadJS(\'analytics/analytic_tools\',function(){FORM_analytic_table('+id+','+data.id+')})"';
		html += '>'+getSVG('edit')+' '+slovar('Edit_analytic_table')+'</a>';
		html += '<hr><a onclick="delete_analytic('+id+','+data.id+', \'_tables\')">'+getSVG('delete')+' '+slovar('Delete')+'</a>';
		html += '</div>';
		html += '</button>'
	}
	html += '</div></div>';
	html += '<div class="'+ANALobj.content+'"></div>';
	html += '</div></div>';
	el.append(html);
}

function find_loading_analytic_tables(el){
	table = el.find('.'+ANALobj.box+'.loading').first();
	if(table.length == 0){ return }
	table.removeClass('loading');
	get_analytic_content(el, table);
}

function get_analytic_content(el, table){
	analytic_content_get(function(data){
		if(data.error){
			createAlert(table, 'Red', slovar('Is_empty'));
			return find_loading_analytic_tables(el);
		}

		if(table.data('type') == 'TABLE'){loadJS('analytics/content/table', function(){
			HTML_ANAL_table(table, data);
			return find_loading_analytic_tables(el);
		})}

		if(table.data('type') == 'SUM'){loadJS('analytics/content/sum', function(){
			HTML_ANAL_sum(table, data);
			return find_loading_analytic_tables(el);
		})}

		if(['pie','doughnut','polarArea'].includes(table.data('type'))){loadJS('analytics/content/pie', function(){
			HTML_ANAL_pie(table, data);
			return find_loading_analytic_tables(el);
		})}

		if(['bar','line'].includes(table.data('type'))){loadJS('analytics/content/bar', function(){
			HTML_ANAL_bar(table, data);
			return find_loading_analytic_tables(el);
		})}

		if(['DATE'].includes(table.data('type'))){loadJS('analytics/content/date', function(){
			HTML_ANAL_date(table, data);
			return find_loading_analytic_tables(el);
		})}

	}, table.data('id'))
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
			if(type == '_table'){ return $('.'+ANALobj.box+'[data-id='+id+']').remove() }
			return HTML_ANAL_select('#'+ANALobj.select, function(id){ get_analytic_tables('#'+ANALobj.main, id) })
		})
	})
}

// COMMON

function HTML_tabs(data, html = ''){
    html += '<div class="tabs">';
    for(var i = 0; i < data.a.length; i++){
        html += '<a ';
        if(typeof data.a[i].href !== "undefined"){ html += 'href="' + data.a[i].href + '" ' }
        if(typeof data.a[i].class !== "undefined"){ html += 'class="' + data.a[i].class + '" ' }
        if(typeof data.a[i].blank !== "undefined"){ html += 'target="_blank" ' }
        if(typeof data.a[i].onclick !== "undefined"){ html += 'onclick="' + data.a[i].onclick + '"' }
        html += '>';
        if(typeof data.a[i].name !== "undefined"){ html += slovar(data.a[i].name) }
        html += '</a>';
    }
    html += '</div>';
    return html;
}