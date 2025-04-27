<!DOCTYPE html><html><head></head><body>
<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
date_default_timezone_set("UTC");
$currentYear = date('Y', time());

// --------------------- HTACCESS

$filename = $_SERVER['DOCUMENT_ROOT']. '/crm/.htaccess';
$newFile = fopen($filename, "w");
$t = 'Options -Indexes'. PHP_EOL;
$t .= 'ErrorDocument 403 /crm/templates/common/403.php'. PHP_EOL;
$t .= 'ErrorDocument 404 /crm/templates/common/404.php'. PHP_EOL. PHP_EOL;
$t .= '# file uploading'. PHP_EOL;
$t .= 'php_value upload_max_filesize 30M'. PHP_EOL;
$t .= 'php_value post_max_size 100M'. PHP_EOL. PHP_EOL;
$t .= '# hide htaccess'. PHP_EOL;
$t .= '<files ~ "^.*\.([Hh][Tt][Aa])">'. PHP_EOL;
$t .= 'order allow,deny'. PHP_EOL;
$t .= 'deny from all'. PHP_EOL;
$t .= 'satisfy all'. PHP_EOL;
$t .= '</files>'. PHP_EOL. PHP_EOL;
$t .= '# hide .php'. PHP_EOL;
$t .= 'RewriteEngine On'. PHP_EOL;
$t .= 'RewriteCond %{REQUEST_FILENAME}.php -f'. PHP_EOL;
$t .= 'RewriteRule ^(.+)$ $1.php [L]'. PHP_EOL. PHP_EOL;
$t .= '# display no errors to user'. PHP_EOL;
$t .= 'php_flag display_startup_errors off'. PHP_EOL;
$t .= 'php_flag display_errors off'. PHP_EOL;
$t .= 'php_flag html_errors off'. PHP_EOL. PHP_EOL;
$t .= '# log errors to file'. PHP_EOL;
$t .= 'php_flag log_errors on'. PHP_EOL;
$t .= 'php_value error_log '. $_SERVER['DOCUMENT_ROOT']. '/crm/PHP_errors.log'. PHP_EOL. PHP_EOL;
$t .= '# prevent access to PHP error log'. PHP_EOL;
$t .= '<Files PHP_errors.log>'. PHP_EOL;
$t .= 'Order allow,deny'. PHP_EOL;
$t .= 'Deny from all'. PHP_EOL;
$t .= 'Satisfy All'. PHP_EOL;
$t .= '</Files>'. PHP_EOL. PHP_EOL;
$t .= '# prevent access to conf ini'. PHP_EOL;
$t .= '<Files conf.ini>'. PHP_EOL;
$t .= 'Order allow,deny'. PHP_EOL;
$t .= 'Deny from all'. PHP_EOL;
$t .= '</Files>'. PHP_EOL. PHP_EOL;
$t .= '# BEGIN Expire headers'. PHP_EOL;
$t .= '<IfModule mod_expires.c>'. PHP_EOL;
$t .= 'ExpiresActive on'. PHP_EOL;
$t .= 'ExpiresDefault "access plus 2 days"'. PHP_EOL;
$t .= 'ExpiresByType image/jpg "access plus 1 month"'. PHP_EOL;
$t .= 'ExpiresByType image/svg+xml "access 1 month"'. PHP_EOL;
$t .= 'ExpiresByType image/gif "access plus 1 month"'. PHP_EOL;
$t .= 'ExpiresByType image/jpeg "access plus 1 month"'. PHP_EOL;
$t .= 'ExpiresByType image/png "access plus 1 month"'. PHP_EOL;
$t .= 'ExpiresByType text/css "access plus 1 month"'. PHP_EOL;
$t .= 'ExpiresByType text/javascript "access plus 1 month"'. PHP_EOL;
$t .= 'ExpiresByType application/javascript "access plus 1 month"'. PHP_EOL;
$t .= 'ExpiresByType application/x-shockwave-flash "access plus 1 month"'. PHP_EOL;
$t .= 'ExpiresByType image/ico "access plus 1 month"'. PHP_EOL;
$t .= 'ExpiresByType image/x-icon "access plus 1 month"'. PHP_EOL;
$t .= 'ExpiresByType text/html "access plus 600 seconds"'. PHP_EOL;
$t .= '</IfModule>'. PHP_EOL;
fwrite($newFile, $t);
fclose($newFile);

