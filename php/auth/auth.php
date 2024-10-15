<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('auth/slovar'));
include(loadPHP('auth/two_factor_auth'));
include(loadPHP('auth/passkey'));

function connect_to_user_table($SQL, $username, $blocked){
    return $SQL->query("SELECT user_id, user_username, user_email, user_password_hash, user_role_id, user_avatar, user_language, user_color, 
    role_name, role_event_view_access, role_module_filter_access
    FROM user LEFT JOIN role ON user_role_id = role_id
    WHERE user_username = '$username' AND user_active = 1 AND blocked < $blocked LIMIT 1");
}

function incorrect_password($SQL, $username, $blocked){
    $U = $SQL->query("UPDATE user SET blocked=blocked+1 WHERE user_username='$username' LIMIT 1");
    $T = $SQL->query("SELECT * FROM user WHERE user_username='$username' AND blocked >= 3 LIMIT 1");
    if($T->num_rows == 1){ $U = $SQL->query("UPDATE user SET blocked = $blocked + 300 WHERE user_username='$username' LIMIT 1"); }
    return ['error' => slovarLocal('wrong_credentials')];
}

function save_user_data_to_session($SQL, $username, $B){
    $T = $SQL->query("UPDATE user SET blocked=0 WHERE user_username='$username' LIMIT 1");
    if(!$T){ return false; }
    $_SESSION['user_id'] = $B[0];
    $_SESSION['user_username'] = $B[1];
    $_SESSION['user_email'] = $B[2];
    $_SESSION['user_password_hash'] = $B[3];
    $_SESSION['user_role_id'] = $B[4];
    $_SESSION['user_avatar'] = $B[5];
    $_SESSION['user_language'] = $B[6];
    $_SESSION['user_color'] = $B[7];
    $_SESSION['role_name'] = $B[8];
    $_SESSION['role_event_view_access'] = $B[9];
    $_SESSION['role_module_filter_access'] = $B[10];
    setcookie('login_username',$username,(time()+86400),'/');
    return true;
}

function login_user($SQL, $tstamp){
    $username = SafeInput($SQL, $_POST['username']);
    $blocked = time();
    $A = connect_to_user_table($SQL, $username, $blocked);
    if($A->num_rows == 0){ return ['error' => slovarLocal('unknown_username')]; }

    while($B = $A->fetch_row()){
        if(!password_verify($_POST['password'], $B[3])){ return incorrect_password($SQL, $username, $blocked); }
        $_SESSION['user_username'] = $B[1];

        if(user_two_factor_auth_enabled($SQL, $B[0])){
            $_SESSION['unknown_client'] = true;
            return ['error' => 'TFA'];
        }

        if(user_passkey_enabled($SQL, $B[0])){
            return ['error' => 'PASSKEY'];
        }
        
        if(save_user_data_to_session($SQL, $username, $B)){ return ['message' => 'success']; }
        return ['error' => SQLerror($SQL)];
    }
}

function change_to_user($SQL){
    if($_SESSION['user_id'] != 1 && !isset($_SESSION['allow_change_user'])){ return ['error' => 'Access_denied']; }
    $username = SafeInput($SQL, $_POST['username']);
    $A = connect_to_user_table($SQL, $username, time());
    while($B = $A->fetch_row()){
        if(!save_user_data_to_session($SQL, $username, $B)){ return ['error' => 'Login_error']; }
        $_SESSION['allow_change_user'] = true;
        return '';
    }
}

if(isset($_POST['token']) && $token == $_POST['token']){
    $tstamp = time() + 2678400;
    if(isset($_GET['login'])){ echo json_encode(login_user($SQL, $tstamp)); }
    if(isset($_GET['rand_code'])){ echo json_encode(submit_rand_code($SQL, $tstamp)); }
    if(isset($_GET['compare_passkey'])){ echo json_encode(compare_user_passkey($SQL, $tstamp)); }
}
if(isset($_GET['change_to_user'])){ echo json_encode(change_to_user($SQL)); }
if(isset($_GET['get_user_passkey'])){ echo get_user_passkey($SQL); }
if(isset($_GET['logout'])){ session_unset(); header("Location: /crm"); }
?>