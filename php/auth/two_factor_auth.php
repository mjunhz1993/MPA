<?php
function user_two_factor_auth_enabled($SQL, $user_id){
    if($GLOBALS["config"]["crm_email"] == ''){ return false; }
    $A = $SQL->query("SELECT * FROM user WHERE user_id = '$user_id' AND user_two_factor_auth = '1' LIMIT 1");
    if(!$A || $A->num_rows == 0){ return false; }
    return true;
}

function submit_rand_code($SQL, $tstamp){
    $username = SafeInput($SQL, $_POST['username']);
    $A = connect_to_user_table($SQL, $username, time());
    if($A->num_rows == 0){ return false; }
    return check_rand_code($SQL, $A, $username, SafeInput($SQL, $_POST['code']));
}

function check_rand_code($SQL, $A, $username, $code){
    if(!isset($_SESSION['default_rand_code'])){ return false; }
    if($_SESSION['default_rand_code'] != $code){ return false; }
    while($B = $A->fetch_row()){
        unset($_SESSION['default_rand_code']);
        unset($_SESSION['unknown_client']);
        if(user_passkey_enabled($SQL, $B[0])){ return ['error' => 'PASSKEY']; }
        if(!save_user_data_to_session($SQL, $username, $B)){ return false; }
        return true;
    }
}
?>