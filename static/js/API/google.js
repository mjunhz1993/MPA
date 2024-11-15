var googleFiles = [];
loadCSS('google');

function GOOGLE_connect(d){loadJS('https://accounts.google.com/gsi/client', function(){
  if(GOOGLE_connected()){ return GOOGLE_globals(d) }
  return console.log('User not connected to Google');
})}

function GOOGLE_globals(d){GET_globals({
  done:function(data){ GOOGLE_loadApis(d, data) }
})}

function GOOGLE_loadApis(d, data){
  if(valEmpty(data.gcID)){ return callback(false, slovar('NO_gcID')) }
  if(valEmpty(data.gcAPI)){ return callback(false, slovar('NO_gcAPI')) }
  if(valEmpty(d)){ return }
  if(valEmpty(d.scope)){ return }
  loadJS('https://apis.google.com/js/api.js', function(){ GOOGLE_loadClient(d, data) })
}

function GOOGLE_loadClient(d, data){
  d.token = localStorage.getItem("google_token");
  if(typeof gapi.client === 'undefined'){ return gapi.load('client', function(){ GOOGLE_initClient(d, data) }) }
  return GOOGLE_initClient(d, data);
}

function GOOGLE_initClient(d, data){
  if(googleFiles.includes(d.scope) && typeof d.done === 'function'){ return d.done() }
  googleFiles.push(d.scope);
  gapi.client.init({
    apiKey: data.gcAPI,
    discoveryDocs: d.docs
  }).then(function(){
    gapi.auth.setToken({ access_token: d.token });
    GOOGLE_initTokenClient(d, data);
  }, function(error) {
    console.log(error);
    createAlertPOPUP(slovar('Connection_failed'));
  });
}

function GOOGLE_initTokenClient(d, data){
  google.accounts.oauth2.initTokenClient({
    client_id: data.gcID,
    scope: d.scope,
    callback: (response) => {
      if(response.error){ return createAlertPOPUP(response.error)}
      accessToken = response.access_token;
      localStorage.setItem('google_token', accessToken);
      if(typeof d.done === 'function'){ d.done() }
    }
  })
}

function GOOGLE_connected(){
  if(localStorage.getItem("google_token")){
    $('.if-Google-Connected').show();
    $('.if-Google-disconnected').hide();
    return true;
  }
  $('.if-Google-Connected').hide();
  $('.if-Google-disconnected').show();
  return false;
}

function GOOGLE_logout() {
  localStorage.removeItem("google_token");
  GOOGLE_connected();
}