<?php
$GLOBALS['MAIL']['DB'] = $SQL_db.'_mail_rooms';
if(!isset($mailSQL)){
	$A = $SQL->query("CREATE DATABASE IF NOT EXISTS ".$GLOBALS['MAIL']['DB']." CHARACTER SET utf8 COLLATE utf8_general_ci");
    $mailSQL = new mysqli($SQL_host, $SQL_username, $SQL_password, $GLOBALS['MAIL']['DB'], $SQL_port);
    $mailSQL->set_charset('UTF8');
    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
        exit();
    }
}
?>