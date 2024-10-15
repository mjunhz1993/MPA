function openTableTrash(){
	hideDropdownMenu();
	var box = $('#main_table');
	var button = box.find('.options_table .DropdownMenuContent .buttonForTrashTable');
    if(box.attr('data-filter') == 'trash'){
    	box.removeAttr('data-filter').removeAttr('data-filtervalue');
    	button.html(getSVG('delete') + ' <span>' + slovar('Trash') + '</span>');
    }
    else{
    	box.attr('data-filter', 'trash');
	    box.attr('data-filtervalue', 1);
	    button.html(getSVG('list') + ' <span>' + $('#Main h1').text() + '</span>');
    }
    tableLoad(box, 0, function(){ tableResetFixedWidthColumns(box.find('.table').first()) });
}

function clickRecoverFromTrash(id){
	var box = $('#main_table');
	POPUPconfirm(slovar('Recover_row'), slovar('Recover_desc'), function(){
		$.post('/crm/php/main/module.php?recover_from_trash=1', {
			csrf_token: $('input[name=csrf_token]').val(),
			module: box.attr('data-module'),
			id: id
		}, function(data){ data = JSON.parse(data);
			if(data.error){ createAlert(box, 'Red', data.error); }
			else{ tableLoad(box); }
		}).fail(function(){console.log('ERROR: backend napaka');});
	});
}