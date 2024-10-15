<?php 
if(empty($_SESSION['user_id']) && $_SERVER['REQUEST_URI'] != '/crm/'){ header("Location: /crm"); exit(); }
if(isset($_SESSION['user_id']) && $_SESSION['user_id'] != '' && $_SERVER['REQUEST_URI'] == '/crm/'){ header("Location: /crm/templates/home.php"); exit(); }
?>