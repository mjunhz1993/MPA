$('.editForm').unbind().on('submit', function(e){
    var form = $(this);
    var formData = new FormData(form[0]);
    e.preventDefault();
    $.ajax({
        url: '/crm/php/admin/config.php?create_config_file=1', 
        type: 'post', data: formData, contentType: false, processData: false,
        success: function(data){ console.log(data);
            data = JSON.parse(data);
            if(data.error){ return createAlert(form, 'Red', data.error) }
            location.reload()
        }
    })
});

function deleteCompanyLogo(){
    $('.editForm').append('<input type="hidden" name="REMOVE_COMPANY_LOGO" value="1">');
    $('.editForm').submit();
}

function toggle_phpmyadmin(el){
    $.post('/crm/php/admin/config.php?toggle_phpmyadmin=1', {csrf_token:$('[name=csrf_token]').val()}, function(data){
        data = JSON.parse(data);
        if(data.error){ return createAlert(el.parent(), 'Red', data.error) }
        check_phpmyadmin_file()
    })
}
function check_phpmyadmin_file(){
    $.post('/crm/php/admin/config.php?check_phpmyadmin_file=1', {csrf_token:$('[name=csrf_token]').val()}, function(data){
        var b = $('#phpmyadmin_b');
        if(JSON.parse(data) == false){
            b.removeClass('buttonBlue').addClass('buttonGrey');
            return b.find('svg').hide()
        }
        b.removeClass('buttonGrey').addClass('buttonBlue');
        b.find('svg').show()
    })
}
check_phpmyadmin_file();