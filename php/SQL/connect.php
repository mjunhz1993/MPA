<?php
if(isset($SQL)){ exit(); }
error_reporting(E_ALL ^ (E_NOTICE | E_DEPRECATED));

include($_SERVER['DOCUMENT_ROOT']. '/crm/php/loader.php');

if(empty($_SESSION['token'])){ $_SESSION['token'] = bin2hex(random_bytes(32)); } $token = $_SESSION['token'];
if(file_exists(loadPHP('user_data/config_file'))){ include(loadPHP('user_data/config_file')); }
include(loadPHP('SQL/globals'));
if(file_exists(loadPHP('user_data/app_version'))){ include(loadPHP('user_data/app_version')); }

if(isset($_SESSION['user_language'])){ include(loadPHP('slovar/'.$_SESSION['user_language'])); }
else if(isset($GLOBALS["config"]['defaultLanguage'])){ include(loadPHP('slovar/'.$GLOBALS["config"]['defaultLanguage'])); }
else{ include(loadPHP('slovar/en')); }

$INIconf = parse_ini_file('conf.ini', true);
$SQL_host = $INIconf['SQL']['host'];
$SQL_username = $INIconf['SQL']['username'];
$SQL_password = $INIconf['SQL']['password'];
$SQL_db = $INIconf['SQL']['database'];
$SQL_port = $INIconf['SQL']['port'];

$CRM_logo = 'templates/svg/logo.svg';
if(isset($INIconf['CRM']['logo'])){ $CRM_logo = $INIconf['CRM']['logo']; }
$CRM_name = 'Oktagon';
if(isset($INIconf['CRM']['name'])){ $CRM_name = $INIconf['CRM']['name']; }

mysqli_report(MYSQLI_REPORT_OFF);
$SQL = new mysqli($SQL_host, $SQL_username, $SQL_password, $SQL_db, $SQL_port);
$SQL->set_charset('UTF8');
if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}

if(!function_exists('SafeInput')){function SafeInput($SQL, $input, $keepHTML = false){
    if(!$keepHTML){
        $input = strip_tags($input);
        $remove_words = array('"',"'");
        for($i=0; $i<count($remove_words); $i++){ $input = str_ireplace($remove_words[$i], '', $input); }
    }
    $input = $SQL->real_escape_string($input);
    return $input;
}}

if(!function_exists('SQLerror')){function SQLerror($SQL){ return [slovar('Error_'. $SQL->errno),$SQL->error]; }}
?>