// --------------------- MODULE

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'module' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE module
    (
        module VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE,
        category VARCHAR(255),
        url TEXT,
        custom TINYINT DEFAULT 1,
        order_num INT(11),
        can_view TEXT,
        can_add TEXT,
        can_edit TEXT,
        can_delete TEXT,
        icon VARCHAR(100),
        active TINYINT DEFAULT 1,
        archive VARCHAR(100) DEFAULT '',
        notification_config TEXT,
        accessories TEXT

    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>module</b> je uspešno naložena</p><br>"; }
    
    /* INSERT ROWS INTO MODULE */
    $A = $SQL->query("INSERT INTO module (module,name,category,url,custom,order_num,icon,active,archive,notification_config) VALUES 
    ('dashboard','Dashboard','Desktop','home','0','1','dashboard','1','',''),
    ('calendar','Calendar','Desktop','modules/calendar/calendar','0','2','calendar','1','',''),
    ('mail_rooms','Email','Desktop','modules/email/email','0','3','email','0','',''),
    ('event','Events','Desktop','','0','4','calendar','1','',''),
    ('analytics','Analytics','Desktop','modules/analytics/analytics','0','5','analytics','1','',''),

    ('settings','Configurations','Administration','modules/admin/config/config','0','6','settings','1','',''),
    ('user','Users','Administration','','0','7','user','1','',''),
    ('email_accounts','Email_accounts','Administration','','0','8','email','0','',''),
    ('role','Roles','Administration','','0','9','user','1','',''),
    ('diary','Diary','Administration','','0','10','clock','1','$currentYear',''),
    ('campaign','Campaigns','Desktop','modules/campaign/campaign','0','11','target','0','',''),
    ('chat','Chat','Administration','modules/chat/chat','0','12','chat','0','','')
    ");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>vrstice so bile naložene v <b>module</b></p><br>"; }
}

