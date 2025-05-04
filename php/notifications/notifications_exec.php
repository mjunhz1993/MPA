<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function get_notifications_COUNT($SQL){
	$A = $SQL->query("SELECT COUNT(*) FROM notifications WHERE notifications_user = '{$_SESSION['user_id']}'");
	if($A->num_rows == 0){ return array('0'); }
	while ($B = $A->fetch_row()){ return array($B[0]); }
}

function get_notifications($SQL){
	$WHERE = ["notifications_user = '{$_SESSION['user_id']}'"];
	if(isset($_GET['type']) && $_GET['time']){
		$WHERE[] = "notifications_type ='". SafeInput($SQL, $_GET['type']). "' ";
		$WHERE[] = "notifications_time = '". $time = SafeInput($SQL, $_GET['time']). "'";
	}
	$WHERE = implode(' AND ', $WHERE);
	$LIMIT = SafeInput($SQL, $_GET['num'] ?? 1);

	$data = [];
	$A = $SQL->query("
	SELECT 
		notifications_title AS subject,
		notifications_desc AS description,
		notifications_time AS time,
		notifications_type AS type,
		notifications_list AS buttons
	FROM notifications 
	WHERE $WHERE 
	ORDER BY notifications_time DESC 
	LIMIT $LIMIT
	");
	while ($B = $A->fetch_assoc()){
		$data[] = [
			'subject' => $B['subject'],
			'desc' => $B['description'],
			'descText' => trim(preg_replace('/\s+/', ' ', preg_replace('/<[^>]+>/', ' ', $B['description']))),
			'time' => $B['time'],
			'type' => $B['type'],
			'buttons' => json_decode($B['buttons'])
		];
	}
	return $data;
}

function delete_notification($SQL){
	$time = SafeInput($SQL, $_GET['time']);
	$A = $SQL->query("DELETE FROM notifications WHERE notifications_user = '{$_SESSION['user_id']}' AND notifications_time = '$time' LIMIT 1");
	if(!$A){ return ['error'=>$SQL->error]; }
	return true;
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['get_notifications_COUNT'])){ echo json_encode(get_notifications_COUNT($SQL)); }
	if(isset($_GET['get_notifications'])){ echo json_encode(get_notifications($SQL)); }
	if(isset($_GET['delete_notification'])){ echo json_encode(delete_notification($SQL)); }
}
?>