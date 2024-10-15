<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(isset($_SESSION['user_id'])){

	$user_id = $_SESSION['user_id'];

	function delete_notification($SQL, $user_id, $time){
		$A = $SQL->query("DELETE FROM notifications WHERE notifications_user = '$user_id' AND notifications_time = '$time' LIMIT 1");
		if(!$A){ return false; }
		return true;
	}

	if(isset($_GET['get_notifications_COUNT'])){
		$data = array('0');
		$A = $SQL->query("SELECT COUNT(*) FROM notifications WHERE notifications_user = '$user_id'");
		if($A->num_rows != 0){while ($B = $A->fetch_row()){ $data = array($B[0]); }}
		echo json_encode($data);
    }

    if(isset($_GET['get_notifications'])){
		$data = array();
		$WHERE = '';
		if(isset($_GET['type']) && $_GET['time']){
			$WHERE = "AND notifications_type ='". SafeInput($SQL, $_GET['type']). "' ";
			$WHERE .= "AND notifications_time = '". $time = SafeInput($SQL, $_GET['time']). "'";
		}
		$st = 0;
		$A = $SQL->query("SELECT notifications_title, notifications_desc, notifications_time, notifications_type, notifications_list
		FROM notifications WHERE notifications_user = '$user_id' $WHERE ORDER BY notifications_time DESC LIMIT 5");
		while ($B = $A->fetch_row()){
			$data[$st]['title'] = $B[0];
			if($WHERE == ''){ $data[$st]['desc'] = strip_tags($B[1]); }else{ $data[$st]['desc'] = $B[1]; }
			$data[$st]['time'] = $B[2];
			$data[$st]['type'] = $B[3];
			$data[$st]['list'] = explode('|',$B[4]);
			$st++;
		}
		echo json_encode($data);
    }

    if(isset($_GET['confirm_notifications'])){
		$data = array();
		$type = SafeInput($SQL, $_GET['type']);
		$time = SafeInput($SQL, $_GET['time']);
		$value = SafeInput($SQL, $_GET['value'] ?? '');
		if(!delete_notification($SQL, $user_id, $time)){ $data['error'] = SQLerror($SQL); }
		echo json_encode($data);
    }

    if(isset($_GET['delete_notification'])){
    	$data = array();
    	if(!delete_notification($SQL, $user_id, SafeInput($SQL, $_GET['time']))){ $data['error'] = SQLerror($SQL); }
    	echo json_encode($data);
    }

}
?>