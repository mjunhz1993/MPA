<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('notifications/notifications'));

if(isset($_SESSION['user_id'])){if($_SESSION['user_id'] == 1){

	if(isset($_GET['get_notifications'])){
		$data = array(); $i = 0;
		$A = $SQL->query("SELECT notifications_user,notifications_title,notifications_time,notifications_type,notifications_list,user_username
		FROM notifications
		LEFT JOIN user ON notifications_user = user_id
		ORDER BY notifications_time DESC LIMIT 100");
        while ($B = $A->fetch_row()){
        	$data[$i]['user'] = $B[0];
        	$data[$i]['title'] = $B[1];
        	$data[$i]['time'] = $B[2];
        	$data[$i]['type'] = $B[3];
        	$data[$i]['list'] = $B[4];
        	$data[$i]['username'] = $B[5];
        	$i++;
        }
        echo json_encode($data);
	}

	if(isset($_GET['show_nData'])){
		$data = array();
		$user = $_GET['user'];
		$time = $_GET['time'];
		$A = $SQL->query("
			SELECT notifications_desc AS 'desc', notifications_list AS buttons 
			FROM notifications 
			WHERE notifications_user = '$user' AND notifications_time = '$time' 
			LIMIT 1
		");
        while ($B = $A->fetch_assoc()){
        	$B['buttons'] = json_decode($B['buttons']);
        	echo json_encode($B);
        }
	}

	if(isset($_GET['add_notification']) && isset($_POST['user'])){
		foreach($_POST['user'] as $user){
			$data = [
			    'subject' => $_POST['title'],
			    'desc'    => $_POST['desc'],
			    'to'      => $user
			];
			if(isset($_POST['noButton'])){ $data['buttons'] = 'NONE'; }
			sendNotification($SQL, (object)$data);
    	}
        echo json_encode([]);
	}

	if(isset($_GET['delete_notification'])){
		$data = array();
		$user = $_GET['user'];
		$time = $_GET['time'];
		$A = $SQL->query("DELETE FROM notifications WHERE notifications_user = '$user' AND notifications_time = '$time' LIMIT 1");
        if(!$A){ $data['error'] = SQLerror($SQL); }
        echo json_encode($data);
	}

}}
?>