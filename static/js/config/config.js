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

function toggle_configMenu(el){ el.toggleClass('act').parent().find('.toggleConfigMenu').toggle() }

function deleteCompanyLogo(){
    $('.editForm').append('<input type="hidden" name="REMOVE_COMPANY_LOGO" value="1">');
    $('.editForm').submit();
}