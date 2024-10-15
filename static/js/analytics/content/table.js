function generate_analytic_columns(data, callback){
	$.post(ANALobj.post, {generate_analytic_columns:true, data:data}, function(data){ callback(JSON.parse(data)) })
}

function generate_analytic_rows(el, data, callback){loadJS('form/form',function(){
	box = el.closest('.'+ANALobj.box);
	$.post(ANALobj.post, {
		generate_analytic_rows:true,
		data:data,
		sort:get_sort_analytic(box),
		filter:get_filter_analytic(box),
		limit:box.find('.settings input').val()
	}, function(data){ callback(JSON.parse(data)) })
})}

function HTML_ANAL_table(table, data, html = ''){
	generate_analytic_columns(data, function(c){
		add_limit_input(table);
		table = table.find('.'+ANALobj.content);

		html += '<div class="horizontalTable"><table class="table"><thead><tr>';
		for(i=0; i<c.length; i++){
			html += HTML_ANAL_table_columns(c[i]);
		}
		html += '</tr></thead><tbody><tr class="tableFilterRow ignoreRow">';
		for(i=0; i<c.length; i++){
			html += '<td>'+HTML_ANAL_table_filters(c[i])+'</td>';
		}
		html += '</tr></tbody></table></div>';

		table.html(html);
		tooltips();
		HTML_ANAL_table_rows(data, table);
	})
}

function add_limit_input(table, html = ''){
	if(table.find('.settings input').length != 0){ return }
	html += '<label class="hideOnMobile">'+slovar('Max_rows_show')+'</label>'
	html += '<input type="number" value="100" onkeyup="if(event.keyCode==13){ refresh_analytic_content($(this)) }">';
	table.find('.settings').prepend(html);
}

function HTML_ANAL_table_columns(d, html = ''){
	if(!valEmpty(d.label)){ d.module = d.label }
	html += '<th data-module="'+d.module+'" data-column="'+d.column+'" ';
	html += 'data-type="'+d.type+'" data-list="'+d.list+'" ';
	html += 'onclick="sort_analytic($(this))"';
	html += '>'+slovar(d.name)+'</th>';
	return html;
}

function HTML_ANAL_table_filters(d, html =''){
    if(['VARCHAR','INT','DECIMAL','ID','PRICE','PERCENT'].includes(d.type)){
    	return '<input type="text" '+filter_tooltip()+' onkeyup="if(event.keyCode==13){ refresh_analytic_content($(this)) }">'
    }
    if(d.type == 'SELECT')
    {
        html += '<div class="selectMenu inputPlaceholder" data-callback="refresh_analytic_content(input)" data-list="'+d.list+'" ';
        html += 'onclick="loadJS(\'form/selectMenu\', function(el){ openSelectMenu(el); }, $(this))">';
        html += '<input type="text" name="'+d.column+'">';
        html += '<div>'+slovar('Select')+'</div></div>';
        return html
    }
    if(d.type == 'CHECKBOX'){
        html += '<select onchange="refresh_analytic_content($(this))">';
        html += '<option></option>';
        html += '<option value="1">'+slovar('Yes')+'</option>';
        html += '<option value="0">'+slovar('No')+'</option>';
        html += '</select>';
        return html
    }
    if(['DATETIME','DATE','TIME'].includes(d.type)){
    	html += '<input type="text" class="DateStartEndPickerInput" data-callback="refresh_analytic_content(input)" ';
    	html += 'onfocus="openDateStartEndPicker($(this)';
    	if(d.type == 'TIME'){ html += ', \'time\'' }
    	html += ')" ';
    	if(d.type == 'DATETIME'){ html += 'data-type="DATETIME"' }
    	html += '>';
    }
    if(d.type == 'JOIN_ADD'){
        html += '<input type="text" ';
        html += 'data-list="'+d.list+'" onfocusout="focusOutJOIN_ADDInput($(this))" ';
        html += 'autocomplete="off" style="display:none;" placeholder="'+slovar('Search')+'">';
        html += '<div class="inputPlaceholder JOIN_ADD_placeholder" data-list="'+d.list+'" ';
        html += 'onclick="focusJOIN_ADDInput($(this))">'+slovar('Search')+'</div>';
        return html
    }
    return ''
}

