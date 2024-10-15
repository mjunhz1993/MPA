function addPhoneZipCode(el){ if(el.val() == ''){ el.val(el.prev('.flag').attr('data-phone')); } }
function testPhoneNumber(el){ el.val(el.val().replace(/[^\d+]/g,'')); }
function countrieToPhone(el, input){
    input = $('#' + input);
    var flag = input.parent().find('.flag');
    flag.css('background-position-y', el.attr('data-flag')).attr('data-phone', el.attr('data-phone'));
    input.val(el.attr('data-phone')).attr('placeholder', el.attr('data-phone')).focus();
    hideDropdownMenu();
}

function countrieToConfig(el, input){ $('#' + input).val(el.attr('data-phone') + '|' + el.attr('data-flag')); }

function get_countries(el, callback){
    if(el.find('.DropdownMenuContent').length == 0){
        $.get('/crm/php/main/countries.php', function(data){
            data = JSON.parse(data);
            // ADD CLICK EVENT
            if(callback == 'PHONE'){ callback = 'countrieToPhone($(this), \'' + el.parent().find('input').attr('id') + '\')'; }
            else if(callback == 'CONFIG'){ callback = 'countrieToConfig($(this), \'phonezipcode\')'; }
            // ADD BOX
            var html = '<div class="DropdownMenuContent">';
            html += '<input type="text" class="DropdownMenuSearchBox" placeholder="' + slovar('Search') + '" onkeyup="search_countries($(this))">';
            html += '<div class="countrieSelectBox">';
            if(data){for(const [key, c] of Object.entries(data)){
                html += '<a onclick="' + callback + '" data-flag="' + c.flag + '" data-phone="' + c.phone + '">';
                html += '<span style="background-position-y:' + c.flag + ';"></span><b>' + c.name + '</b></a>';
            }}
            html += '</div></div>';
            el.append(html);
            showDropdownMenu(el);
            $('#DropdownMenu input').focus();
            resetDropdownMenuConfig();
        }).fail(function(){console.log('ERROR: backend napaka');});
    }
    else{ showDropdownMenu(el); $('#DropdownMenu input').focus(); }
}

function search_countries(el){
    var c = el.parent().find('a');
    if(el.val() != ''){
        c.each(function(){
            var t = $(this).text().toLowerCase();
            if(t.includes(el.val().toLowerCase())){ $(this).show(); }
            else{ $(this).hide(); }
        });
    }
    else{ c.show(); }
}