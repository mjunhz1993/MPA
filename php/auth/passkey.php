<?php
function user_passkey_enabled($SQL, $user_id){
    $A = $SQL->query("SELECT * FROM user WHERE user_id = '$user_id' AND user_passkey = '1' AND passkey != '' LIMIT 1");
    if(!$A || $A->num_rows == 0){ return false; }
    return true;
}

function generate_challenge($byteLength = 32) {
    return base64_encode(random_bytes($byteLength));
}

function get_user_passkey($SQL){
    $A = $SQL->query("SELECT passkey FROM user WHERE user_username = '".SafeInput($SQL, $_SESSION['user_username'])."' AND user_passkey = '1' LIMIT 1");
    if(!$A || $A->num_rows == 0){ return false; }
    while ($B = $A->fetch_row()){ return $B[0]; }
}

function compare_user_passkey($SQL, $tstamp){
    $username = SafeInput($SQL, $_SESSION['user_username']);
    $passkey = SafeInput($SQL, $_POST['passkey']);
    $A = $SQL->query("SELECT * FROM user WHERE user_username = '$username' AND passkey = '$passkey' LIMIT 1");
    if($A->num_rows == 0){ return ['error' => 'Wrong_passkey']; }
    $A = connect_to_user_table($SQL, SafeInput($SQL, $_SESSION['user_username']), time());
    if($A->num_rows == 0){ return ['error' => 'Login_error']; }
    while($B = $A->fetch_row()){
        if(!save_user_data_to_session($SQL, $username, $B)){ return ['error' => 'Login_error']; }
        return true;
    }
}

if(isset($_GET['generate_challenge'])){ echo generate_challenge(); }
?>