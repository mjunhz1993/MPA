<div class="verticalToggleButtonsBox" id="configNav"></div>

<script>
    var data = {
        a:
        [
            {href: '/crm/templates/modules/admin/config/config.php', name: slovar('APP_info')}
        ]
    }
    if(user_id == 1){
        data['a'].push({href: '/crm/templates/modules/admin/config/html/module_access/module_access.php', name: slovar('Module_access')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/notifications/notifications.php', name: slovar('Notifications')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/config/config.php', name: slovar('Configurations')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/module/module.php', name: slovar('Modules')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/custom_files/custom_files.php', name: slovar('Custom_module')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/internal_crm_files/internal_crm_files.php', name: slovar('Internal_crm_files')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/cron_jobs/cron_jobs.php', name: slovar('Cron_jobs')});
        data['a'].push({onclick: 'loadJS(\'file/fileExplorer\', function(){ open_fileExplorer() })', name: slovar('File_explorer')});
        data['a'].push({href: '/phpmyadmin', name: 'PhpMyAdmin', blank: true});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/phpinfo/phpinfo.php', name: 'php_info'});
    }
    $('#configNav').append(HTML_verticalToggleButtons(data));
</script>