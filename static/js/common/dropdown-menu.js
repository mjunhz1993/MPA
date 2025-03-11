function showDropdownMenu(el, alignWithEl = false){
    var DropdownMenu = $('#DropdownMenu');
    var content = el.find('.DropdownMenuContent').clone();
    if(content.length == 1){
        DropdownMenu.html(content);
        DropdownMenu.find('.DropdownMenuContent').removeClass('DropdownMenuContent');
        alignDropdownMenu(el, DropdownMenu, alignWithEl);
    }
    else{console.log('ERROR: No DropdownMenuContent');}
}

function alignDropdownMenu(el, DropdownMenu, alignWithEl = false){
    var win_W = $(window).width();
    var win_H = $(window).height();
    var ST = $(document).scrollTop();
    var el_L = el.offset().left;
    var el_T = el.offset().top;
    var el_W = el.outerWidth();
    var el_H = el.outerHeight();
    DropdownMenu.css('width', '');
    var dm_W = DropdownMenu.outerWidth();
    var dm_H = DropdownMenu.outerHeight();
    if(alignWithEl){
        if(dm_W < el_W){ DropdownMenu.css('width', el_W); dm_W = el_W; }
        var top = el_T - ST + el_H;
        if(top + dm_H >= win_H){ top = el_T - ST - dm_H; }
    }
    else{
        var top = el_T - ST + el_H + 10;
        if(top + dm_H >= win_H){ top = el_T - ST - dm_H - 10; }
    }
    var left = el_L;
    if(left < 0){ left = 10; }
    if(left + dm_W >= win_W){ left = win_W - dm_W - 10; }

    DropdownMenu.css({'top': top, 'left': left, 'opacity': 0}).slideDown(500).animate({ opacity: 1 },{ queue: false, duration: 'fast' });
}

function hideDropdownMenu(){ hideTooltip(); $('#DropdownMenu').hide() }
function resetDropdownMenuConfig(callback){$('.DropdownMenuContent').parent().unbind('click').click(function(e){ e.stopPropagation() })}

$(document).ready(function(){
    $('body').append('<div id="DropdownMenu" style="display:none;"></div>');
    $(document).click(function(){ $('#DropdownMenu').hide() });
    $('#DropdownMenu').click(function(e){ e.stopPropagation() });
    resetDropdownMenuConfig()
});