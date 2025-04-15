ANALobj = {
	'post' : '/crm/php/analytics/exec',
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

function analytics(box = $('#Main'), d = {}){analytics_connect(function(){
	box.html(`
	${HTML_add_analytic_top(d)}
	<div id="anal_main"></div>
	`);
	if(!valEmpty(d.id)){ return get_analytic_tables($(ANALobj.main), d.id, d) }
	HTML_ANAL_select($(ANALobj.select), function(id){
		get_analytic_tables($(ANALobj.main), id)
	});
})}

function HTML_add_analytic_top(d){
	if(!valEmpty(d.id)){ return '' }
	return `
		<div class="analytics_top">
			<h2>${slovar('Analytics')}</h2>
			<div>
				${HTML_add_analytic_button()}
				<select id="anal_select"></select>
			</div>
		</div>
	`
}

function HTML_add_analytic_button(){
	if(user_id != 1){ return '' }
	return `
		<button 
		class="buttonSquare buttonGreen"
		onclick="loadJS('analytics/analytic_tools',()=>FORM_analytic())"
		>Add Analytic</button>
	`
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
		el.html(html);
		el.unbind('change').change(function(){ console.log($(this).val()); callback($(this).val()) });
		callback(el.val())
	})
}

function get_analytic_tables(mainBox, id, d = {}){
	mainBox.empty().data('id', parseInt(id));
	analytic_tables_get(function(data){
		if(data.error){ return createAlert(mainBox, 'Red', slovar('Is_empty')) }
		HTML_ANAL_tools(mainBox, id, d);
		mainBox.append('<div id="anal_box"></div>');
		mainBox = $('#anal_box');
		for(var i=0; i<data.length; i++){ HTML_ANAL_tables(mainBox, id, data[i], d) }
		setTimeout(()=>{ resize_analytic_box() }, 1500);
		resetDropdownMenuConfig();
		find_loading_analytic_tables(mainBox);
	}, id)
}

function HTML_ANAL_tools(el, id, d, html = ''){
	if(user_id != 1 || !valEmpty(d.id)){ return }
	el.html(`
	<div id="anal_tools">
		<div>
			<button 
			onclick="loadJS('analytics/analytic_tools',()=>FORM_analytic_table(${id}))" 
			class="button buttonGreen"
			>Add Analytic Box</button>
		</div>
		<div>
			<a 
			class="linksvg" 
			onclick="loadJS('analytics/analytic_tools',()=>FORM_analytic(${id}))"
			>
				${getSVG('edit')}
				<span>${slovar('Edit')}</span>
			</a>
			<a class="linksvg" onclick="delete_analytic(${id},${id})">${getSVG('delete')}</a>
		</div>
	</div>
	`);
}

function check_analytic_table_category(el, category){
	if(el.find('legend[data-category="'+category+'"]').length == 1){ return }
	el.append('<fieldset><legend data-category="'+category+'">'+category+'</legend></fieldset>');
	el.find('legend').last().click(function(){
		$(this).parent().children().not($(this)).toggle();
	})
}

function HTML_ANAL_tables(el, id, data, d = {}) {
    check_analytic_table_category(el, data.category);
    el = el.find(`legend[data-category="${data.category}"]`).parent();
    el.append(`
    <div class="col" style="width:${data.width}%">
    	<div class="analbox loading" data-id="${data.id}" data-type="${data.type}" data-extra="${data.extra}">
            <div class="top">
                <h2>${data.name}</h2>
                <div class="settings">
                	${HTML_ANAL_dropdown(id, data, d)}
                </div>
            </div>
            <div class="${ANALobj.content}"></div>
        </div>
    </div>
    `);
}

function HTML_ANAL_dropdown(id, data, d){
	if(user_id != 1 || !valEmpty(d.id)){ return '' }
	return `
	<button class="linksvg" onclick="showDropdownMenu($(this))">
	    ${getSVG('more')}
	    <div class="DropdownMenuContent">
	        <a onclick="loadJS('analytics/analytic_tools', () => FORM_analytic_content(${data.id}))">${getSVG('edit')} Add Analytic Content</a>
	        <a onclick="loadJS('analytics/analytic_tools', () => FORM_analytic_table(${id}, ${data.id}))">${getSVG('edit')} Edit Analytic Box</a>
	        <hr>
	        <a class="red" onclick="delete_analytic(${id}, ${data.id}, '_tables')">${getSVG('delete')} ${slovar('Delete')}</a>
	    </div>
	</button>`
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
	extra = box.data('extra') ? box.data('extra').split('|') : [];
	contentBox = box.find('.'+ANALobj.content);
	contentBox.empty();
	if(data.error){
		createAlert(contentBox, 'Red', slovar(data.error));
		return find_loading_analytic_tables(mainBox);
	}

	if(box.data('type') == 'TABLE'){loadJS('analytics/content/table', function(){
		HTML_ANAL_table(contentBox, extra, data);
		return find_loading_analytic_tables(mainBox);
	})}

	if(box.data('type') == 'SUM'){loadJS('analytics/content/sum', function(){
		HTML_ANAL_sum(contentBox, extra, data);
		return find_loading_analytic_tables(mainBox);
	})}

	if(['pie','doughnut','polarArea'].includes(box.data('type'))){loadJS('analytics/content/pie', function(){
		HTML_ANAL_pie(contentBox, extra, data);
		return find_loading_analytic_tables(mainBox);
	})}

	if(['bar','line'].includes(box.data('type'))){loadJS('analytics/content/bar', function(){
		HTML_ANAL_bar(contentBox, extra, data);
		return find_loading_analytic_tables(mainBox);
	})}

	if(['DATE'].includes(box.data('type'))){loadJS('analytics/content/date', function(){
		HTML_ANAL_date(contentBox, extra, data);
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
			return HTML_ANAL_select($(ANALobj.select), function(id){ get_analytic_tables($(ANALobj.main), id) })
		})
	})
}

// EXTRA

function resize_analytic_box(){loadJS('API/resize', function(){
	resizeBox({
		box: $('#anal_box .col'),
		percentage: true,
		callback: function(el, w){
			$.post(ANALobj.post, {
	            update_width_of_analytic_table: true,
	            width: w,
	            id: el.find(ANALobj.box).data('id'),
	            pid: el.closest(ANALobj.main).data('id')
	        }, function(thisData){
	        	thisData = JSON.parse(thisData);
	        	if(thisData.error){
	        		console.log(thisData.error);
	        	}
	        });
		}
	})
})}