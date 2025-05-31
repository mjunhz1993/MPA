function MakeLeftNav(){
    var Main = $('#Main');
    var LNbutton = $('#LeftNavToggleButton');

    var LeftNavW = 230;
    if(LNbutton.data('mode') == 'off'){ LeftNavW = 0 }
    else{ LNbutton.css('stroke', 'var(--blue)') }

    Main.css('width',$(window).width() - LeftNavW);

    // SKRIJ SCROLLBAR LEVO
    var t1 = document.getElementById('LeftNavScroll').offsetWidth
    var t2 = document.getElementById('LeftNavScroll').clientWidth;
    var SCROLLBAR = t1 - t2;
    $('#LeftNavScroll').css('width', 230 + SCROLLBAR);
    if(getLocalStorage('LeftNav') == 'off' && LeftNavOpen()){ LeftNavToggle() }
}

function LeftNavOpen(){if($('#LeftNavToggleButton').data('mode') == 'on'){return true}return false}

function LeftNavToggle(){
    var button = $('#LeftNavToggleButton');
    var LeftNav = $('#LeftNavBox');
    var Main = $('#Main');
    var LeftNavW = 230;
    var LeftNavWC = 40;

    if(smallDevice()){
        LeftNav.css('height',$(window).height() - $('#TopNav').outerHeight());
        LeftNavW = 0;
        LeftNavWC = 0;
    }

    if(button.data('mode') == 'on'){
        button.data('mode', 'off').css('stroke', '');
        LeftNav.css('width', LeftNavWC);
        LeftNavCloseAllGroups();
    }
    else{
        button.data('mode', 'on').css('stroke', 'var(--blue)');
        LeftNav.css('width','');
    }

    setLocalStorage('LeftNav', button.data('mode'));

    setTimeout(function(){
        var lnow = LeftNav.outerWidth(true);
        if(smallDevice()){ lnow = 0 }
        Main.css({
            'width':$(window).width() - lnow,
            'margin-left':lnow
        });
        // CALL CALLBACK FUNCTION
        runTrigger({ id:'LeftNavToggle' });
    }, 220);
}

function loadLeftNav(callback){
    var navBar = $('#LeftNav');
    navBar.append(HTML_loader());
    GET_module({
        hideHidden: true,
        each: function(d){
            if(
                !d.active ||
                (
                    user_id != 1 &&
                    !d.can_add.includes(user_role_id) &&
                    !d.can_edit.includes(user_role_id) &&
                    !d.can_delete.includes(user_role_id)
                )
            ){ return }

            let url = 
                ['', null].includes(d.url) ? `href="/crm/templates/modules/main/main?module=${d.module}"` :
                d.url.startsWith('/')       ? `href="${d.url}"` :
                d.url.includes('|')         ? (() => {
                    const [jsFile, callback] = d.url.split('|');
                    return `onclick="loadJS('${APP.customDir}/${jsFile}.js', ()=>${callback}($(this)))"`;
                })() :
                `href="/crm/templates/${d.url}"`;


            navBar.append(`
                <a ${url} data-pid="${d.category}" title="${slovar(d.name)}">
                    ${getSVG(d.icon)}<span>${slovar(d.name)}</span>
                </a>
            `);

        },
        done: function(){if(typeof callback === 'function'){ remove_HTML_loader(navBar); callback() }}
    })
}

function MakeLeftNavLinks(){
    var leftNav = $('#LeftNav');
    var links = leftNav.find('a');

    links.each(function(){
        var pid = $(this).data('pid');
        if(pid == ''){ return }
        if(leftNav.find('.group[data-name="' + pid + '"]').length == 0){
            leftNav.append('<div class="group" data-name="'+pid+'"><b title="'+slovar(pid)+'"><span>'+slovar(pid)+'</span></b></div>');
        }
        leftNav.find('.group[data-name="' + pid + '"]').append($(this));
    });

    leftNav.find('.group a').hide();

    var url = window.location.pathname + window.location.search;
    pid = '';
    if(url == ''){ url = '/crm/templates/home' }
    var ActiveLink = leftNav.find('a[href="' + url + '"]');
    if(LeftNavOpen()){ pid = ActiveLink.data('pid') }
    ActiveLink.addClass('act');
    
    if(pid != ''){
        var group = ActiveLink.closest('.group');
        group.find('b').addClass('act');
        group.find('a').show();
    }

    if(user_id != 1){ leftNav.find('.group[data-name="Administration"]').remove() }
    LeftNavAddSVG();
    LeftNavToggleGroups();
}

function LeftNavAddSVG(){$('#LeftNav .group b').each(function(){ $(this).prepend(getSVG()) })}

function LeftNavToggleGroups(){
    var leftNav = $('#LeftNav');
    var button = leftNav.find('.group b');
    button.click(function(){
        if(!LeftNavOpen()){ LeftNavToggle() }
        if($(this).hasClass('act')){
            $(this).removeClass('act');
            $(this).closest('.group').find('a').hide();
        }
        else{
            $(this).addClass('act');
            $(this).closest('.group').find('a').show();
        }
    });
}
function LeftNavCloseAllGroups(){
    var leftNav = $('#LeftNav');
    leftNav.find('.group b.act').removeClass('act');
    leftNav.find('.group a').hide();
}


MakeLeftNav();
$(window).resize(function(){ MakeLeftNav() });

$(document).ready(function(){
    if(smallDevice() && LeftNavOpen()){ LeftNavToggle() }
    loadLeftNav(function(){ MakeLeftNavLinks() });
    $('.verticalToggleButtons a').each(function(){
        if($(this).attr('href') == window.location.pathname.substring(1)){ $(this).addClass('act') }
    });
});