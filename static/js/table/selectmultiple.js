function openSelectMultiple(el){
	if(![undefined,''].includes(el.closest('#main_table').find('.archiveSelect').val())){ return false }
	var table = el.closest('table');
	var html = '';
	html += '<div id="selectmultipleBox"><div style="display:flex;">';
	html += '<button class="buttonSquare button100 buttonBlue" onclick="showDropdownMenu($(this), true)">' + slovar('Tools');
	html += '<div class="DropdownMenuContent">';
	html += '<p>' + slovar('Export') + '</p>';
	html += '<a onClick="table2csv()">' + getSVG('download') + ' <span>' + slovar('CSV') + '</span></a>';
	html += '<a onClick="table2pdf()">' + getSVG('download') + ' <span>' + slovar('PDF') + '</span></a>';
	// html += '<a onClick="table2campaign()">' + getSVG('download') + ' <span>' + slovar('Campaign') + '</span></a>';
	html += '<hr>';
	html += '<a onClick="deleteSelectMultiple($(\'#selectmultipleBox\'))">' + getSVG('delete') + ' <span>' + slovar('Delete') + '</span></a>';
	html += '</div>';
	html += '</button>';
	html += '<button class="buttonSquare button100 buttonGrey buttonCancelSelectMultiple" onclick="cancelSelectMultiple($(this))">' + slovar('Cancel') + '</button>';
	html += '</div><hr>';
	html += '<input type="checkbox" id="selectmultipleall" onchange="selectMultipleAll($(this))">';
	html += '<label class="label100" for="selectmultipleall">' + slovar('Select_all') + '</label>';
	html += '</div>';
	el.hide();
	el.after(html);
	tableResetFixedWidthColumns(table);
	resetDropdownMenuConfig();
	turnTableToMultiSelect(table);
}

function turnTableToMultiSelect(table){
	var i = 0;
	table.find('tbody .toolRow:not(:first)').each(function(){
		var html = '<input type="checkbox" class="selectmultiple" id="selectmultiple' + i + '">';
		html += '<label for="selectmultiple' + i + '" class="chekboxLabel">' + slovar('Select') + '</label>';
		$(this).find('.linksvg').hide();
		$(this).append(html);
		i++;
	});
}

function selectMultipleAll(el){
	var inputs = el.closest('table').find('.selectmultiple[type=checkbox]');
	if(el.is(':checked')){ inputs.prop('checked', true) }
	else{ inputs.prop('checked', false) }
}

function cancelSelectMultiple(el){
	var tr = el.closest('table').find('.toolRow:not(:first)');
	var box = el.parent().parent();
	box.prev('button').show();
	box.remove();
	tr.find('.linksvg').show();
	tr.find('input[type=checkbox], .chekboxLabel').remove();
}

function selectMultipleNotEmpty(){
	if($('.selectmultiple[type=checkbox]:checked').length > 0){ return true }
	return false
}

function table2csv(){
	if(!selectMultipleNotEmpty()){ return }
	loadJS('export/html2csv', function(){
		$('tr.ignoreRowSelectMultiple').removeClass('ignoreRowSelectMultiple');
		var notSelected = $('.selectmultiple[type=checkbox]:not(:checked)');
		notSelected.closest('tr').addClass('ignoreRowSelectMultiple')
		var box = $('#main_table');
		var module = box.attr('data-module');
		exportCSVfile('csv', box.find('.table').first(), module, function(){
			$('tr.ignoreRowSelectMultiple').removeClass('ignoreRowSelectMultiple');
		});
		hideDropdownMenu();
	})
}

function table2pdf(){
	if(!selectMultipleNotEmpty()){ return }
	loadJS('export/js2pdf', function(){
		var box = $('#main_table');
		open_Html2pdf({
			title:box.attr('data-module'),
			open:function(){
				var paper = create_PdfPaper();
				add_ContentToPdfPaper(box.find('.table'));
				paper.find('.selectmultiple[type=checkbox]:not(:checked)').closest('tr').remove();
				paper.find('.ignoreRow, tr td:first-child, tr th:first-child, .button, svg').remove();
				setTimeout(function(){
					var t = paper.find('.table');
					var rowLimit = 100;
					add_PdfSize(px2pt(t.outerWidth()), px2pt(t.outerHeight()), slovar('Fit_content'));
				}, 100)
			}
		})
	})
}

function table2campaign(){
	hideDropdownMenu();
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	var module = $('#main_table').attr('data-module');
	var selected = $('.selectmultiple[type=checkbox]:checked');
	var html = '';

	GET_column({
		module:module,
		done: function(col){
			$.getJSON('/crm/php/campaign/campaign.php?get_all_lists=1', function(list){
		        html += '<form>';
				html += '<label for="export_type">' + slovar('Export_type') + '</label>';
				html += '<select id="export_type" required>';
				if(selected.length != 0){ html += '<option value="1">' + slovar('Export_selected') + '</option>'; }
				html += '<option value="2">' + slovar('Export_all_filterd') + '</option>';
				html += '<option value="3">' + slovar('Export_all') + '</option>';
				html += '</select>';

				html += '<label for="export_list">' + slovar('Email_list') + '</label>';
				html += '<select id="export_list" required>';
				for(var i=0; i<list.length; i++){ html += '<option value="' + list[i].id + '">' + list[i].name + '</option>'; }
				html += '</select>';

				html += '<label for="export_email">' + slovar('Email_column') + '</label>';
				html += '<select id="export_email" required>';
				for(var i=0; i<col.length; i++){if(col[i].type == 'VARCHAR' && col[i].list == 'EMAIL'){
					html += '<option value="' + col[i].column + '">' + slovar(col[i].name) + '</option>';
				}}
				html += '</select>';

				html += '<label for="export_name">' + slovar('Name_column') + '</label>';
				html += '<select id="export_name" required>';
				for(var i=0; i<col.length; i++){if(col[i].type == 'VARCHAR' && col[i].list == 'PRIMARY'){
					html += '<option value="' + col[i].column + '">' + slovar(col[i].name) + '</option>';
				}}
				html += '</select>';

				html += '<hr><button class="button buttonGreen">' + slovar('Export') + '</button>';
				html += '<div class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</div>';
				html += '</form>';
				popupBox.html(html);
				var form = popupBox.find('form');

				form.on('submit', function(e){
					e.preventDefault();
					popupBox.find('.alert').remove();
					var selectedID = [];
					if(form.find('#export_type').val() == 1){ selected.each(function(){ selectedID.push($(this).closest('tr').attr('data-id')); }); }

					$.post('/crm/php/campaign/campaign.php?import_emails=1', {
						csrf_token: $('input[name=csrf_token]').val(),
						module: module,
						export_type: form.find('#export_type').val(),
						export_list: form.find('#export_list').val(),
						export_email: form.find('#export_email').val(),
						export_name: form.find('#export_name').val(),
						selectedID: selectedID.join(',')
					}, function(data){ data = JSON.parse(data);
						if(data.error){ return createAlert(popupBox, 'Red', data.error) }
						removePOPUPbox()
					})
				});

				popup.fadeIn('fast');
			})
		}
	})
}

function deleteSelectMultiple(el){
	if(!selectMultipleNotEmpty()){ return }
	var selected = $('.selectmultiple[type=checkbox]:checked');
	var arr = [];
	selected.each(function(){ arr.push($(this).closest('tr').attr('data-id')); });
	tableClickDeleteButton(el, el.closest('.tableBox').attr('data-module'), arr.join());
	hideDropdownMenu();
}