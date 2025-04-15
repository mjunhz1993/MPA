<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
$GLOBALS['remove'] = ['added','user_password_hash', 'passkey'];

function myself($SQL){
    $A = $SQL->query("
    SELECT * FROM user 
    JOIN role ON role_id = user_role_id
    WHERE user_id = '".$_SESSION['user_id']."' 
    LIMIT 1
    ");
    while ($B = $A->fetch_assoc()){
        $B = array_merge($_SESSION, $B);
        return array_diff_key($B, array_flip($GLOBALS['remove']));
    }
}

function get_all_users($SQL, $data = []){
    $A = $SQL->query("
    SELECT * FROM user 
    JOIN role ON role_id = user_role_id 
    WHERE user_active = 1
    ");
    while ($B = $A->fetch_assoc()){
        if($_SESSION['user_id'] == $B['user_id']){ $B['me'] = 1; }else{ $B['me'] = 0; }
        $data[] = array_diff_key($B, array_flip($GLOBALS['remove']));
    }
    return $data;
}

function get_all_roles($SQL, $data = []){
    $A = $SQL->query("SELECT * FROM role");
    while ($B = $A->fetch_assoc()){
        if($_SESSION['user_role_id'] == $B['role_id']){ $B['me'] = 1; }else{ $B['me'] = 0; }
        $data[] = array_diff_key($B, array_flip($GLOBALS['remove']));
    }
    return $data;
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['myself'])){ echo json_encode(myself($SQL)); }
    if(isset($_GET['get_all_users'])){ echo json_encode(get_all_users($SQL)); }
    if(isset($_GET['get_all_roles'])){ echo json_encode(get_all_roles($SQL)); }
}
?>