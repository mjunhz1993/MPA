function load_API_table(html = ''){
	$('#Main').append(`
	<div class="box col80 apiReceiveBox"></div>
	<div class="box col80 apiInfoBox"></div>
	<div class="box col80 apiSendBox"></div>
	`);

	apiInfoBox($('.apiInfoBox'));

	$('.apiReceiveBox').html(`
	<table class="tableTop">
		<tr>
			<td>
				<button class="button buttonGreen" onclick="add_API()">${slovar('Add_new')}</button>
			</td>
			<td><h2>${slovar('Receive_api')}</h2></td>
		</tr>
	</table>
	<table class="table apiTable">
		<thead>
			<tr>
				<th></th>
				<th>${slovar('IP')}</th>
				<th>${slovar('domainname')}</th>
				<th>${slovar('Username')}</th>
				<th>${slovar('Password')}</th>
				<th>${slovar('Rate_limit')}</th>
				<th>${slovar('Current_rate')}</th>
			</tr>
		</thead>
		<tbody></tbody>
	</table>
	`);

	$('.apiSendBox').html(`
	<table class="tableTop">
		<tr>
			<td>
				<button class="button buttonBlue" onclick="HTML_API_send_row()">${slovar('Add_new')}</button>
				<button class="button buttonGrey" onclick="HTML_API_send_help()">${slovar('Help')}</button>
			</td>
			<td><h2>${slovar('Send_api')}</h2></td>
		</tr>
	</table>
	<form class="apiSendTable">
	<table class="table">
		<thead>
			<tr>
				<th>${slovar('Index')}</th>
				<th>${slovar('Value')}</th>
				<th></th>
			</tr>
		</thead>
		<tbody></tbody>
	</table>
	<button class="button button100 buttonGreen">${slovar('Save')}</button>
	</form>
	`);

	$.get('/crm/php/admin/API.php?test_API_table=1', function(){ load_API_rows() });

	load_API_send_rows();
	let form = $('.apiSendTable');
	form.on('submit', function(e){
		e.preventDefault();
		$.post('/crm/php/admin/API.php?save_API_send=1', form.serialize(), function(data){
			if(data.error){ return createAlertPOPUP(data.error) }
			createAlertPOPUP(slovar('Send_api')+' '+slovar('Saved'));
		});
	});
}

