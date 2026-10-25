<?php
function user_passkey_enabled($SQL, $user_id) {
    $A = sql_select(
        $SQL,
        "SELECT user_id FROM user WHERE user_id = ? AND user_passkey = 1 AND passkey != '' LIMIT 1",
        [(int)$user_id]
    );

    // Handle SQL errors or no matching user
    if (is_array($A) || $A->num_rows === 0) {
        return false;
    }

    return true;
}

function generate_challenge($byteLength = 32) {
    return base64_encode(random_bytes($byteLength));
}

function get_user_passkey($SQL) {
    $A = sql_select(
        $SQL,
        "SELECT passkey FROM user WHERE user_username = ? AND user_passkey = 1 LIMIT 1",
        [$_SESSION['user_username']]
    );

    // Handle SQL errors or no matching user
    if (is_array($A) || $A->num_rows === 0) {
        return false;
    }

    $B = $A->fetch_row();

    return $B[0];
}

function compare_user_passkey($SQL, $tstamp) {
    $username = $_SESSION['user_username'] ?? '';
    $passkey = $_POST['passkey'] ?? '';

    // Verify the user's passkey
    $A = sql_select(
        $SQL,
        "SELECT user_id FROM user WHERE user_username = ? AND passkey = ? LIMIT 1",
        [$username, $passkey]
    );

    if (is_array($A) || $A->num_rows === 0) {
        return ['error' => 'Wrong_passkey'];
    }

    // Connect to the user table
    $A = connect_to_user_table($SQL, $username, time());

    if (!$A || (is_object($A) && isset($A->num_rows) && $A->num_rows === 0)) {
        return ['error' => 'Login_error'];
    }

    while ($B = $A->fetch_row()) {
        if (!save_user_data_to_session($SQL, $username, $B)) {
            return ['error' => 'Login_error'];
        }

        return true;
    }

    return ['error' => 'Login_error'];
}

if(isset($_GET['generate_challenge'])){ echo generate_challenge(); }
?>