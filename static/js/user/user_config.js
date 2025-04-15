function openUserConfig(){loadJS('user/slovar/'+slovar(), function(){
	loadCSS('userConfig');
	hideDropdownMenu();
	GET_myself({done:function(me){
		var popup = createPOPUPbox();
		var popupBox = popup.find('.popupBox');
		var html = '';
		html += '<div id="userConfigMenu">';
		if(user_id == 1 || !valEmpty(me.allow_change_user)){
			html += '<button class="buttonSquare buttonGrey" data-type="change" onclick="showUserConfig($(this))">'+slovar('Change_user')+'</button>';
		}
		html += '<button class="buttonSquare buttonGrey" data-type="security" onclick="showUserConfig($(this))">'+slovar('Security')+'</button>';
		html += '<button class="buttonSquare buttonGrey" data-type="extra" onclick="showUserConfig($(this))">'+slovar('Extra')+'</button>';
		html += '<button class="buttonSquare buttonGrey" data-type="cookie" onclick="showUserConfig($(this))">'+slovar('Cookies')+'</button>';
		html += '<button class="buttonSquare buttonGrey" data-type="localStorage" onclick="showUserConfig($(this))">'+slovar('localStorage')+'</button>';
		html += '<button class="buttonSquare buttonGrey" data-type="google" onclick="showUserConfig($(this))">'+slovar('Google')+'</button>';
		html += '</div><hr><div id="userconfigbox"></div><hr>';
		html += '<button class="button buttonGrey" onclick="removePOPUPbox()">'+slovar('Close')+'</button>';
		popupBox.html(html);
		popup.fadeIn('fast', function(){ showUserConfig(popup.find('.buttonSquare').first()) });
	}})
})}

function showUserConfig(el){
	toggleUserConfigMenu(el);
	var box = $('#userconfigbox');
	box.html(HTML_loader());
	if(el.attr('data-type') == 'change'){ return loadJS('user/user_change', function(){ showUserConfig_change(box) }) }
	if(el.attr('data-type') == 'security'){ return loadJS('user/user_security', function(){ showUserConfig_security(box) }) }
	if(el.attr('data-type') == 'extra'){ return loadJS('user/user_extra', function(){ showUserConfig_extra(box) }) }
	if(el.attr('data-type') == 'cookie'){ return loadJS('user/user_cookie', function(){ showUserConfig_cookie(box) }) }
	if(el.attr('data-type') == 'localStorage'){ return loadJS('user/user_localStorage', function(){ showUserConfig_localStorage(box) }) }
	if(el.attr('data-type') == 'google'){ return loadJS('user/user_google', function(){ showUserConfig_google(box) }) }
}

function toggleUserConfigMenu(el){
	el.parent().find('.buttonSquare').removeClass('buttonBlue').addClass('buttonGrey');
	el.removeClass('buttonGrey').addClass('buttonBlue');
}