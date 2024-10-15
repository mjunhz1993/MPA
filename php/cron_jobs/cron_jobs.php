<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/connect.php');
date_default_timezone_set("UTC");
$CJtime = time();
$A = $SQL->query("SELECT name,extra,url,wait_for FROM cron_jobs WHERE tstamp <= '$CJtime' ORDER BY tstamp ASC LIMIT 1");
if($A->num_rows == 1){while ($B = $A->fetch_row()){
	$CJname = $B[0];
	$CJvalue = $B[1];
	$CJurl = $B[2];
	$CJtime = $CJtime + $B[3];
	$UP = $SQL->query("UPDATE cron_jobs SET tstamp = '$CJtime' WHERE name = '$CJname' LIMIT 1");
} include(loadPHP($CJurl)); }
$SQL->close();
?>