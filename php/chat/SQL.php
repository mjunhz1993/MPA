<?php
$GLOBALS['CHAT']['DB'] = $INIconf['SQL']['database'].'_chat_rooms';
if(!isset($chatSQL)){
    $A = $SQL->query("CREATE DATABASE IF NOT EXISTS ".$GLOBALS['CHAT']['DB']." CHARACTER SET utf8 COLLATE utf8_general_ci");
    if($SQL->error){
        echo json_encode(['error' => 'DB_not_found']);
        exit();
    }
    $chatSQL = new mysqli(
        $INIconf['SQL']['host'],
        $INIconf['SQL']['username'],
        $INIconf['SQL']['password'],
        $GLOBALS['CHAT']['DB'],
        $INIconf['SQL']['port']
    );
    $chatSQL->set_charset('UTF8');
    if(mysqli_connect_errno()){ exit(); }
}
?>