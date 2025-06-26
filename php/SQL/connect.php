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

$CRM_logo = $INIconf['CRM']['logo'] ?? 'templates/svg/logo.svg';
$CRM_name = $INIconf['CRM']['name'] ?? 'Oktagon';
$GLOBALS['MAP']['HOME'] = $INIconf['CRM']['home'] ?? ($GLOBALS['MAP']['HOME'] ?? null);

mysqli_report(MYSQLI_REPORT_OFF);
$SQL = new mysqli(
    $INIconf['SQL']['host'],
    $INIconf['SQL']['username'],
    $INIconf['SQL']['password'],
    $INIconf['SQL']['database'],
    $INIconf['SQL']['port']
);
$SQL->set_charset('utf8mb4');
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