function sendConfirmEmail(box){
    $.getJSON("/crm/php/auth/confirm_email.php", function(data){
        if(data){ displayConfirmEmailForm(box) }
        else{ box.find('.result').text('Error') }
    });
}

function displayConfirmEmailForm(box){
    loadJS('auth/slovar/' + slovar(), function(){
        var popup = createPOPUPbox();
        popup.find('.popupBox').html('<form></form>');
        var form = popup.find('form');
        var html = '';

        html += '<div class="OktagonVerifyIcon">' + box.find('.OktagonVerifyIcon').html() + '</div>';
        html += '<input name="code" type="text" placeholder="' + slovar('Code') + '" required>';
        html += '<div>' + slovar('confim_code_text') + '</div>';
        html += '<hr><button class="button buttonBlue">' + slovar('Confirm_event') + '</button>';

        form.html(html);
        popup.fadeIn('fast', function(){
            form.find('[name=code]').focus();
        });

        form.submit(function(e){
            e.preventDefault();
            $.post("/crm/php/auth/auth.php?rand_code=1", {
                token: box.find('[name=token]').val(),
                username: box.find('[name=username]').val(),
                code: form.find('[name=code]').val()
            }, function(data){
                data = JSON.parse(data);
                if(!data){ return createAlert(form, 'Red', slovar('Wrong_code')) }
                if(data.error == 'PASSKEY'){ return loadJS('auth/passkey', function(){ login_passkey(box) })}
                window.location.href = "templates/home.php"
            });
        });
    });
}