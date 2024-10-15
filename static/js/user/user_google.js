function showUserConfig_google(box, html = ''){
	html += '<h2 class="ifGoogleLogin" id="googleUserName" style="text-align:center;"></h2>';
	html += '<button class="button buttonRed ifGoogleLogin" onclick="G_logout()" style="display:none;">' + slovar('Logout') + '</button>';
	html += '<button class="button buttonGreen ifGoogleLogout" onclick="G_login()" style="display:none;">' + slovar('Login') + '</button>';
	html += '<div class="ifGoogleLogin" style="display:none;"><hr>';
	html += '<input type="checkbox" id="google_calendar_cookie" onclick="showUserConfig_googleChange($(this), this)" data-name="google_calendar"';
	if(checkCookie('google_calendar')){ html += 'checked'; }
	html += '>';
	html += '<label class="checkboxLabel" for="google_calendar_cookie">' + slovar('Google_calendar') + '</label>';
	html += '</div>';
	box.html(html + HTML_loader());
	loadJS('API/google', function(){
		G_connect(function(isSignedIn, GoogleUser){
			remove_HTML_loader(box);
			if(isSignedIn){ return $('#googleUserName').text(GoogleUser.getBasicProfile().getName()) }
			createAlert(box, 'Red', GoogleUser)
		});
	});
}

function showUserConfig_googleChange(el, cb){
	var cookie = el.attr('data-name');
	if(cb.checked){ return setCookie(cookie) }
	deleteCookie(cookie)
}