// --------------------- MODULE COLUMNS

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'module_columns' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE module_columns
    (
        column_id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100),
        category VARCHAR(100),
        module VARCHAR(100), INDEX(module),
        FOREIGN KEY (module) REFERENCES module(module) ON DELETE CASCADE,
        custom TINYINT DEFAULT 1,
        order_num INT(11),
        can_view TEXT,
        can_edit TEXT,
        type VARCHAR(100),
        length INT(11),
        special TINYINT DEFAULT 0,
        preselected_option TEXT,
        list TEXT,
        mandatory TINYINT DEFAULT 0,
        show_in_create TINYINT DEFAULT 0,
        editable TINYINT DEFAULT 1,
        width INT(11) DEFAULT 100,
        columnWidth INT(11) DEFAULT 0,
        active TINYINT DEFAULT 1
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>module_columns</b> je uspešno naložena</p><br>"; }
    
    /* INSERT ROWS INTO MODULE COLUMNS */
    
    $A = $SQL->query("INSERT INTO module_columns (column_id,name,category,module,custom,order_num,type,length,special,preselected_option,list,mandatory,show_in_create,editable,width,active) VALUES 
    ('user_id','id','General','user','0','0','ID','0','1','','','0','0','0','100','1'),
    ('user_avatar','Avatar','General','user','0','1','FILE','0','0','','IMG,1','0','0','1','100','1'),
    ('user_username','Username','General','user','0','2','VARCHAR','20','1','','PRIMARY','1','0','1','100','1'),
    ('user_password_hash','Password','Password','user','0','3','PASSWORD','255','0','','','1','0','1','100','0'),
    ('user_email','Email','General','user','0','4','VARCHAR','120','1','','EMAIL','1','0','1','100','1'),
    ('user_language','Language','General','user','0','5','SELECT','2','0','','sl,Slovenian|en,English','1','0','1','100','1'),
    ('user_role_id','Role','General','user','0','6','JOIN_ADD','100','0','','user_role_id,role,role_id|','1','0','1','100','1'),
    ('user_color','Color','General','user','0','7','VARCHAR','100','0','','COLOR','0','0','1','100','1'),
    ('user_active','Active','General','user','0','8','CHECKBOX','0','0','0','','0','0','1','100','1'),

    ('email_accounts_id','id','General','email_accounts','0','0','ID','0','1','','','0','0','0','100','1'),
    ('email_accounts_user','Assigned_to','General','email_accounts','0','1','JOIN_ADD','100','1','','email_accounts_user,user,user_id|','1','0','1','50','1'),
    ('email_accounts_email','Email','General','email_accounts','0','2','VARCHAR','120','1','','EMAIL','1','0','1','50','1'),
    ('email_accounts_password','Email_password','General','email_accounts','0','3','VARCHAR','100','0','','','1','0','1','50','0'),
    ('email_accounts_from','From_name','General','email_accounts','0','4','VARCHAR','100','0','','','0','0','1','50','1'),
    ('email_accounts_reply','Reply_email','General','email_accounts','0','5','VARCHAR','120','0','','','0','0','1','50','1'),
    ('email_accounts_replyname','Reply_name','General','email_accounts','0','6','VARCHAR','100','0','','','0','0','1','50','1'),
    ('email_accounts_imap','Imap','Receive','email_accounts','0','7','VARCHAR','100','0','','','1','0','1','50','1'),
    ('email_accounts_imap_port','Imap_port','Receive','email_accounts','0','8','INT','20','0','','','1','0','1','50','1'),
    ('email_accounts_imap_flag','Imap_extra','Receive','email_accounts','0','9','VARCHAR','100','0','','','0','1','1','100','1'),
    ('email_accounts_smtp','Smtp','Send','email_accounts','0','10','VARCHAR','100','0','','','1','0','1','50','1'),
    ('email_accounts_smtp_port','Smtp_port','Send','email_accounts','0','11','INT','20','0','','','1','0','1','50','1'),
    ('email_accounts_smtp_flag','Smtp_extra','Send','email_accounts','0','12','VARCHAR','100','0','','','0','1','1','100','1'),
    ('email_accounts_save_send_email','Save_send_email','Send','email_accounts','0','13','CHECKBOX','0','0','0','','0','0','1','100','1'),
    ('email_accounts_body','Email_body','Send','email_accounts','0','14','TEXTAREA','0','0','','','0','0','1','100','1'),
    
    ('role_id','id','General','role','0','0','ID','0','1','','','0','0','0','100','1'),
    ('role_name','Name','General','role','0','1','VARCHAR','50','0','','PRIMARY','1','0','1','100','1'),
    ('role_event_view_access','Event_view_access','General','role','0','2','CHECKBOX','0','0','0','','0','0','1','50','1'),
    ('role_module_filter_access','Module_filter_access','General','role','0','3','CHECKBOX','0','0','0','','0','0','1','50','1'),
    ('role_user','Users','General','role','0','4','JOIN_GET','100','0','','role_id,user,user_role_id','0','0','0','100','1'),
    
    ('event_id','id','General','event','0','0','ID','0','1','','','0','0','0','100','1'),
    ('event_subject','Subject','General','event','0','1','VARCHAR','100','0','','PRIMARY','1','0','1','100','1'),
    ('event_assigned','Assigned_to','General','event','0','2','JOIN_ADD','100','0','','event_assigned,user,user_id|','0','2','1','50','1'),
    ('event_share','Share_with','General','event','0','3','VARCHAR','255','0','','MULTISELECT','0','2','1','50','1'),
    ('event_start_date','Start_date','General','event','0','4','DATETIME','0','0','','min,event_end_date','1','0','1','50','1'),
    ('event_end_date','End_date','General','event','0','5','DATETIME','0','0','','max,event_start_date','1','0','1','50','1'),
    ('event_color','Color','General','event','0','6','VARCHAR','20','0','','COLOR','1','0','1','100','1'),
    
    ('diary_id','id','General','diary','0','0','ID','0','1','','','0','0','0','100','1'),
    ('diary_subject','Subject','General','diary','0','1','VARCHAR','100','0','','PRIMARY','1','0','1','50','1'),
    ('diary_user','Users','General','diary','0','2','JOIN_ADD','100','0','','diary_user,user,user_id|','1','0','1','100','1'),
    ('diary_module','Module','General','diary','0','3','VARCHAR','255','0','','','1','0','1','50','1'),
    ('diary_row','Row','General','diary','0','4','ID','100','0','','','1','0','1','50','1'),
    ('diary_description','Description','General','diary','0','5','TEXTAREA','0','0','','','1','0','1','100','1'),
    ('diary_time','Time','General','diary','0','6','DATETIME','0','0','','','1','0','1','100','1')
    ");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>vrstice so bile naložene v <b>module_columns</b></p><br>"; }
}

// --------------------- FILES

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'file' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE file
    (
        `row` INT(100) UNSIGNED, INDEX(`row`),
        column_id VARCHAR(100),
        tstamp INT(100),
        type VARCHAR(100),
        name TEXT
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>file</b> je uspešno naložena</p><br>"; }
}

