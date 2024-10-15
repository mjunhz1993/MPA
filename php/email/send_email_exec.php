<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('email/send_email'));
include(loadPHP('email/SQL'));

if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){

	$user_id = $_SESSION['user_id'];

    if(isset($_GET['send_email'])){
        $data = array();
        if(isset($_POST['crm_email'])){ $user_id = $GLOBALS["config"]["crm_email"]; }
        else if(isset($_POST['custom_email'])){ $user_id = intval($_POST['custom_email']); }
        $data = send_email($SQL, $mailSQL, $user_id);
        echo json_encode($data);
    }

}

?>