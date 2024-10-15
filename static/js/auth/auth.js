function loginTableSize(){$('.loginTable').height($(window).height());}
loginTableSize();
$(window).resize(function(){ loginTableSize() });

$(document).ready(function(){
    $('.loginbox').slideDown(function(){
        $(this).css('height','');
        $('.loginboxinner').fadeIn(function(){
            if($(this).find('input[name=username]').val() == ''){ $(this).find('input[name=username]').focus() }
            else{ $(this).find('input[name=password]').focus() }
        });
    });
});

function TestLogin(box){
    var form = box.find('form');

    box.prepend(HTML_loader());
    form.hide();
    
    $.post("/crm/php/auth/auth.php?login=1", form.serialize(), function(data){
        data = JSON.parse(data);
        if(!data.error){ return window.location.href = "templates/home.php" }
        if(data.error == 'TFA'){ return loadJS('auth/confirm_email', function(){ sendConfirmEmail(box) })}
        if(data.error == 'PASSKEY'){ return loadJS('auth/passkey', function(){ login_passkey(box) })}
        
        box.find('.result').text(data.error);
        remove_HTML_loader(box);
        form.show();
    });
}

$('form').unbind().submit(function(e){
    e.preventDefault();
    TestLogin($('.AJAXlogin'));
});