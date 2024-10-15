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

	if(isset($_GET['show_desc'])){
		$data = array();
		$user = $_GET['user'];
		$time = $_GET['time'];
		$A = $SQL->query("SELECT notifications_desc FROM notifications WHERE notifications_user = '$user' AND notifications_time = '$time' LIMIT 1");
        while ($B = $A->fetch_row()){ $data['desc'] = $B[0]; }
        echo json_encode($data);
	}

	if(isset($_GET['add_notification']) && isset($_POST['user'])){
		$data = array();
		$title = $_POST['title'];
		$desc = $_POST['desc'];
		$url = '';
		if($_POST['url'] != ''){ $url = 'LOOK|'.$_POST['url']; }
		$user = $_POST['user'];
    	for($i=0; $i<count($user); $i++){
    		addToNotifications($SQL, 'ADMIN_NOTE', $title, $desc, 'user', $user[$i], $url);
    	}
        echo json_encode($data);
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