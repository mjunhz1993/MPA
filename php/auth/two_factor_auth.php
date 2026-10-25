<?php
function user_two_factor_auth_enabled($SQL, $user_id) {
    if ($GLOBALS["config"]["crm_email"] == '') {
        return false;
    }

    $A = sql_select(
        $SQL,
        "SELECT user_id FROM user WHERE user_id = ? AND user_two_factor_auth = 1 LIMIT 1",
        [(int)$user_id]
    );

    // Handle SQL errors or no matching user
    if (is_array($A) || $A->num_rows === 0) {
        return false;
    }

    return true;
}

function submit_rand_code($SQL, $tstamp){
    $username = SafeInput($SQL, $_POST['username']);
    $A = connect_to_user_table($SQL, $username, time());
    if($A->num_rows == 0){ return false; }
    return check_rand_code($SQL, $A, $username, SafeInput($SQL, $_POST['code']));
}

function check_rand_code($SQL, $A, $username, $code) {
    if (!isset($_SESSION['default_rand_code'])){ return false; }

    // Initialize attempts counter
    if (!isset($_SESSION['default_rand_code_attempts'])) {
        $_SESSION['default_rand_code_attempts'] = 0;
    }

    // Stop after 5 attempts
    if ($_SESSION['default_rand_code_attempts'] >= 5) {
        unset($_SESSION['default_rand_code']);
        unset($_SESSION['default_rand_code_attempts']);
        unset($_SESSION['unknown_client']);
        return false;
    }

    // Check submitted code
    if (!hash_equals(
        (string) $_SESSION['default_rand_code'],
        (string) $code
    )) {
        $_SESSION['default_rand_code_attempts']++;
        return false;
    }

    // Correct code: consume it immediately
    unset($_SESSION['default_rand_code']);
    unset($_SESSION['default_rand_code_attempts']);
    unset($_SESSION['unknown_client']);

    while ($B = $A->fetch_row()) {
        if (user_passkey_enabled($SQL, $B[0])){ return ['error' => 'PASSKEY']; }
        if (!save_user_data_to_session($SQL, $username, $B)){ return false; }
        return true;
    }

    return false;
}
?>