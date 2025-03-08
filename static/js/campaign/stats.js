function stats_load(box){loadJS('calendar/extras', function(){loadJS('chart/chart', function(){
	var html = '';
	var today = new Date();
	
	html += '<div id="statstypes">';
	html += '<button class="buttonSquare button100 buttonGrey" data-type="stats">' + slovar('Global_stats') + '</button>';
	html += '<button class="buttonSquare button100 buttonGrey" data-type="stats_specific">' + slovar('Specific_stats') + '</button>';
	html += '</div>';
	html += '<div class="statsdate" id="statsdate">';
	html += '<div>';
    html += '<b onclick="stats_changeYear($(this), -1)">' + slovar('Year') + ' -</b>';
    html += '<span class="calendarYear">' + today.getFullYear() + '</span>';
    html += '<b onclick="stats_changeYear($(this), 1)">' + slovar('Year') + ' +</b>';
    html += '</div>';
    html += '<select onchange="stats_loadData()">';
    for(var i = 1; i<=12; i++){ html += '<option value="' + i + '">' + getNameOfMonth(i) + '</option>'; }
    html += '</select>';
	html += '</div>';
	html += '<div id="chartBox"></div>';
	box.html(html);
	$('#statsdate select').val(parseInt(today.getMonth() + 1));

	$('#statstypes button').click(function(){ stats_changeType($(this)); });
	stats_changeType($('#statstypes button').first());
})})}

function stats_changeYear(el, num){changeYear(el, num, function(){ stats_loadData() })}

function stats_changeType(b){
	b.parent().find('button').removeClass('buttonBlue').addClass('buttonGrey');
	b.removeClass('buttonGrey').addClass('buttonBlue');
	stats_loadData();
}

function stats_loadData(){
	var dateBox = $('#statsdate');
	var typeBox = $('#statstypes');
	var chartBox = $('#chartBox');
	var html = '';

	var type = typeBox.find('.buttonBlue').attr('data-type');

	var year = dateBox.find('.calendarYear').text();
	var month = dateBox.find('select').val();
	var day = getNumberOfDaysInMonth(year, month - 1);

	var labels = [];
	for(var i=1; i<=day; i++){ labels.push(slovar('Day') + ':' + i); }

	$.getJSON('/crm/php/campaign/stats.php?get_stats=1', {
		type: type,
		year: year,
		month: month
	}, function(data){
		if(type == 'stats'){
			html = '<div style="overflow:auto;"><div id="chartBoxMain"></div></div>';
			html += '<div id="chartBoxInner"><div class="chartBox chartBox1"></div><div class="chartBox chartBox2"></div><div class="chartBox chartBox3"></div></div>';
			chartBox.html(html);
			stats_display('line',$('#chartBoxMain'),60,stats_getData('global', day, data, labels),['modeIndex']);
			var requests = 0, unique_opens = 0, unique_clicks = 0;
			for(const [day, dayData] of Object.entries(data)){
				requests += parseInt(dayData.requests);
				unique_opens += parseInt(dayData.unique_opens);
				unique_clicks += parseInt(dayData.unique_clicks);
			}
			$('.chartBox1').html('<b>' + slovar('Requests') + '</b><span>' + requests + '</span>');
			$('.chartBox2').html('<b>' + slovar('Unique_opens') + '</b><span>' + ((unique_opens / requests) * 100).toFixed(2) + '%</span>');
			$('.chartBox3').html('<b>' + slovar('Unique_clicks') + '</b><span>' + ((unique_clicks / requests) * 100).toFixed(2) + '%</span>');
		}
		else if(type == 'stats_specific'){
			var extra = ['legendBottom','modeIndex','noX','noY','noGrid'];
			html = '<div id="chartBoxInner"><div><div id="chartBox1"></div></div><div><div id="chartBox2"></div></div></div>';
			chartBox.html(html);
			stats_display('doughnut',$('#chartBox1'),5,stats_getData('sum', day, data.geo, labels),extra);
			$('#chartBox1').parent().prepend('<h2>' + slovar('Geographical') + '</h2>');
			stats_display('doughnut',$('#chartBox2'),5,stats_getData('sum', day, data.devices, labels),extra);
			$('#chartBox2').parent().prepend('<h2>' + slovar('Devices') + '</h2>');
		}

	})
}

function stats_getData(type, day, data, labels){
	if(type == 'global'){ return stats_getData_global(day,data,labels); }
	else if(type == 'sum'){ return stats_getData_sum(data); }
}

function stats_getData_global(day, data, labels){
	var [requests,delivered,opens,unique_opens,processed,clicks,unique_clicks,bounces,invalid_emails,spam_reports,blocks,unsubscribes] = [[],[],[],[],[],[],[],[],[],[],[],[]];
	for(var d=1; d<=day; d++){
		if(data[d]){
			requests.push(data[d].requests);
			delivered.push(data[d].delivered);
			opens.push(data[d].opens);
			unique_opens.push(data[d].unique_opens);
			processed.push(data[d].processed);
			clicks.push(data[d].clicks);
			unique_clicks.push(data[d].unique_clicks);
			bounces.push(data[d].bounces);
			invalid_emails.push(data[d].invalid_emails);
			spam_reports.push(data[d].spam_reports);
			blocks.push(data[d].blocks);
			unsubscribes.push(data[d].unsubscribes);
		}else{
			requests.push(0);
			delivered.push(0);
			opens.push(0);
			unique_opens.push(0);
			processed.push(0);
			clicks.push(0);
			unique_clicks.push(0);
			bounces.push(0);
			invalid_emails.push(0);
			spam_reports.push(0);
			blocks.push(0);
			unsubscribes.push(0);
		}
	}

	var datasets = [];
	datasets.push(CHART_createDataset(slovar('Requests'), requests, 'grey', 'grey'));
	datasets.push(CHART_createDataset(slovar('Processed'), processed, 'rgb(45 112 182)', 'rgb(45 112 182)'));
	datasets.push(CHART_createDataset(slovar('Delivered'), delivered, 'greenyellow', 'greenyellow'));
	datasets.push(CHART_createDataset(slovar('Opens'), opens, 'white', 'lightgreen'));
	datasets.push(CHART_createDataset(slovar('Unique_opens'), unique_opens, 'lightgreen', 'lightgreen'));
	datasets.push(CHART_createDataset(slovar('Clicks'), clicks, 'white', 'green'));
	datasets.push(CHART_createDataset(slovar('Unique_clicks'), unique_clicks, 'green', 'green'));
	datasets.push(CHART_createDataset(slovar('Bounces'), bounces, 'white', 'orange'));
	datasets.push(CHART_createDataset(slovar('Invalid_emails'), invalid_emails, 'orange', 'orange'));
	datasets.push(CHART_createDataset(slovar('Spam_reports'), spam_reports, 'white', 'red'));
	datasets.push(CHART_createDataset(slovar('Blocks'), blocks, 'red', 'red'));
	datasets.push(CHART_createDataset(slovar('Unsubscribes'), unsubscribes, 'black', 'black'));
	return CHART_combineLabelsAndDatasets(labels, datasets);
}

function stats_getData_sum(data){if(data){
	var [labels,opens] = [[],[]];
	for(const [location, locationData] of Object.entries(data)){
		labels.push(location);
		var sum = 0;
		for(const [day, dayData] of Object.entries(locationData)){ sum += parseInt(dayData.opens); }
		opens.push(sum);
	}
	return CHART_combineLabelsAndDatasets(labels, [CHART_createDataset('', opens, CHART_createColorArray())]); 
}}

function stats_display(cType,box,h,data,extra){ CHART_get(cType,box,h,data,extra) }