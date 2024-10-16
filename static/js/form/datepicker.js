function checkForDatePickerInputs(box){
    loadCSS('datepicker');
    var value = '';

	if(box.find('.datepickerinput').length > 0){box.find('.datepickerinput').each(function(){
		if($(this).val() != ''){ value = getDate(defaultDateFormat, $(this).val()) }else{ value = slovar('Empty') }
		$(this).hide().wrap('<div class="inputPlaceholder"></div>').after('<div>' + getSVG('calendar') + '<span>' + value + '</span></div>');
		$(this).parent().click(function(){ createDatePickerInput($(this)); });
	})}
    
    if(box.find('.timepickerinput').length > 0){box.find('.timepickerinput').each(function(){
    	if($(this).val() != ''){ value = getDate(defaultTimeFormat, $(this).val()) }else{ value = slovar('Empty') }
		$(this).hide().wrap('<div class="inputPlaceholder"></div>').after('<div>' + getSVG('clock') + '<span>' + value + '</span></div>');
		$(this).parent().click(function(){ createDatePickerInput($(this)); });
	})}

    if(box.find('.datetimepickerinput').length > 0){box.find('.datetimepickerinput').each(function(){
    	if($(this).val() != ''){ value = getDate(defaultDateFormat + ' ' + defaultTimeFormat, $(this).val()) }else{ value = slovar('Empty') }
    	$(this).hide().wrap('<div class="inputPlaceholder"></div>').after('<div>' + getSVG('calendar') + '<span>' + value + '</span></div>');
        $(this).parent().click(function(){ createDatePickerInput($(this)); });
    })}
}

function createDatePickerInput(el){loadJS('calendar/extras', function(){setTimeout(function(){
	var input = el.find('input');
	var dropdownMenu = $('#DropdownMenu');
	if(input.val() != ''){ var today = stringToDate(input.val()) }else{ var today = new Date() }
	checkDatePickerTypeInput(el, input, dropdownMenu, today);
}, 100)})}

function checkDatePickerTypeInput(el, input, dropdownMenu, today){
	dropdownMenu.html('');
	if(input.hasClass('datetimepickerinput')){
		displayDatePickerInputDate(el, input, dropdownMenu, today);
		displayDatePickerInputTime(el, input, dropdownMenu, today);
	}
	else if(input.hasClass('datepickerinput')){
		displayDatePickerInputDate(el, input, dropdownMenu, today)
		dropdownMenu.append('<button class="buttonSquare button100 buttonBlue">' + slovar('Save_changes') + '</button>');
	}
	else if(input.hasClass('timepickerinput')){ displayDatePickerInputTime(el, input, dropdownMenu, today) }
	dropdownMenu.prepend('<input type="hidden" value="' + input.attr('id') + '">');
	if(input.attr('data-list') != undefined){ dropdownMenu.find('input[type="hidden"]').attr('data-list', input.attr('data-list')) }
	dropdownMenu.find('.buttonBlue').click(function(){ submitDatePickerInput(el, dropdownMenu) });
	alignDropdownMenu(el, dropdownMenu);
}

function displayDatePickerInputDate(el, input, dropdownMenu, today){
	var html = '<div id="datepickerDM">';
	html += '<div class="datepickerDMinner"><div>';
	html += '<b onclick="DPchangeYear($(this), -1)">' + slovar('Year') + ' -</b>';
    html += '<span class="calendarYear">' + today.getFullYear() + '</span>';
    html += '<b onclick="DPchangeYear($(this), 1)">' + slovar('Year') + ' +</b>';
    html += '</div><div>';
    html += '<select onchange="DPdate()">';
    for(var i = 1; i<=12; i++){
    	html += '<option value="' + i + '" ';
    	if(i == today.getMonth() + 1){ html += 'selected'; }
    	html += '>' + getNameOfMonth(i) + '</option>';
    }
    html += '</select>';
    html += '</div></div>';
	html += '<table><thead>' + displayWeek() + '</thead><tbody></tbody></table></div>';
	dropdownMenu.append(html);
	DPdate(el);
	dropdownMenu.find('td').removeClass('act');
	var thisDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
	dropdownMenu.find('td[data-date="' + thisDate + '"]').addClass('act');
}

