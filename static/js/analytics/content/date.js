function HTML_ANAL_date(content, extraData, data){
	loadJS('calendar/extras', function(){loadJS('calendar/slovar/'+slovar(), function(){
		HTML_ANAL_date_chart(content, extraData, data)
	})})
}

function HTML_ANAL_date_chart(content, extraData, data){loadJS('chart/chart', function(){
	thisBox = content.closest(ANALobj.box);
	content.append(`
		<div class="date">
			<div class="top">
				${HTML_ANAL_year()}
				${extraData.includes('month') ? '' : HTML_ANAL_months()}
			</div>
		<div class="dateChart"></div></div>
	`);
	generate_analytic_date(thisBox, content, extraData, data);
})}

function generate_analytic_date(thisBox, content, extraData, data){
	data = analytic_date_to_UTC(data, extraData);

	dateChart = thisBox.find('.dateChart');
	dateChart.empty();

	extra = ['modeIndex'];
	if(extraData.includes('price')){ extra.push('PRICE') }
	if(extraData.includes('percent')){ extra.push('PERCENT') }
	CHART_get('line', dateChart, 150, add_dataset_date(thisBox, extraData, data), extra);
}

function analytic_date_to_UTC(data, extraData){
	if(data.length == 0){ return [] }
	const dateKey = Object.keys(data[0])[0]
	return data.map(item => {
	    const localDate = new Date(item[dateKey] + "Z");
	    let thisData = extraData.includes('month') 
	    ? localDate.getUTCMonth() + 1 
	    : String(localDate.getUTCDate()).padStart(2, '0');
	    return {
	        ...item,
	        [dateKey]: parseInt(thisData)
	    };
	});
}

function add_dataset_date(thisBox, extraData, data){
	return {
		labels: grab_date_labels(thisBox, extraData),
		datasets: loop_dataset_date(thisBox, extraData, data)
	}
}

function grab_date_labels(thisBox, extraData, arr = []){
	thisLoop = get_bottom_date_loop(thisBox, extraData);
	for(i=1; i<=thisLoop; i++){
		if(extraData.includes('month')){ arr.push(getNameOfMonth(i)); continue }
		arr.push(slovar('Day')+' '+i);
	}
	return arr;
}

function loop_dataset_date(thisBox, extraData, data, loop = []){
	if(data.length == 0){ return [] }
	thisLoop = get_bottom_date_loop(thisBox, extraData);
	col = Object.keys(data[0]);
	col.shift();
	st = 1;
	colorPalette = generateColorPalette(data.length);
	col.forEach((item) => {
		loop.push({
			label: item,
			data: loop_dataset_date_data(data, item, thisLoop),
			backgroundColor: colorPalette[st],
		})
		st++;
	})
	return loop
}

function get_bottom_date_loop(thisBox, extraData){
	if(extraData.includes('month')){ return 12 }
	return getNumberOfDaysInMonth(parseInt(thisBox.find('.calendarYear').text()), thisBox.find('.calendarMonth').val()-1);
}

function loop_dataset_date_data(data, item, thisLoop, arr = []){ console.log(data);
	const dayKey = Object.keys(data[0])[0];
	for(i=1; i<=thisLoop; i++){
		const entry = data.find(item => item[dayKey] === i);
    	const num = entry ? entry[item] : 0; console.log(num);
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
			generate_analytic_date(
				thisBox, 
				thisBox.find('.'+ANALobj.content), 
				thisBox.data('extra').split('|'), 
				thisData
			) 
		}
	});
}, 100)}