<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(isset($_SESSION['user_id'])){
	function DURS(){ return file_get_contents('https://app.oktagon-it.si/crm/php/downloads/durs.php?s='.urlencode($_GET['search'])); }
	if(isset($_GET['DURS'], $_GET['search'])){ echo DURS(); }
}
?>