function DPchangeYear(el, num){changeYear(el, num, function(){ DPdate() })}

function DPdate(el){
	var box = $('#DropdownMenu');
	box.find('tbody').html(displayDaysInMonth(box.find('.calendarYear').text(), box.find('select').val()));
	box.find('td').first().addClass('act');
	box.find('td').click(function(){ DatePickerSelectDate(el, box, $(this)) });
}

function DatePickerSelectDate(el, box, thisDay){
	if(thisDay.hasClass('act')){ submitDatePickerInput(el, box) }
	box.find('td').removeClass('act');
	thisDay.addClass('act');
}

function displayDatePickerInputTime(el, input, dropdownMenu, today){
	var h, m;
	var html = '<div id="timepickerDM">';
	html += '<div>' + getSVG('clock');
	if(hasLocalTimeInput){
		h = String(today.getHours()).padStart(2, '0');
		m = String(today.getMinutes()).padStart(2, '0');
		html += '<input type="time" value="' + h + ':' + m + '">';
	}
	else{
		html += '<select>';
	    for(var i = 0; i<=23; i++){ h = String(i).padStart(2, '0');
	    	html += '<option ';
	    	if(i == today.getHours()){ html += 'selected'; }
	    	html += '>' + h + '</option>';
	    }
	    html += '</select>';
	    html += '<b>:</b>';
	    html += '<select>';
	    for(var i = 0; i<=59; i++){ m = String(i).padStart(2, '0');
	    	html += '<option ';
	    	if(i == today.getMinutes()){ html += 'selected'; }
	    	html += '>' + m + '</option>';
	    }
	    html += '</select>';
	}
	html += '</div><button class="button buttonBlue">' + slovar('Save_changes') + '</button></div>';
	dropdownMenu.append(html);
}

function submitDatePickerInput(el, box){
	var hidden = box.find('input[type="hidden"]');
	var input = $('#'+hidden.val());
	var value = [];
	if(box.find('#datepickerDM').length == 1){
		value.push(box.find('td.act').attr('data-date'));
	}
	if(box.find('#timepickerDM').length == 1){
		if(hasLocalTimeInput){
			var t = $('#timepickerDM input[type="time"]').val();
			if(t == ''){ t = '00:00' }
			value.push(t + ':00');
		}
		else{ value.push($('#timepickerDM select').first().val() + ':' + $('#timepickerDM select').last().val() + ':00') }
	}
	value = value.join(' ');
	if(hidden.attr('data-list') != undefined){if(!checkOtherDatePickerValue(el, hidden, value)){ return }}
	input.val(value);
	resetDatePickerInput(input);
	hideDropdownMenu();
}

function checkOtherDatePickerValue(el, hidden, value){
	var box = el.closest('form');
	var list = hidden.attr('data-list').split(',');
	var thisDate = stringToDate(value);
	var otherDateInput = $('input[name="' + list[1] + '"]').first();
	var otherDateVal = stringToDate(otherDateInput.val());
	if(list[0] == 'min' && thisDate > otherDateVal){
		otherDateInput.val(value);
		resetDatePickerInputs(box);
	}
	else if(list[0] == 'max' && thisDate < otherDateVal){
		otherDateInput.val(value);
		resetDatePickerInputs(box);
	}
	return true
}

function resetDatePickerInputs(box){box.find('.datepickerinput,.timepickerinput,.datetimepickerinput').each(function(){resetDatePickerInput($(this))})}
function resetDatePickerInput(input){
	var t = '';
	if(input.hasClass('datetimepickerinput')){ t = getDate(defaultDateFormat + ' ' + defaultTimeFormat, input.val()) }
	else if(input.hasClass('datepickerinput')){ t = getDate(defaultDateFormat, input.val()) }
	else if(input.hasClass('timepickerinput')){ t = getDate(defaultTimeFormat, input.val()) }
	input.next('div').find('span').text(t)
}

// ------------ EXTRA

function ifLocalTimeInput(){
	var input = document.createElement('input');
	input.setAttribute('type','time');
	var notADateValue = 'not:time';
	input.setAttribute('value', notADateValue); 
	return (input.value !== notADateValue);
}

var hasLocalTimeInput = ifLocalTimeInput();