function load_API_rows(){
	$.getJSON('/crm/php/admin/API.php?load_API_rows=1', function(data){
        var html = '';
        for(var i=0; i<data.length; i++){
        	var d = data[i];
        	html += '<tr>';
        	html += '<td class="toolRow">';
        	html += '<a class="linksvg" ';
        	html += 'onclick="edit_API(\''+d.IP+'\',\''+d.domainname+'\',\''+d.username+'\',\''+d.password+'\', '+d.ratelimit+')">'+getSVG('edit')+'</a>';
        	html += '<a class="linksvg" onclick="delete_API(\''+d.IP+'\')">'+getSVG('delete')+'</a>';
        	html += '</td>';
        	html += '<td>' + d.IP + '</td>';
        	html += '<td>' + d.domainname + '</td>';
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
	if(d > 0){ return '<span style="color:green">OK</span>' }
	return '<span style="color:red">WAIT - '+d+'</span>'
}

function add_API(){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	popupBox.html('<h2>'+slovar('Add_new')+'</h2>'+HTML_API());
	popup.find('form').on('submit', function(e){
		e.preventDefault();
		$.post('/crm/php/admin/API.php?add_API=1', {
			IP: popup.find('[name=IP]').val(),
			domainname: popup.find('[name=domainname]').val(),
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

function edit_API(IP, domainname, username, password, ratelimit){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	popupBox.html('<h2>'+slovar('Edit_row')+'</h2>'+HTML_API());
	popupBox.find('[name=IP]').val(IP).parent().hide();
	popupBox.find('[name=domainname]').val(domainname);
	popupBox.find('[name=username]').val(username);
	popupBox.find('[name=password]').val(password);
	popupBox.find('[name=ratelimit]').val(ratelimit);
	popup.find('form').on('submit', function(e){
		e.preventDefault();
		$.post('/crm/php/admin/API.php?edit_API=1', {
			IP: popup.find('[name=IP]').val(),
			domainname: popup.find('[name=domainname]').val(),
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
	html += '<div><label>'+slovar('domainname')+'</label>';
	html += '<input type="text" name="domainname"></div>';
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

// INFO

function apiInfoBox(box, html = ''){
	html += '<div class="boxInner">';
	html += '<label>header</label>';
	val = "Header(\n\t[Request_Method] => POST\n\t[Accept] => application/json\n";
	val += "\t[Authorization] => Basic base64(username:password)\n\t[event] => [event_name]\n)";
	html += '<pre><code>'+val+'</code></pre>';

	html += '<label>Url</label>';
	html += '<pre><code>'+window.location.origin+'/crm/API/</code></pre>';
	html += '</div>';
	box.html(html);
}

// SEND

function load_API_send_rows(){
		GET_globals({
				done:function(g){
						if(!g.API){ return }
						Object.entries(g.API).forEach(([index, value]) => { HTML_API_send_row(index, value) });
				}
		})
}

function HTML_API_send_row(i,v){
	$('.apiSendTable tbody').append(`
		<tr>
			<td>
				<input type="text" value="${i ?? ''}" name="api_index[]" required>
			</td>
			<td>
				<input type="text" value="${v ?? ''}" name="api_value[]" required>
			</td>
			<td>
				<a class="linksvg" onclick="$(this).closest('tr').remove()">${getSVG('delete')}</a>
			</td>
		</tr>
	`);
}

function HTML_API_send_help(){
	var popup = createPOPUPbox();
	var popupBox = popup.find('.popupBox');
	popupBox.html(`
		<style>.API_send_help p{ color:var(--blue); cursor:pointer; }</style>
		<div class="API_send_help" style="text-align:left">
			<b>SENDGRID E-mail marketing</b>
			<p onclick="HTML_API_send_row('sendgridID')">sendgridID = ID</p>
			<hr>
			<b>twilio - SMS</b>
			<p onclick="HTML_API_send_row('twilioID')">twilioID = twilio SID</p>
			<p onclick="HTML_API_send_row('twilioToken')">twilioToken = twilio Token</p>
			<p onclick="HTML_API_send_row('twilioPhone')">twilioPhone = twilio Phone number</p>
			<hr>
			<b>JITSI - Video Call</b>
			<p onclick="HTML_API_send_row('jitsipuk')">jitsipuk = JITSI Public key</p>
			<p onclick="HTML_API_send_row('jitsiprk')">jitsiprk = JITSI Private key file (/crm/static/uploads)</p>
			<p onclick="HTML_API_send_row('jitsiid')">jitsiid = JITSI app ID</p>
			<hr>
			<b>STRIPE Pay</b>
			<p onclick="HTML_API_send_row('stripePK')">stripePK = STRIPE Publish key</p>
			<p onclick="HTML_API_send_row('stripeSK')">stripeSK = STRIPE Secret key</p>
			<hr>
			<b>Google</b>
			<p onclick="HTML_API_send_row('geminiAPI')">geminiAPI = Gemini</p>
			<p onclick="HTML_API_send_row('gcID')">gcID = GOOGLE CLOUD ID</p>
			<p onclick="HTML_API_send_row('gcAPI')">gcAPI = GOOGLE CLOUD API</p>
			<hr>
			<b>Pusher</b>
			<p onclick="HTML_API_send_row('pusherBeamsID')">pusherBeamsID = Instance ID</p>
			<p onclick="HTML_API_send_row('pusherBeamsKEY')">pusherBeamsKEY = Primary key</p>
		</div>
		<button class="button buttonGrey" onclick="removePOPUPbox()">${slovar('Close')}</button>
	`);
	popup.fadeIn('fast');
}

load_API_table();