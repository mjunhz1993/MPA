<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('AI/AI'));

if(isset($_SESSION['user_id'])){
    if(isset($_GET['loadIn_AI_models'])){ echo json_encode(loadIn_AI_models($SQL)); }
	if(isset($_POST['AI'])){ echo (run_AI()); }
}
?>