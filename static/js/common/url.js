function urlifyMessage(msg, DefaultLabel = null){
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return msg.replace(urlRegex, function(url){
        var label = url;
        if(DefaultLabel != null){ label = DefaultLabel; }
        var ext = url.split('.').pop().toUpperCase();
        if(['JPG','JPEG','PNG','GIF'].includes(ext))
        { return '<a class="link" onclick="loadJS(\'file/file\', function(){openImgFile(\'' + url + '\', \'' + url + '\')})">' + label + '</a>' }
        else if(ext == 'PDF')
        { return '<a class="link" onclick="loadJS(\'file/file\', function(){openPdfFile(\'' + url + '\', \'' + url + '\')})">' + label + '</a>' }
        return '<a class="link" target="_blank" href="' + url + '">' + label + '</a>'
    })
}

function getUrlParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    var sParameterName;

    for (var i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
}

function isValidHttpUrl(string){
    let url;
    try{ url = new URL(string); }catch(_){ return false; }
    return url.protocol === "http:" || url.protocol === "https:";
}

function clickTelLink(num){
    GET_globals({done:function(data){
        if(valEmpty(data.twilioID) || valEmpty(data.twilioToken) || valEmpty(data.twilioPhone)){ return location.href = 'tel:'+num }
        loadJS('SMS/SMS', function(){ write_SMS(num) })
    }})
}

function clickMailToLink(email){
    loadJS('email/send_email', function(){
        if_email_room_access(function(d){ open_send_email({for:email,body:d.body}) }, function(){ location.href = 'mailto:'+email })
    })
}