function HTML_ANAL_date(content, data, html = ''){
	loadJS('calendar/extras', function(){loadJS('calendar/slovar/'+slovar(), function(){
		HTML_ANAL_date_chart(content, data)
	})})
}

function HTML_ANAL_date_chart(content, data){loadJS('chart/chart', function(){
	thisBox = content.closest(ANALobj.box);
	content.append(`
		<div class="date">
			<div class="top">
				${HTML_ANAL_year()+HTML_ANAL_months()}
			</div>
		<div class="dateChart"></div></div>
	`);
	generate_analytic_date(thisBox, content, data);
})}

function generate_analytic_date(thisBox, content, data){
	data = analytic_date_to_UTC(data);

	dateChart = thisBox.find('.dateChart');
	dateChart.empty();

	extra = ['modeIndex'];
	if(thisBox.data('extra') === 'price'){ extra.push('PRICE') }
	if(thisBox.data('extra') === 'percent'){ extra.push('PERCENT') }
	CHART_get('line', dateChart, 150, add_dataset_date(thisBox, data), extra);
}

function analytic_date_to_UTC(data){
	const dayKey = Object.keys(data[0])[0]
	return data.map(item => {
	    const localDate = new Date(item[dayKey] + "Z");
	    const dayOnly = String(localDate.getUTCDate()).padStart(2, '0');
	    return {
	        ...item,
	        [dayKey]: parseInt(dayOnly)
	    };
	});
}

function add_dataset_date(thisBox, data){
	return {
		labels: grab_date_labels(thisBox),
		datasets: loop_dataset_date(thisBox, data)
	}
}

function grab_date_labels(thisBox, arr = []){
	days = getNumberOfDaysInMonth(parseInt(thisBox.find('.calendarYear').text()), thisBox.find('.calendarMonth').val()-1);
	for(i=1; i<=days; i++){ arr.push(slovar('Day')+' '+i) }
	return arr;
}

function loop_dataset_date(thisBox, data, loop = []){
	days = getNumberOfDaysInMonth(parseInt(thisBox.find('.calendarYear').text()), thisBox.find('.calendarMonth').val()-1);
	col = Object.keys(data[0]);
	col.shift();
	st = 1;
	colorPalette = generateColorPalette(data.length);
	col.forEach((item) => {
		loop.push({
			label: item,
			data: loop_dataset_date_days(data, item, days),
			backgroundColor: colorPalette[st],
		})
		st++;
	})
	return loop
}

function loop_dataset_date_days(data, item, days, arr = []){
	const dayKey = Object.keys(data[0])[0]
	for(i=1; i<=days; i++){
		const entry = data.find(item => item[dayKey] === i);
    	const num = entry ? entry[item] : 0;
    	arr.push(num);
	}
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

function refresh_analytic_date(el){ load_new_date_analytic(el.closest(ANALobj.box)) }

function load_new_date_analytic(thisBox){setTimeout(function(){
	year = parseInt(thisBox.find('.calendarYear').text());
	month = parseInt(thisBox.find('.calendarMonth').val());
	analytic_content_data({
		pid: thisBox.data('id'),
		data: {
			year:year,
			month:month
		},
		done: function(thisData){
			generate_analytic_date(thisBox, thisBox.find('.'+ANALobj.content), thisData) 
		}
	});
}, 100)}