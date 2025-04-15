<div class="verticalToggleButtonsBox" id="configNav"></div>

<script>
    var data = {
        a:
        [
            {href: '/crm/templates/modules/admin/config/config', name: slovar('APP_info')}
        ]
    }
    if(user_id == 1){
        data['a'].push({href: '/crm/templates/modules/admin/config/html/module_access/module_access', name: slovar('Module_access')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/notifications/notifications', name: slovar('Notifications')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/config/config', name: slovar('Configurations')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/module/module', name: slovar('Modules')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/custom_files/custom_files', name: slovar('Custom_module')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/internal_crm_files/internal_crm_files', name: slovar('Internal_crm_files')});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/cron_jobs/cron_jobs', name: slovar('Cron_jobs')});
        data['a'].push({onclick: 'loadJS(\'file/fileExplorer\', ()=>open_fileExplorer())', name: slovar('File_explorer')});
        data['a'].push({onclick: 'loadJS(\'AI/config\', ()=>open_AI_config())', name: 'AI'});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/API/API', name: 'API'});
        data['a'].push({href: '/crm/templates/modules/admin/config/html/phpinfo/phpinfo', name: 'php_info'});
    }
    $('#configNav').append(HTML_verticalToggleButtons(data));
</script>