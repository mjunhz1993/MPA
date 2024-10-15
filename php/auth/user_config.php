<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('auth/two_factor_auth'));
include(loadPHP('auth/passkey'));

if(isset($_SESSION['user_id'])){

	function check_security($SQL, $data = array()){
		if(user_two_factor_auth_enabled($SQL, $_SESSION['user_id'])){ array_push($data, 'two_factor_auth'); }
		$passkey = get_user_passkey($SQL);
		if($passkey !== false){
			array_push($data, 'passkey');
			array_push($data, ['passkey'=>$passkey]);
		}
		return $data;
	}

	function toggle_security($SQL){
		if($_GET['toggle'] == 'two_factor_auth'){ return toggle_two_factor_auth($SQL); }
		if($_GET['toggle'] == 'passkey'){ return toggle_passkey($SQL); }
		return false;
	}

	// ----------------- two factor auth

	function toggle_two_factor_auth($SQL){
		if($GLOBALS["config"]["crm_email"] == ''){ return ['error' => 'No_email_set']; }
	    $A = $SQL->query("SELECT * FROM module_columns WHERE column_id = 'user_two_factor_auth' AND module = 'user' LIMIT 1");
	    if($A->num_rows == 0){if(!add_two_factor_auth_column($SQL)){ return ['error' => SQLerror($SQL)]; }}
	    $A = $SQL->query("UPDATE user SET user_two_factor_auth = 1 - user_two_factor_auth WHERE user_id = '".$_SESSION['user_id']."' LIMIT 1");
	    if(!$A){ return ['error' => SQLerror($SQL)]; }
	    return true;
	}

	function add_two_factor_auth_column($SQL){
		$A = $SQL->query("ALTER TABLE user ADD COLUMN user_two_factor_auth TINYINT DEFAULT 0");
		if(!$A){ return false; }
		$A = $SQL->query("INSERT INTO module_columns 
        (column_id,name,category,module,order_num,type,length,list,preselected_option,editable) 
        VALUES 
        ('user_two_factor_auth','Two Factor Authorization','General','user','98','CHECKBOX','0','','0','1')");
        if(!$A){ return false; }
        return true;
	}

	// ----------------- passkey

	function toggle_passkey($SQL){
	    $A = $SQL->query("SELECT * FROM module_columns WHERE column_id = 'user_passkey' AND module = 'user' LIMIT 1");
	    if($A->num_rows == 0){if(!add_passkey_column($SQL)){ return ['error' => SQLerror($SQL)]; }}
	    $A = $SQL->query("UPDATE user SET user_passkey = 1 - user_passkey WHERE user_id = '".$_SESSION['user_id']."' LIMIT 1");
	    if(!$A){ return ['error' => SQLerror($SQL)]; }
	    return true;
	}

	function add_passkey_column($SQL){
		$A = $SQL->query("ALTER TABLE user ADD COLUMN user_passkey TINYINT DEFAULT 0");
		if(!$A){ return false; }
		$A = $SQL->query("ALTER TABLE user ADD COLUMN passkey TEXT");
		if(!$A){ return false; }
		$A = $SQL->query("INSERT INTO module_columns 
        (column_id,name,category,module,order_num,type,length,list,preselected_option,editable) 
        VALUES 
        ('user_passkey','Passkey','General','user','99','CHECKBOX','0','','0','1')");
        if(!$A){ return false; }
        return true;
	}

	function save_passkey($SQL){
	    $A = $SQL->query("UPDATE user SET passkey = '".$_GET['save_passkey']."' WHERE user_id = '".$_SESSION['user_id']."' LIMIT 1");
	}

	if(isset($_GET['check_security'])){ echo json_encode(check_security($SQL)); }
	if(isset($_GET['toggle_security'])){ echo json_encode(toggle_security($SQL)); }
	if(isset($_GET['save_passkey'])){ echo json_encode(save_passkey($SQL)); }

}
?>