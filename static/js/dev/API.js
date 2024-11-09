function load_API_table(html = ''){
	html += '<div class="box col80 apiBox"></div>';
	html += '<div class="box col80 apiInfoBox"></div>';
	$('#Main').append(html);
	apiInfoBox($('.apiInfoBox'));
	var box = $('.apiBox');
	html = '<table class="tableTop"><tr>';
	html += '<td><button class="button buttonGreen" onclick="add_API()">' + slovar('Add_new') + '</button></td>';
	html += '<td></td>';
	html += '</tr></table>';
	html += '<table class="table apiTable"><thead><tr><th></th>';
	html += '<th>' + slovar('IP') + '</th>';
	html += '<th>' + slovar('Username') + '</th>';
	html += '<th>' + slovar('Password') + '</th>';
	html += '<th>' + slovar('Rate_limit') + '</th>';
	html += '<th>' + slovar('Current_rate') + '</th>';
	html += '</thead><tbody></tbody></table>';
	box.html(html);
	$.get('/crm/php/admin/API.php?test_API_table=1', function(data){ load_API_rows() })
}

function load_API_rows(){
	$.get('/crm/php/admin/API.php?load_API_rows=1', function(data){
        data = JSON.parse(data);
        var html = '';
        for(var i=0; i<data.length; i++){
        	var d = data[i];
        	html += '<tr>';
        	html += '<td class="toolRow">';
        	html += '<a class="linksvg" onclick="edit_API(\''+d.IP+'\',\''+d.username+'\',\''+d.password+'\', '+d.ratelimit+')">'+getSVG('edit')+'</a>';
        	html += '<a class="linksvg" onclick="delete_API(\''+d.IP+'\')">'+getSVG('delete')+'</a>';
        	html += '</td>';
        	html += '<td>' + d.IP + '</td>';
        	html += '<td>' + d.username + '</td>';
        	html += '<td>' + d.password + '</td>';
        	html += '<td>' + d.ratelimit + '</td>';
        	html += '<td>' + currentrate(d.currentrate) + '</td>';
        	html += '</tr>';
        }
        $('.apiTable tbody').html(html);
    })
}
function currentrate(d){
	if(d > 0){ return '<span style="color:green">'+d+'</span>' }
	return '<span style="color:red">'+d+'</span>'
}

function add_API(){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	popupBox.html('<h2>'+slovar('Add_new')+'</h2>'+HTML_API());
	popup.find('form').on('submit', function(e){
		e.preventDefault();
		$.post('/crm/php/admin/API.php?add_API=1', {
			IP: popup.find('[name=IP]').val(),
			username: popup.find('[name=username]').val(),
			password: popup.find('[name=password]').val(),
			ratelimit: popup.find('[name=ratelimit]').val()
		}, function(data){
	        data = JSON.parse(data);
	        if(data.error){ return createAlert(popupBox, 'Red', data.error) }
	        removePOPUPbox();
	    	load_API_rows();
	    })
	})
	popup.fadeIn('fast');
}

function edit_API(IP, username, password, ratelimit){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	popupBox.html('<h2>'+slovar('Edit_row')+'</h2>'+HTML_API());
	popupBox.find('[name=IP]').val(IP).parent().hide();
	popupBox.find('[name=username]').val(username);
	popupBox.find('[name=password]').val(password);
	popupBox.find('[name=ratelimit]').val(ratelimit);
	popup.find('form').on('submit', function(e){
		e.preventDefault();
		$.post('/crm/php/admin/API.php?edit_API=1', {
			IP: popup.find('[name=IP]').val(),
			username: popup.find('[name=username]').val(),
			password: popup.find('[name=password]').val(),
			ratelimit: popup.find('[name=ratelimit]').val()
		}, function(data){
	        data = JSON.parse(data);
	        if(data.error){ return createAlert(popupBox, 'Red', data.error) }
	        removePOPUPbox();
	    	load_API_rows();
	    })
	})
	popup.fadeIn('fast');
}

function delete_API(IP){
	POPUPconfirm(slovar('Confirm_event'), slovar('Confirm_delete'), function(){
		$.post('/crm/php/admin/API.php?delete_API=1', {
			IP: IP
		}, function(data){
	        data = JSON.parse(data);
	        if(data.error){ return createAlert(popupBox, 'Red', data.error) }
	        load_API_rows();
	    })
    });
}

function HTML_API(html = ''){
	html += '<form>';
	html += '<div><label>IP</label>';
	html += '<input type="text" name="IP" required></div>';
	html += '<div><label>'+slovar('Username')+'</label>';
	html += '<input type="text" name="username" required></div>';
	html += '<div><label>'+slovar('Password')+'</label>';
	html += '<input type="text" name="password" required>';
	html += '<span class="button buttonBlue" onclick="generatePassword($(this))">'+slovar('Generate_password')+'</span>';
	html += '</div>';
	html += '<div><label>'+slovar('Rate_limit')+'</label>';
	html += '<input type="number" name="ratelimit" required></div>';
	html += '<hr><button class="button buttonGreen">' + slovar('Add_new') + '</button>';
	html += '<span class="button buttonGrey" onclick="removePOPUPbox()">' + slovar('Cancel') + '</span>';
	html += '</form>';
	return html
}

function generatePassword(el, length = 20) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + specialChars;
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars[randomIndex];
  }

  el.closest('form').find('[name=password]').val(password);
}

function apiInfoBox(box, html = ''){
	html += '<div class="boxInner">';
	html += '<label>header</label>';
	val = "Array(\n\t[type] => POST,\n\t[Accept] => application/json\n";
	val += "\t[Authorization] => Basic base64(username:password)\n\t[event] => event_name\n)";
	html += '<pre><code>'+val+'</code></pre>';

	html += '<label>Url</label>';
	html += '<pre><code>'+window.location.origin+'/crm/API/</code></pre>';
	html += '</div>';
	box.html(html);
}

load_API_table();