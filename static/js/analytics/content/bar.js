function generate_analytic_bar(data, callback){
	$.post(ANALobj.post, { generate_analytic_pie:true, data:data}, function(data){ callback(JSON.parse(data)) })
}

function HTML_ANAL_bar(table, data, html = ''){generate_analytic_bar(data, function(d){
	HTML_ANAL_bar_chart(table, d)
})}

function HTML_ANAL_bar_chart(table, data){loadJS('chart/chart', function(){
	table.append('<div class="bar"></div>');
	box = table.find('.bar');
	if(valEmpty(data[0])){ return createAlert(box, 'Red', slovar('No_data')) }
	extra = ['modeIndex'];

	CHART_get(table.data('type'), box, 150, add_dataset_bar(data), extra);
})}

function add_dataset_bar(data){
	return {
		labels: grab_bar_labels(data),
		datasets: add_dataset_bar_loop(data)
	}
}

function add_dataset_bar_loop(data, hex = null, datasets = []){
	d = data[1];
	for(i=1; i<d[0].length; i++){
		hex = generateColorPalette(1, hex);
		datasets.push({
			label: slovar(data[0][i].name),
			data: grab_bar_data(d, i),
			backgroundColor: hex,
		})
	}
	return datasets;
}

function grab_bar_data(data, i, arr = []){for(j=0; j<data.length; j++){
	arr.push(data[j][i]);
} return arr }

function grab_bar_labels(data, arr = []){
	col = data[0][0];

	if(col.type == 'SELECT'){
		col.list = col.list.split('|');
	}

	for(i=0; i<data[1].length; i++){
		d = data[1][i][0];
		if(col.type == 'SELECT'){
			for(j=0; j<col.list.length; j++){
				l = col.list[j].split(',');
				if(l[0] == d){ d = slovar(l[1]) }
			}
		}
		arr.push(d);
	}

	return arr
}