function showTooltip(el){
    var content = el.data('tooltip');
    if(valEmpty(content)){ return }
    var win_W = $(window).width();
    var win_H = $(window).height();
    var ST = $(document).scrollTop();
    var tooltip = $('#tooltip');
    var el_L = el.offset().left;
    var el_T = el.offset().top;
    var el_W = el.outerWidth();
    var el_H = el.outerHeight();
    tooltip.text(content);
    var tt_W = tooltip.outerWidth();
    var tt_H = tooltip.outerHeight();

    var top = el_T - ST + el_H + 10;
    if(top + tt_H >= win_H){ top = el_T - ST - el_H - tt_H - 10; }
    var left = el_L + (el_W / 2) - (tt_W / 2);
    if(left < 0){ left = 10; }
    if(left + tt_W >= win_W){ left = win_W - tt_W - 10; }

    tooltip.css({'top': top, 'left': left}).show();
}

function hideTooltip(){ $('#tooltip').hide() }

function tooltips(){
    if(smallDevice()){ return }
    $('[data-tooltip]').unbind('mouseenter').unbind('mouseout');
    $('[data-tooltip]').mouseover(function(){ showTooltip($(this)) });
    $('[data-tooltip]').mouseout(function(){ hideTooltip() });
}


$(document).ready(function(){
    $('body').append('<div id="tooltip" class="tooltip" style="display:none;"></div>');
    tooltips();
});