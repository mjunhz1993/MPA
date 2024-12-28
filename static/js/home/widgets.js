function loadWidgets(dashboard, html = ''){
	$('#Main').append('<div id="widgetBox"></div>');
	var box = $('#widgetBox');
	$.get('/crm/php/home/widget.php?get_widgets=1', function(data){
		data = JSON.parse(data);
		for(var i=0; i<data.length; i++){
			var d = data[i];
			html += '<div data-orderNum="'+d.order_num+'" data-widgetType="'+d.type+'" data-widgetList="'+d.list+'" ';
			html += 'class="widget newWidget col'+d.width+'"></div>';
		}
		box.html(html);
		box.after(loadWidgetCreatButton(dashboard.can_add));
		checkWidgets(dashboard, box);
	});
}

function loadWidgetCreatButton(can_add){
	if(!can_add.includes(user_role_id)){ return '' }
	return '<button class="buttonSquare button100 buttonGreen" onclick="openWidgets()">' + getSVG('plus_circle') + ' <span>' + slovar('Add_widget') + '</span></button>';
}

function checkWidgets(dashboard, box){
	if(box.find('.newWidget').length == 0){ return }
	displayWidgets(dashboard, box, box.find('.newWidget').first())
}

function displayWidgets(dashboard, box, widget){
	var type = widget.attr('data-widgetType');
	var list = widget.attr('data-widgetList');

	if(type == 'MODULE'){
		loadJS('table/table', function(){
			var l = list.split(',');
			GET_module({
	            module:l[0],
	            done: function(moduleData){
	            	var html = '<div class="box tableBox col100" data-module="' + l[0] + '" ';
	            	if(moduleData.can_add.includes(user_role_id)){ html += 'data-button="add"' }
	            	html += '>';
					html += '<div class="horizontalTable" style="max-height:60vh"></div></div>';
					widget.html(html);
					tableLoadColumns(widget.find('.tableBox'), function(){
						widget.find('.tableTop td:last-child').prepend('<h2>' + slovar(l[1]) + '</h2>')
					});
					configDisplayedWidget(dashboard, box, widget);
	            }
	        });
		})
	}
	else if(type == 'CALENDAR'){
		loadJS('calendar/calendar', function(){
			widget.html('<div class="calendarBox"></div>');
			setupCalendar(widget.find('.calendarBox'), {
				module:'event',
                start:'event_start_date',
                end:'event_end_date',
                color:'event_color',
                assigned:'event_assigned',
                share:'event_share',
			});
			configDisplayedWidget(dashboard, box, widget);
		})
	}
	else if(type == 'ANALYTICS'){
		loadJS('analytics/analytics', function(){
			widget.html('<div id="analytics_main"></div>');
			analytics($('#analytics_main'));
		})
	}
}

function configDisplayedWidget(dashboard, box, widget){
	if(dashboard.can_delete.includes(user_role_id)){
		if($('.hoverTool').length == 0){ $('#Main').append('<div class="hoverTool linksvg" style="display:none">' + getSVG('x') + '</div>') }
		var ht = $('.hoverTool');
		widget.on('mouseover', function(){
			ht.css({
				'top':$(this).offset().top - ht.outerHeight(),
				'left':$(this).offset().left + ($(this).outerWidth() - ht.outerWidth() - 10)
			}).show();
			ht.unbind('click').click(function(){ deleteWidget(widget) });
		})
	}

	widget.removeClass('newWidget');
	setTimeout(function(){ checkWidgets(dashboard, box) }, 1000)
}

// ------ ADD

function openWidgets(){
	var popup = createPOPUPbox();
	var box = popup.find('.popupBox');
	var html = '';

	html += '<h2>' + slovar('Add_widget') + '</h2><form>';
	html += '<select name="type" onchange="changeWidget($(this))">';
	html += '<option value=""></option>';
	html += '<option value="MODULE">' + slovar('Module') + '</option>';
	html += '<option value="CALENDAR">' + slovar('Calendar') + '</option>';
	html += '<option value="ANALYTICS">' + slovar('Analytics') + '</option>';
	html += '</select>';
	html += '<div id="widgetExtra"></div>';
	html += '</form>';

	box.append(html + '<hr><button class="button buttonGreen" onclick="addWidget()">' + slovar('Add_new') + '</button>');
    box.append('<button class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Close') + '</button>');
    $('input[name=csrf_token]').clone().appendTo(box.find('form'));
    if(user_id == 1){ openWidgets_admin(box.find('form')) }

	popup.fadeIn('fast');
}

function openWidgets_admin(form){
	$.get('/crm/php/main/module.php?get_all_users=1', function(data){
        data = JSON.parse(data);
        var html = '';
        html += '<select name="user_assing">';
        for(var i=0; i<data.length; i++){
            html += '<option value="' + data[i].user_id + '">' + data[i].user_username + '</option>';
        }
        html += '</select>';
        form.prepend(html);
    }).fail(function(){console.log('ERROR: backend napaka');});
}

function changeWidget(el){
	var box = $('#widgetExtra');
	var html = '';
	if(el.val() == 'MODULE'){loadJS('GET/module', function(){
		GET_module({
			each: function(module){
				var v = module.can_view;
            	var e = module.can_edit;
            	var d = module.can_delete;
            	if(!v.includes(user_role_id) && !e.includes(user_role_id) && !d.includes(user_role_id)){ return }
                if(module.active && (module.url == '' || module.url == null)){
                	html += '<option value="' + module.module + '">' + slovar(module.name) + '</option>';
                }
			},
			done: function(){ box.html('<select name="list">' + html + '</select>') }
		})
	})}
	else{ box.html('') }
}

function addWidget(){
	var form = $('#popupBox form');
	form.find('.alert').remove();
	$.post('/crm/php/home/widget.php?add_widget=1', form.serialize(), function(data){
        data = JSON.parse(data);
        if(data.error){ createAlert(form, 'Red', data.error); }
        else{ location.reload(); }
    }).fail(function(data){ console.log(data); });
}

function deleteWidget(widget){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		$.post('/crm/php/home/widget.php?delete_widget=1', {
			csrf_token: $('input[name=csrf_token]').val(),
			order_num: widget.attr('data-orderNum')
		}, function(data){
			data = JSON.parse(data);
			if(data.error){ createAlert(widget, 'Red', data.error); }
			else{ location.reload(); }
		}).fail(function(data){ console.log(data); });
	});
}