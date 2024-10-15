<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
$user_id = $_SESSION['user_id'];
if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){

	if(isset($_GET['add_widget'])){
		$data = array();
		if(isset($_POST['user_assing'])){ $user_id = SafeInput($SQL, $_POST['user_assing']); }
		
		if($_POST['type'] != ''){
			$type = SafeInput($SQL, $_POST['type']);
			$list = SafeInput($SQL, $_POST['list']);

			if($type == 'MODULE'){
				$A = $SQL->query("SELECT name FROM module WHERE module = '$list' LIMIT 1");
				while ($B = $A->fetch_row()){ $list = $list. ','. $B[0]; }
			}

			$A = $SQL->query("SELECT * FROM widget WHERE user_id = '$user_id'");
			if($A->num_rows == 0){
				$A = $SQL->query("INSERT INTO widget (user_id,order_num,type,list) VALUES ('$user_id','0','$type','$list')"); 
			    if(!$A){ $data['error'] = SQLerror($SQL); }
			}
			else{
				$A = $SQL->query("UPDATE widget SET type='$type', list='$list' WHERE user_id='$user_id' LIMIT 1"); 
			    if(!$A){ $data['error'] = SQLerror($SQL); }
			}
		}
		else{ $data['error'] = slovar('No_widget'); }
		echo json_encode($data);
	}


	if(isset($_GET['delete_widget'])){
		$data = array();
		$order_num = SafeInput($SQL, $_POST['order_num']);
		$A = $SQL->query("SELECT can_delete FROM module WHERE module = 'dashboard' LIMIT 1");
        while ($B = $A->fetch_row()){ $can_delete = explode(',', $B[0]); }

        if(in_array($_SESSION['user_role_id'], $can_delete)){
			$A = $SQL->query("DELETE FROM widget WHERE user_id = '$user_id' AND order_num = '$order_num' LIMIT 1"); 
		    if(!$A){ $data['error'] = SQLerror($SQL); }
		    else{
		    	$order_num = 0;
		    	$A = $SQL->query("SELECT order_num FROM widget WHERE user_id = '$user_id' ORDER BY order_num ASC");
				while ($B = $A->fetch_row()){
					$old_order_num = $B[0];
					$U = $SQL->query("UPDATE widget SET order_num = '$order_num' WHERE order_num = '$old_order_num' LIMIT 1");
				}
		    }
		}
		else{ $data['error'] = slovar('Access_denied'); }
		echo json_encode($data);
	}

}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['get_widgets'])){
		$data = array();
		$i=0;
		$A = $SQL->query("SELECT order_num,type,list,width FROM widget WHERE user_id = '$user_id' ORDER BY order_num ASC");
        while ($B = $A->fetch_row()){
        	$data[$i]['order_num'] = $B[0];
        	$data[$i]['type'] = $B[1];
        	$data[$i]['list'] = $B[2];
        	$data[$i]['width'] = $B[3];
        	$i++;
        }
        echo json_encode($data);
	}
}
?>