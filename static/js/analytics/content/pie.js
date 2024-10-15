function generate_analytic_pie(data, callback){
	$.post(ANALobj.post, { generate_analytic_pie:true, data:data}, function(data){ callback(JSON.parse(data)) })
}

function HTML_ANAL_pie(table, data, html = ''){generate_analytic_pie(data, function(d){
	HTML_ANAL_pie_chart(table, d)
})}

function HTML_ANAL_pie_chart(table, data){loadJS('chart/chart', function(){
	table.append('<div class="pie"></div>');
	box = table.find('.pie');
	if(valEmpty(data[0])){ return createAlert(box, 'Red', slovar('No_data')) }
	extra = ['noX','noY','noGrid'];
	if(data[0].type == 'PRICE'){ extra.push('PRICE') }
	if(data[0].type == 'PERCENT'){ extra.push('PERCENT') }
	CHART_get(table.data('type'), box, 50, add_dataset_pie(data), extra);
})}

function add_dataset_pie(data){
	return {
		labels: grab_pie_labels(data),
		datasets: [
			{
				label: 'Dataset',
				data: grab_pie_data(data[1]),
				backgroundColor: generateColorPalette(data[1].length),
			}
		]
	}
}

function grab_pie_labels(data, arr = []){
	col = data[0];

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

function grab_pie_data(data, arr = []){for(i=0; i<data.length; i++){
	arr.push(data[i][1]);
} return arr }