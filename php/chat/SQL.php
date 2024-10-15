<?php
if(!isset($chatSQL)){
	$A = $SQL->query("CREATE DATABASE IF NOT EXISTS chat_rooms CHARACTER SET utf8 COLLATE utf8_general_ci");
    $chatSQL = new mysqli($SQL_host, $SQL_username, $SQL_password, 'chat_rooms', $SQL_port);
    $chatSQL->set_charset('UTF8');
    if (mysqli_connect_errno()) {
        printf("Connect failed: %s\n", mysqli_connect_error());
        exit();
    }
}
?>