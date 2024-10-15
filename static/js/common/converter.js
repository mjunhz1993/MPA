function urlify(text) {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url){ return '<a target="_blank" href="' + url + '">' + url + '</a>' });
}

function px2pt(v){ return (v * 0.75) }

function strip_tags(box, whitelist){
    box.find('*').not(whitelist).each(function(){
        var content = $(this).contents();
        $(this).replaceWith(content);
    });
}

function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.substring(1);
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
}