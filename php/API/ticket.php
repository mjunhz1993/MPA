<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('API/API'));


function send_ticket($SQL, $INIconf) {
    // Validate the logged-in user
    if (
        !isset($_SESSION['user_id']) ||
        !is_numeric($_SESSION['user_id'])
    ) {
        return ['error' => ['Unauthorized', '']];
    }

    $user_id = (int) $_SESSION['user_id'];

    // Get the user's email using your new SQL function
    $result = sql_select(
        $SQL,
        "SELECT user_email FROM user WHERE user_id = ? LIMIT 1",
        [$user_id]
    );

    if (is_array($result)) {
        return $result;
    }

    $user = $result->fetch_assoc();
    $result->free();

    if (!$user) {
        return ['error' => ['User not found', '']];
    }

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
        'event'    => 'ticket',
        'username' => $INIconf['API']['username'],
        'password' => $INIconf['API']['password'],
        'data'     => $data,

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
    isset($_POST['send_ticket'])
) {
    echo json_encode(
        send_ticket($SQL, $INIconf)
    );
    exit;
}
?>