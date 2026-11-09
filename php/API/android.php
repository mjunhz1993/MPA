<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('API/API'));


function get_android_app($INIconf) {
    return SEND((object) [
        'sendType' => 'POST',
        'event'    => 'android',
        'username' => $INIconf['API']['username'],
        'password' => $INIconf['API']['password'],

        'error' => function ($err) {
            return ['error' => $err];
        },

        'done' => function ($data) {
            return json_decode($data);
        }
    ]);
}

if (
    isset($_SESSION['user_id']) &&
    isset($_POST['get_android_app'])
) {
    echo json_encode(
        get_android_app($INIconf)
    );
    exit;
}
?>