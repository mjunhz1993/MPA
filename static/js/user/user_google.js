function showUserConfig_google(box, html = ''){GET_globals({
	done:function(data){
		html += '<h2 class="if-Google-Connected" id="googleUserName" style="text-align:center;"></h2>';
		html += HTML_googleButton(data);
		html += '<div class="if-Google-Connected"><hr>';
		html += '<input type="checkbox" id="google_calendar_cookie" onclick="showUserConfig_googleChange($(this), this)" data-name="google_calendar"';
		if(checkCookie('google_calendar')){ html += 'checked'; }
		html += '>';
		html += '<label class="checkboxLabel" for="google_calendar_cookie">' + slovar('Google_calendar') + '</label>';
		html += '</div>';
		box.html(html + HTML_loader());
		loadJS('API/google', function(){
			GOOGLE_connect();
			remove_HTML_loader(box);
		});
	}
})}

function HTML_googleButton(data){
	return `<div class="if-Google-disconnected">
        <div id="g_id_onload"
             data-client_id="`+data.gcID+`"
             data-callback="GOOGLE_login"
             data-auto_prompt="false">
        </div>
    
        <!-- Custom Google Sign-In button -->
        <div class="g_id_signin"
             data-type="standard"
             data-size="large"
             data-theme="outline"
             data-text="sign_in_with"
             data-shape="rectangular"
             data-logo_alignment="center">
        </div>
    </div>`;
}

function GOOGLE_login(response){
	const token = response.credential;
    console.log("ID Token: ", token);
    localStorage.setItem("google_token", token);
    GOOGLE_connect({
    	scope: 'https://www.googleapis.com/auth/userinfo.profile',
    	done: function(){GOOGLE_getUserProfile(function(data){
    		console.log(data);
    	})}
    })
}

function GOOGLE_getUserProfile(callback){
  gapi.client.request({
      'path': 'https://www.googleapis.com/oauth2/v3/userinfo',
  }).then(function(response) {
      callback(response.result)
  }).catch(function(error) {
      console.error("Error fetching user profile:", error);
  });
}

function showUserConfig_googleChange(el, cb){
	var cookie = el.attr('data-name');
	if(cb.checked){ return setCookie(cookie) }
	deleteCookie(cookie)
}