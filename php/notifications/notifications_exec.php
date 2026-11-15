<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function get_notifications_COUNT(mysqli $SQL): array {
    $A = sql_select($SQL, "
	SELECT COUNT(*) AS total
	FROM notifications
	WHERE 
		notifications_user = ? AND 
		notifications_type != 'READ'
	", [(int)$_SESSION['user_id']]);

    if(is_array($A) || !$A){ return ['0']; }

    $B = $A->fetch_assoc();
    return [$B['total'] ?? '0'];
}

function get_notifications($SQL){
	$WHERE = ["notifications_user = {$_SESSION['user_id']}"];

	if(isset($_GET['type']) && $_GET['time']){
		$WHERE[] = "notifications_type ='". SafeInput($SQL, $_GET['type']). "' ";
		$WHERE[] = "notifications_time = '". $time = SafeInput($SQL, $_GET['time']). "'";
	}

	$WHERE = implode(' AND ', $WHERE);
	$LIMIT = SafeInput($SQL, $_GET['num'] ?? 1);

	$data = [];
	$A = $SQL->query("
	SELECT
		user_username AS `from`,
		notifications_title AS subject,
		notifications_desc AS description,
		notifications_time AS time,
		notifications_type AS type,
		notifications_list AS buttons
	FROM notifications
	LEFT JOIN user ON user_id = notifications_from
	WHERE $WHERE 
	ORDER BY (notifications_type = 'READ') ASC, notifications_time DESC 
	LIMIT $LIMIT
	");

	while ($B = $A->fetch_assoc()){
		$data[] = [
			'from' => $B['from'] ?? 'system',
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

function tag_as_read_notification($SQL){
    $A = sql_update($SQL, "
        UPDATE notifications
        SET notifications_type = 'READ'
        WHERE 
            notifications_user = ? AND
            notifications_time = ? AND
            notifications_type != 'READ'
        LIMIT 1
    ", [
        $_SESSION['user_id'],
        $_GET['time']
    ]);

    if(is_array($A)){ return $A; }

    return true;
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
	if(isset($_GET['tag_as_read_notification'])){ echo json_encode(tag_as_read_notification($SQL)); }
	if(isset($_GET['delete_notification'])){ echo json_encode(delete_notification($SQL)); }
}
?>