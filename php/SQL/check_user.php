<?php
$path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');

$is_logged_in = !empty($_SESSION['user_id']);

// Not logged in: redirect to login page
if (!$is_logged_in && $path != '/crm') {

    $query = !empty($_SERVER['QUERY_STRING'])
        ? '?' . $_SERVER['QUERY_STRING']
        : '';

    header("Location: /crm" . $query);
    exit();
}

// Logged in: redirect login page to homepage
if ($is_logged_in && $path == '/crm') {
    header("Location: /crm/templates/home.php");
    exit();
}
?>