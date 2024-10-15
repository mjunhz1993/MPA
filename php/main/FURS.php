<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(isset($_SESSION['user_id'])){
	function FURS(){ return file_get_contents('https://oktagon-it.com/crm/php/downloads/furs.php?s='.urlencode($_GET['search'])); }
	if(isset($_GET['search_FURS'])){ echo FURS(); }
}
?>