// --------------------- DOWNLOADS

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'downloads' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE downloads
    (
        name VARCHAR(255) PRIMARY KEY,
        path VARCHAR(255) UNIQUE,
        project VARCHAR(255), INDEX(project),
        tstamp INT(255)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>downloads</b> je uspešno naložena</p><br>"; }
}

// --------------------- FILTER

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'filter' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE filter
    (
        id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        module VARCHAR(255),
        name VARCHAR(100),
        order_by TEXT,
        column_id TEXT,
        public TINYINT DEFAULT 0,
        user_id INT(100),
        share TEXT
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>filter</b> je uspešno naložena</p><br>"; }
}

// --------------------- FILTER CONDITIONS

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'filter_conditions' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE filter_conditions
    (
        filter_id INT(100) UNSIGNED, INDEX(filter_id),
        FOREIGN KEY (filter_id) REFERENCES filter(id) ON DELETE CASCADE,
        group_num INT(100),
        type VARCHAR(45),
        column_id VARCHAR(100),
        condition_type VARCHAR(100),
        value VARCHAR(255)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>filter_conditions</b> je uspešno naložena</p><br>"; }
}

// --------------------- FILTER USERS

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'filter_users' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE filter_users
    (
        filter_id INT(100) UNSIGNED,
        FOREIGN KEY (filter_id) REFERENCES filter(id) ON DELETE CASCADE,
        module VARCHAR(255), INDEX(module),
        user_id INT(100)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>filter_users</b> je uspešno naložena</p><br>"; }
}

// --------------------- ROLE

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'role' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE role
    (
        role_id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        added INT(100), INDEX(added),
        role_name VARCHAR(50),
        role_event_view_access TINYINT DEFAULT 0,
        role_module_filter_access TINYINT DEFAULT 0
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>role</b> je uspešno naložena</p><br>"; }
}

/* ADD ADMIN ROLE */

$A = $SQL->query("SELECT * FROM role WHERE role_id = 1 LIMIT 1");
if($A->num_rows == 0){
    $A = $SQL->query("INSERT INTO role (role_id,added,role_name,role_event_view_access,role_module_filter_access) VALUES ('1','1','Admin','1','1')");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'><b>ADMIN role</b> je bil naložen</p><br>"; }
}

// --------------------- USER

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'user' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE user
    (
        user_id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        added INT(100), INDEX(added),
        blocked INT(100) DEFAULT 0,
        user_username VARCHAR(20) UNIQUE,
        user_password_hash VARCHAR(255),
        user_email VARCHAR(120) UNIQUE,
        user_role_id INT(100) UNSIGNED, INDEX(user_role_id), FOREIGN KEY (user_role_id) REFERENCES role(role_id) ON DELETE RESTRICT ON UPDATE CASCADE,
        user_avatar VARCHAR(120),
        user_language VARCHAR(2),
        user_color VARCHAR(100) DEFAULT '#2d70b6',
        user_active TINYINT DEFAULT 1
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>user</b> je uspešno naložena</p><br>"; }
}

/* ADD ADMIN USER */

$A = $SQL->query("SELECT * FROM user WHERE user_id = 1 LIMIT 1");
if($A->num_rows == 0){
    $pass = password_hash('1', PASSWORD_DEFAULT);
    $A = $SQL->query("INSERT INTO user (user_id,added,user_username,user_email,user_password_hash,user_role_id,user_language) VALUES ('1','1','admin','admin@admin.si','$pass','1','sl')");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'><b>ADMIN user</b> je bil naložen</p><br>"; }
}

