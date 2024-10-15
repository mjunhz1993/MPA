<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(isset($_SESSION['user_id'])){
    if(isset($_GET['myself'])){ echo json_encode($_SESSION); }
}
?>