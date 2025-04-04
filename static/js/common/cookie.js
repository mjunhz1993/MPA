function setCookie(cname, cvalue = true, exdays = 30){
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname){
  let name = cname + "=";
  let ca = decodeURIComponent(document.cookie).split(';');
  for(let i = 0; i <ca.length; i++){
    let c = ca[i];
    while(c.charAt(0) == ' '){ c = c.substring(1) }
    if(c.indexOf(name) == 0){ return c.substring(name.length, c.length) }
  }
  return ""
}

function getAllCookies(arr = []){
  let ca = decodeURIComponent(document.cookie).split(';');
  for(let i = 0; i <ca.length; i++){ arr.push(ca[i].split('=')) }
  return arr
}

function checkCookie(cname){
  let test = getCookie(cname);
  if(test != ''){ return true }
  return false
}

function deleteCookie(cname){ document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;" }