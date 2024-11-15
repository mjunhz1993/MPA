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
  gapi.client.init({
    apiKey: data.gcAPI,
    clientId: data.gcID,
    discoveryDocs: d.docs,
    scope: d.scope
  }).then(function(){
    gapi.auth.setToken({ access_token: d.token });
    googleFiles.push(d.scope);
    if(typeof d.done === 'function'){ d.done() }
  }, function(error) {
    if(typeof callback === 'function'){
      console.log(error);
      createAlertPOPUP(slovar('Connection_failed'));
    }
  });
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