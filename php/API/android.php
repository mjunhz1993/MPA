<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('API/API'));


function get_android_app($INIconf) {

    // Build the base URL
    $protocol = (
        !empty($_SERVER['HTTPS']) &&
        $_SERVER['HTTPS'] !== 'off'
    ) ? 'https' : 'http';

    $host = $_SERVER['HTTP_HOST'] ?? '';

    if ($host === '') {
        return ['error' => ['Invalid host', '']];
    }

    // Prepare ticket data without modifying the original POST array
    $data = $_POST;
    $data['url'] = $protocol . '://' . $host . '/';
    $data['email'] = $user['user_email'];

    // Send the ticket
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