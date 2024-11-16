function showUserConfig_google(box, html = ''){GET_globals({
	done:function(data){
		html += '<h2 class="if-Google-Connected" id="googleUserName" style="text-align:center;"></h2>';
		html += '<div class="if-Google-disconnected">';
		html += '<button class="button buttonGreen" onclick="GOOGLE_login()">'+slovar('Log_in')+'</butto>';
		html += '</div>';
		html += '<div class="if-Google-Connected"><hr>';
		html += '<input type="checkbox" id="google_calendar_cookie" onclick="showUserConfig_googleChange($(this), this)" data-name="google_calendar"';
		if(checkCookie('google_calendar')){ html += 'checked'; }
		html += '>';
		html += '<label class="checkboxLabel" for="google_calendar_cookie">' + slovar('Google_calendar') + '</label>';
		html += '<button class="button buttonRed" onclick="GOOGLE_logout()">'+slovar('Log_out')+'</butto>';
		html += '</div>';
		box.html(html + HTML_loader());
		loadJS('API/google', function(){ GOOGLE_test_login() });
	}
})}

function GOOGLE_test_login(){
	GOOGLE_connect({
		scope: 'https://www.googleapis.com/auth/userinfo.profile',
		done: function(){ GOOGLE_getUserProfile() }
	});
	remove_HTML_loader(box);
}

function GOOGLE_login(){ googleObj.client.requestAccessToken() }

function GOOGLE_getUserProfile(){
  gapi.client.request({
      'path': 'https://www.googleapis.com/oauth2/v3/userinfo',
  }).then(function(response) {
      console.log(response.result)
  }).catch(function(error) {
      console.error("Error fetching user profile:", error);
  });
}

function showUserConfig_googleChange(el, cb){
	var cookie = el.attr('data-name');
	if(cb.checked){ return setCookie(cookie) }
	deleteCookie(cookie)
}

function GOOGLE_logout() {
  localStorage.removeItem("google_token");
  GOOGLE_connected();
}