function filter_tooltip(html = ''){
	html += 'data-tooltip="';
	html += 'ab% = '+slovar('precent_filter_info')+'\n';
	html += 'ab_ = '+slovar('line_filter_info')
	html += '"';
	return html;
}

function HTML_ANAL_table_rows(data, el, html = ''){
	el = el.find('tbody');
	el.find('tr:not(.ignoreRow)').remove();
	generate_analytic_rows(el, data, function(r){
		for(i=0; i<r.length; i++){
			html += '<tr>';
			for(j=0; j<r[i].length; j++){ html += HTML_ANAL_table_rows_each(r[i][j], j, el); }
			html += '</tr>';
		}
		el.append(html);
		el.find('td:hidden').fadeIn('fast');
	})
}

function HTML_ANAL_table_rows_each(r, j, el, html = ''){
	col = get_anayltic_column_data(el, j+1);

	html += '<td style="display:none">';
	if(col.type == 'SELECT'){
		list = col.list.split('|');
		for(x=0; x<list.length; x++){
			l = list[x].split(',');
			if(l[0] == r){ html += slovar(l[1]); break; }
		}
	}
	else if(col.type == 'CHECKBOX'){
		if(r == '0'){ html += slovar('No') }
		else{ html += slovar('Yes') }
	}
	else if(col.type == 'PRICE'){ html += Price(r) }
	else if(col.type == 'PERCENT'){ html += Percent(r) }
	else if(col.type == 'DATETIME'){ html += getDate(defaultDateFormat + ' ' + defaultTimeFormat, stringToDate(r, 'UTC')) }
    else if(col.type == 'DATE'){ html += getDate(defaultDateFormat, r) }
    else if(col.type == 'TIME'){ html += getDate(defaultTimeFormat, r) }
	else{ html += r }
	html += '</td>';
	return html;
	// ADD COLUMN TYPES
}

// COMMON

function get_anayltic_column_data(el, i){
	return el.closest('table').find('thead th:nth-child('+i+')').data()
}

function refresh_analytic_content(el){
	box = el.closest('.'+ANALobj.box);
	id = box.data('id');
	analytic_content_get(function(data){
		HTML_ANAL_table_rows(data, box);
	}, id)
}

function sort_analytic(el){
	box = el.parent();
	box.find('th').removeClass('sorted');
	el.addClass('sorted');
	if(el.hasClass('ascending')){ el.removeClass('ascending').addClass('descending') }
	else{ el.removeClass('descending').addClass('ascending') }
	refresh_analytic_content(el);
}

function get_sort_analytic(box){
	el = box.find('.sorted');
	if(el.length == 0){ return [null,null] }
	col = el.data('module')+'.'+el.data('column');
	if(valEmpty(el.data('module'))){ col = el.data('column') }
	if(el.hasClass('ascending')){ return [col,'ASC'] }
	return [col,'DESC'];
}

function get_filter_analytic(box, arr = []){
	box.find('.tableFilterRow').find('input,select').each(function(i){
		input = $(this);
		if(valEmpty(input.val())){ return }
		col = get_anayltic_column_data(input, i+1);
		console.log(col);
		thisCol = col.module+'.'+col.column;
		if(valEmpty(col.module)){ thisCol = col.column }
		
		if(['DATETIME','DATE','TIME'].includes(col.type)){arr.push({
			type: 'custom',
			code: thisCol+' BETWEEN "'+input.val().split(',')[0]+'" AND "'+input.val().split(',')[1]+'"'
		})}
		else{arr.push({
			type: 'custom',
			code: thisCol+' LIKE "'+input.val()+'"'
		})}
		// ADD COLUMN TYPES
	});
	return arr;
}