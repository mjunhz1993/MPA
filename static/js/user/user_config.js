loadCSS('userConfig');

function openUserConfig(){loadJS('user/slovar/'+slovar(), function(){
	hideDropdownMenu();
	GET_myself({done:function(me){
		var popup = createPOPUPbox();
		var popupBox = popup.find('.popupBox');
		popupBox.html(userConfig_HTML(me));
		popup.fadeIn('fast', function(){ showUserConfig(popup.find('.buttonSquare').first()) });
	}})
})}

function userConfig_HTML(me){
	let html = '<div id="userConfigMenu">';

	if (user_id == 1 || !valEmpty(me.allow_change_user)) {
		html += `
		<button class="buttonSquare buttonGrey" data-type="change" onclick="showUserConfig($(this))">
			${slovar('Change_user')}
		</button>
		`;
	}

	['security', 'ticket', 'cookie', 'localStorage', 'google', 'extra'].forEach(type => {
		html += `
		<button class="buttonSquare buttonGrey" data-type="${type}" onclick="showUserConfig($(this))">
			${slovar(type.charAt(0).toUpperCase() + type.slice(1))}
		</button>`;
	});

	html += `
	</div>
	<hr>
	<div id="userconfigbox"></div>
	<hr>
	<button class="button buttonGrey" onclick="removePOPUPbox()">
		${slovar('Close')}
	</button>
	`;

	return html;
}

function showUserConfig(el){
	toggleUserConfigMenu(el);
	var box = $('#userconfigbox');
	box.html(HTML_loader());
	let type = el.data('type');
	return loadJS('user/user_'+type, function(){ eval(`showUserConfig_${type}(box)`) })
}

function toggleUserConfigMenu(el){
	el.parent().find('.buttonSquare').removeClass('buttonBlue').addClass('buttonGrey');
	el.removeClass('buttonGrey').addClass('buttonBlue');
}