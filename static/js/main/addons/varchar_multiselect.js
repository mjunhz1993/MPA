function ADDON_varchar_multiselect(module, box, type, addon, i){
	if(!['ADD','EDIT'].includes(type)){ return }
	createMultiSelectInput(box.find('[name="' + addon[1] + '"]'), addon[2])
}

function createMultiSelectInput(el, module){
	if(el.length == 0){ return }
	el.hide();
	var id = el.attr('id');
	var html = '<div class="multiselectinput"></div>';
	el.after(html);
	var placeholder = el.next();
	html = '';

	if(el.val() != ''){
		var options = el.val().split('|');
		for(var i=0; i<options.length; i++){
			var o = options[i].split(';');
			if(valEmpty(o[0])){ continue }
			html += '<div class="multiselectinputbox" data-id="' + o[0] + '"><span>' + o[1] + '</span><b onclick="removeMultiSelectOption($(this))">x</b></div>';
		}
	}
	html += '<div class="buttonSquare buttonGreen" onclick="openMultiSelectDropdownMenu($(this), \'' + module + '\')">' + slovar('Add_new');
	html += '<div class="DropdownMenuContent"><div style="max-width:200px;">';
	html += '<input type="text" class="DropdownMenuSearchBox" placeholder="' + slovar('Search') + '" onkeyup="search_multiselect($(this), \'' + module + '\')">';
	html += '<div class="DropdownMenuMultiSelectBox" data-id="' + id + '"></div>';
	html += '</div></div>';
	html += '</div>';
	placeholder.html(html);
	resetDropdownMenuConfig();
}

function openMultiSelectDropdownMenu(el, module){
	showDropdownMenu(el, true);
	$('#DropdownMenu').width
	$('#DropdownMenu .DropdownMenuSearchBox').focus();
	search_multiselect($('#DropdownMenu .DropdownMenuSearchBox'), module);
}

function search_multiselect(el, module){
	var box = el.next();
	box.html('<div class="loading20"></div>');
	dropdownMenuDelay(function(){
		GET_row({
			module:module,
			dropdownMenu:true,
			dropdownMenu_search_value:el.val(),
			done: function(data){
				var html = '<table id="DropdownMenuSelectTable"></table>';
	            box.html(html);
	            loadJS('table/table', function(){
	                tableAddLoaded(module, box.find('#DropdownMenuSelectTable'), data, function(){
	                	$('#DropdownMenuSelectTable tr').unbind().mousedown(function(){ selectMultiSelectOption($(this)) });
	                });
	            });
			}
		})
    }, 600);
}

function selectMultiSelectOption(el){
	var id = el.attr('data-id');
	var input = $('#' + el.closest('.DropdownMenuMultiSelectBox').attr('data-id'));
    var value = input.val();
    if(value != ''){ value = value.split('|').filter(n => n); }
    else{ value = []; }
    var placeholder = input.next();
	var arr = [];
    el.find('td').each(function(){ arr.push($(this).text()); });
    value.push(id + ';' + arr.join(' - '));
    input.val('|'+value.join('|')+'|');
    var html = '<div class="multiselectinputbox" data-id="' + id + '"><span>' + arr.join(' - ') + '</span><b onclick="removeMultiSelectOption($(this))">x</b></div>';
    placeholder.find('.buttonGreen').before(html);
    hideDropdownMenu();
}

function removeMultiSelectOption(el){
	var id = el.parent().attr('data-id');
	var input = el.closest('.multiselectinput').prev();
	var options = input.val().split('|');
	for(var i=0; i<options.length; i++){
		var o = options[i].split(';');
		if(o[0] == id){ options.splice(i, 1); el.parent().remove(); break; }
	}
	input.val(options.join('|'));
}