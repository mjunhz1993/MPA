function HTML_ANAL_date(table, data, html = ''){
	loadJS('calendar/extras', function(){loadJS('calendar/slovar/'+slovar(), function(){
		HTML_ANAL_date_chart(table, data)
	})})
}

function HTML_ANAL_date_chart(table, data, html = ''){loadJS('chart/chart', function(){
	html += '<div class="date">';
	html += '<div class="top">';
	html += HTML_ANAL_year()+HTML_ANAL_months();
	html += '</div>';
	html += '<div class="dateChart"></div></div>';
	table.append(html);
	table.data('data',data);
	generate_analytic_date(table);
})}

function generate_analytic_date(table){
	$.post(ANALobj.post, {
		generate_analytic_date:true,
		data:table.data('data'),
		year:parseInt(table.find('.calendarYear').text()),
		month:table.find('.calendarMonth').val()
	}, function(d){ d = JSON.parse(d);
		box = table.find('.dateChart');
		box.empty();
		if(valEmpty(d[0])){ return createAlert(box, 'Red', slovar('No_data')) }
		if(d[0][0].type != 'DATETIME'){ return createAlert(box, 'Red', slovar('No_data')) }
		extra = ['modeIndex'];
		CHART_get('line', box, 150, add_dataset_date(table, d), extra);
		add_analytics_to_date(d);
	})
}

function add_dataset_date(box, data){
	return {
		labels: grab_date_labels(box),
		datasets: add_dataset_date_loop(box, data)
	}
}

function add_dataset_date_loop(box, data, hex = null, datasets = []){
	col = data[0];
	d = data[1];
	days = getNumberOfDaysInMonth(parseInt(box.find('.calendarYear').text()), box.find('.calendarMonth').val()-1);
	for(i=1; i<d[0].length; i++){
		hex = generateColorPalette(1, hex);
		datasets.push({
			label: slovar(col[i].name),
			data: grab_date_data(days, d, i),
			backgroundColor: hex,
		})
	}
	return datasets;
}

function add_analytics_to_date(data, arr = []){
	for(i=0; i<data[1].length; i++){
		d = data[1][i][0];
		d = stringToDate(d, 'UTC');
		// console.log(d.getDate(), data[1][i]);
	}
	return arr
}

function grab_date_data(days, data, i){
	values = [];
	for(j=0; j<data.length; j++){
		UTC = stringToDate(data[j][0], 'UTC');
		values[UTC.getDate()] = data[j][i];
	}

	arr = []
	for(j=1; j<=days; j++){
		value = 0;
		if(!valEmpty(values[j])){ value = values[j] }
		arr.push(value);
	}
	return arr
}

function grab_date_labels(box, arr = []){
	days = getNumberOfDaysInMonth(parseInt(box.find('.calendarYear').text()), box.find('.calendarMonth').val()-1);
	for(i=1; i<=days; i++){ arr.push(slovar('Day')+' '+i) }
	return arr;
}

// HTML

function HTML_ANAL_year(html = ''){
	html += '<div class="changeYear">';
	html += '<b onclick="changeYear($(this), -1, refresh_analytic_date($(this)))">'+slovar('Year')+' -</b>';
	html += '<span class="calendarYear">'+new Date().getFullYear()+'</span>';
	html += '<b onclick="changeYear($(this), 1, refresh_analytic_date($(this)))">'+slovar('Year')+' +</b>';
	html += '</div>';
	return html;
}

function HTML_ANAL_months(html = ''){
	thisMonth = new Date().getMonth();
	html += '<select class="calendarMonth" onchange="refresh_analytic_date($(this))">';
	for(i=1; i<=12; i++){
		html += '<option value="'+i+'" ';
		if(thisMonth == i-1){ html += 'selected' }
		html += '>'+getNameOfMonth(i)+'</option>';
	}
	html += '</select>';
	return html
}

function refresh_analytic_date(el){ generate_analytic_date(el.closest('.'+ANALobj.box)) }