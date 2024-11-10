var G_DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var G_SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
var G_connected = false;

function G_connect(callback){
  if(G_connected){
    var GoogleAuth = gapi.auth2.getAuthInstance();
    var GoogleUser = GoogleAuth.currentUser.get();
    return G_updateSigninStatus(GoogleAuth.isSignedIn.get(), GoogleUser, callback);
  }
  /*
  $.cachedScript('https://apis.google.com/js/api.js').done(function(script, textStatus){
    gapi.load('client:auth2', function(){ G_initClient(callback) })
  })
  */
  $.cachedScript('https://apis.google.com/js/api.js').done(function(script, textStatus){
    gapi.load('client:auth2', function(){ G_initClient(callback) })
  })
}

function G_initClient(callback){GET_globals({
  done:function(data){ G_initClient_start(callback, data) }
})}

function G_initClient_start(callback, data){
  if(valEmpty(data.gcID)){ return callback(false, slovar('NO_gcID')) }
  if(valEmpty(data.gcAPI)){ return callback(false, slovar('NO_gcAPI')) }
  gapi.client.init({
    apiKey: data.gcAPI,
    clientId: data.gcID,
    discoveryDocs: G_DISCOVERY_DOCS,
    scope: G_SCOPES
  }).then(function(){
    var GoogleAuth = gapi.auth2.getAuthInstance();
    var GoogleUser = GoogleAuth.currentUser.get();
    GoogleAuth.isSignedIn.listen(G_updateSigninStatus);
    G_updateSigninStatus(GoogleAuth.isSignedIn.get(), GoogleUser, callback);
  }, function(error) {
    if(typeof callback === 'function'){
      console.log(error);
      callback(false, slovar('Connection_failed'))
    }
  });
}

function G_updateSigninStatus(isSignedIn, GoogleUser, callback){
  if(isSignedIn){
    G_connected = true;
    $('.ifGoogleLogout').hide();
    $('.ifGoogleLogin').show();
  }
  else{
    $('.ifGoogleLogout').show();
    $('.ifGoogleLogin').hide();
  }
  if(typeof callback === 'function'){ callback(isSignedIn, GoogleUser) }
}

function G_login(event){ gapi.auth2.getAuthInstance().signIn(); }
function G_logout(event){ gapi.auth2.getAuthInstance().signOut(); }
function G_getBasicProfile(){if(G_connected){ return gapi.auth2.currentUser.get() }}