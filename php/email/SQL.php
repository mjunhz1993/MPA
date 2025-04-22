<?php
$GLOBALS['MAIL']['DB'] = $INIconf['SQL']['database'].'_mail_rooms';
if(!isset($mailSQL)){
	$A = $SQL->query("CREATE DATABASE IF NOT EXISTS ".$GLOBALS['MAIL']['DB']." CHARACTER SET utf8 COLLATE utf8_general_ci");
    $mailSQL = new mysqli(
        $INIconf['SQL']['host'],
        $INIconf['SQL']['username'],
        $INIconf['SQL']['password'],
        $GLOBALS['MAIL']['DB'],
        $INIconf['SQL']['port']
    );
    $mailSQL->set_charset('UTF8');
    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
        exit();
    }
}
?>