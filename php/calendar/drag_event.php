<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/main/edit_in_table.php');

function change_start_date($SQL){
    $module = SafeInput($SQL, $_POST['module']);
    $id = SafeInput($SQL, $_POST['id']);
    $startCol = SafeInput($SQL, $_POST['startCol']);
    if(!isset($_POST['endCol']) || $_POST['endCol'] == ''){ $_POST['endCol'] = $startCol; }
    $endCol = SafeInput($SQL, $_POST['endCol']);
    $date = strtotime(SafeInput($SQL, $_POST['date']));

    get_other_columns_data($SQL, $module, $id);
    $days = ceil(($date - strtotime($_POST[$startCol.'_old'])) / (60 * 60 * 24));
    $_POST[$startCol] = date('Y-m-d H:i:s', strtotime($_POST[$startCol.'_old'].' '.$days.' days'));
    $_POST[$endCol] = date('Y-m-d H:i:s', strtotime($_POST[$endCol.'_old'].' '.$days.' days'));
    $_GET['module'] = $module;
    return edit_row($SQL, $_SESSION['user_id'], $_SESSION['user_role_id']);
}

if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    if(isset($_GET['change_start_date'])){ echo json_encode(change_start_date($SQL)); }
}
?>