// --------------------- E-MAIL ACCOUNTS

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'email_accounts' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE email_accounts
    (
        email_accounts_id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        added INT(100), INDEX(added),
        email_accounts_user INT(100) UNSIGNED UNIQUE, FOREIGN KEY (email_accounts_user) REFERENCES user(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
        email_accounts_email VARCHAR(120) UNIQUE,
        email_accounts_password VARCHAR(100),
        email_accounts_from VARCHAR(100),
        email_accounts_reply VARCHAR(120),
        email_accounts_replyname VARCHAR(100),
        email_accounts_imap VARCHAR(100),
        email_accounts_imap_port INT(20),
        email_accounts_imap_flag VARCHAR(100),
        email_accounts_smtp VARCHAR(100),
        email_accounts_smtp_port INT(20),
        email_accounts_smtp_flag VARCHAR(100),
        email_accounts_save_send_email TINYINT DEFAULT 1,
        email_accounts_udate INT(255) DEFAULT 0,
        email_accounts_uid INT(255) DEFAULT 0,
        email_accounts_body TEXT
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>email_accounts</b> je uspešno naložena</p><br>"; }
}

// --------------------- WIDGETS

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'widget' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE widget
    (
        user_id INT(100) UNSIGNED, INDEX(user_id),
        FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
        order_num INT(11),
        type VARCHAR(100),
        list TEXT,
        width INT(11) DEFAULT 100
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>widget</b> je uspešno naložena</p><br>"; }
}

// --------------------- EVENT

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'event' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE event
    (
        event_id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        added INT(100), INDEX(added),
        event_subject VARCHAR(100),
        event_assigned INT(100) UNSIGNED, INDEX(event_assigned), FOREIGN KEY (event_assigned) REFERENCES user(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
        event_share VARCHAR(255),
        event_start_date DATETIME,
        event_end_date DATETIME,
        event_color VARCHAR(20)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>event</b> je uspešno naložena</p><br>"; }
}

// --------------------- DIARY

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'diary' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE diary
    (
        diary_id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        added INT(100), INDEX(added),
        diary_subject VARCHAR(100),
        diary_user INT(100) UNSIGNED, INDEX(diary_user), FOREIGN KEY (diary_user) REFERENCES user(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
        diary_module VARCHAR(255),
        diary_row VARCHAR(100),
        diary_description BLOB,
        diary_time DATETIME,
        diarytype VARCHAR(100), INDEX diary_search (diary_module,diarytype,diary_time)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>diary</b> je uspešno naložena</p><br>"; }
}

// --------------------- CONVERSATION

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'conversation' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE conversation
    (
        id INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(100), INDEX(Subject),
        module VARCHAR(255),
        `row` INT(100),
        conversation_time DATETIME,
        admin TEXT
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>conversation</b> je uspešno naložena</p><br>"; }
}

// --------------------- CONVERSATION USER

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'conversation_user' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE conversation_user
    (
        conversation_id INT(100) UNSIGNED, INDEX(conversation_id), 
        FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
        conversation_user INT(100) UNSIGNED, INDEX(conversation_user), 
        FOREIGN KEY (conversation_user) REFERENCES user(user_id) ON DELETE CASCADE
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>conversation_user</b> je uspešno naložena</p><br>"; }
}

// --------------------- NOTIFICATIONS

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'notifications' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE notifications
    (
        notifications_user INT(100) UNSIGNED, INDEX(notifications_user), 
        FOREIGN KEY (notifications_user) REFERENCES user(user_id) ON DELETE CASCADE,
        notifications_title VARCHAR(100),
        notifications_desc TEXT,
        notifications_time DATETIME,
        notifications_type VARCHAR(100),
        notifications_list TEXT
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>notifications</b> je uspešno naložena</p><br>"; }
}

// --------------------- MODULE ADDONS

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'module_addons' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE module_addons
    (
        module VARCHAR(100), INDEX(module),
        FOREIGN KEY (module) REFERENCES module(module) ON DELETE CASCADE,
        addon TEXT,
        tstamp INT(100)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>module_addons</b> je uspešno naložena</p><br>"; }
}

/* ADD EVENT MULTISELECT ADDON */

$A = $SQL->query("SELECT * FROM module_addons WHERE module = 'event' AND addon = 'varchar_multiselect|event_share|user' LIMIT 1");
if($A->num_rows == 0){
    $A = $SQL->query("INSERT INTO module_addons (module,addon,tstamp) VALUES ('event','varchar_multiselect|event_share|user','1')");
    if(!$A){ echo "<p style='color: red;'>ni bilo možno naložiti <b>EVENT addon</b></p><br>"; }
    else{ echo "<p style='color: green;'><b>EVENT addon</b> je bil naložen</p><br>"; }
}

// --------------------- MODULE AUTOMATIONS

$A = $SQL->query("
    SELECT * FROM information_schema.tables 
    WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = 'module_automations' LIMIT 1
");
if($A->num_rows == 0){
    $A = $SQL->query("CREATE TABLE module_automations
    (
        order_num INT(20) DEFAULT 0,
        module VARCHAR(100), INDEX(module),
        FOREIGN KEY (module) REFERENCES module(module) ON DELETE CASCADE,
        auto_command TEXT,
        action VARCHAR(100)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ echo $SQL->error.'<br>'; }
    else{ echo "<p style='color: green;'>tabela <b>module_automations</b> je uspešno naložena</p><br>"; }
}
?>
</body></html>