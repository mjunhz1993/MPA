addSVG({
	security: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
});

function showUserConfig_security(box){
	showUserConfig_security_check(function(data){ HTML_showUserConfig_security(box, data) })
}

function showUserConfig_security_check(callback){
	$.get('/crm/php/auth/user_config.php', {check_security:true}, function(data){ callback(JSON.parse(data)) })
}

function HTML_showUserConfig_security(box, data, html = ''){
	html += '<div class="securitySVG">'+getSVG('security')+'<span style="display:none">'+slovar('Secure')+'</span></div>'
	html += '<div style="text-align:left">';
	html += '<h2>'+slovar('Two_factor_auth')+' <sub style="background-color:goldenrod">'+slovar('Basic_security')+'</sub></h2>';
	html += '<span class="span">'+slovar('Tfa_desc')+'</span>';
	html += '<input type="checkbox" id="two_factor_auth" onchange="toggle_security($(this))"';
	if(data.includes('two_factor_auth')){ html += 'checked' }
	html += '>';
    html += '<label for="two_factor_auth">'+slovar('Two_factor_auth')+'</label>';
    html += '<hr><h2>'+slovar('Passkey')+' <sub style="background-color:green">'+slovar('Good_security')+'</h2>';
    html += '<span class="span">'+slovar('Passkey_desc')+'</span>';
    html += '<input type="checkbox" id="passkey" onchange="toggle_security($(this))"';
	if(data.includes('passkey')){ html += 'checked' }
	html += '>';
    html += '<label for="passkey">'+slovar('Passkey')+'</label>';
    html += '<button class="buttonSquare buttonBlue" onclick="run_passkey_generate($(this))">'+slovar('Generate_passkey')+'</button>';
    html += ' <span class="no_passkey_msg">'+slovar('User_has_no_passkey')+'</span>';
    html += '</div>';
    box.html(html);
    color_securitySVG();
    display_no_passkey_msg(data);
}

function display_no_passkey_msg(data){
	var box = $('#userconfigbox .no_passkey_msg');
	if(!data.includes('passkey')){ return box.hide() }
	if(!valEmpty(data[data.indexOf('passkey')+1].passkey)){ return box.hide() }
	return box.show()
}

function color_securitySVG(){
	var box = $('#userconfigbox');
	var svg = box.find('.securitySVG');
	if(box.find('#passkey').prop('checked')){ return svg.css('color','green').find('span').show(200) }
	if(box.find('#two_factor_auth').prop('checked')){ return svg.css('color','goldenrod').find('span').show(200) }
	return svg.css('color','red').find('span').hide(200)
}

function toggle_security(el){
	$.get('/crm/php/auth/user_config.php', {
		toggle_security:true,
		toggle:el.attr('id')
	}, function(data){ data = JSON.parse(data);
		if(data.error){
			createAlert(el.parent(), 'Red', data.error);
			el.prop('checked', !el.prop('checked'));
		}
		color_securitySVG();
		showUserConfig_security_check(function(data){ display_no_passkey_msg(data) })
    })
}

function run_passkey_generate(el){
	if(!el.closest('#userconfigbox').find('#passkey').is(':checked')){ return createAlert(el.parent(), 'Red', slovar('Passkey_disabled')) }
	loadJS('auth/passkey', function(){
		register_passkey({
			error:function(err){ createAlert(el.parent(), 'Red', err) },
			done:function(){
				createAlert(el.parent(), 'Green', slovar('Passkey_generated'));
				showUserConfig_security_check(function(data){ display_no_passkey_msg(data) })
			}
		});
	})
}