function generate_analytic_sum(data, callback){
	$.post(ANALobj.post, {generate_analytic_sum:true, data:data}, function(data){ callback(JSON.parse(data)) })
}

function HTML_ANAL_sum(table, data, html = ''){generate_analytic_sum(data, function(d){ console.log(d);
	table.find('.analSum').remove();
	html += '<div class="analSum">';
	if(d.type == 'PRICE'){ html += Price(d.value) }
	else if(d.type == 'PERCENT'){ html += Percent(d.value) }
	else{ html += d.value }
	html += '</div>'
	table.append(html);
})}