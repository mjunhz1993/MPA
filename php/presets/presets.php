<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function check_for_presets_table($SQL, $SQL_db){
	$A = $SQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '$SQL_db' AND table_name = 'module_presets' LIMIT 1");
    if($A->num_rows == 0){
        $A = $SQL->multi_query("
        CREATE TABLE module_presets
        (
            module VARCHAR(100), INDEX(module),
        	FOREIGN KEY (module) REFERENCES module(module) ON DELETE CASCADE,
        	type VARCHAR(100),
            data TEXT,
            PRIMARY KEY (module, type)
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci;
        ");
    }
    if(!$A){ return false; }
    return true;
}

function get_presets($SQL, $SQL_db){
	$module = SafeInput($SQL, $_GET['module']);
	$type = SafeInput($SQL, $_GET['type']);
	if(!check_for_presets_table($SQL, $SQL_db)){ return ['error' => $SQL->error]; }

	$A = $SQL->query("SELECT * FROM module_presets WHERE module = '$module' AND type = '$type' LIMIT 1");
	if($A->num_rows == 0){ return false; }
	while($B = $A->fetch_assoc()){
		$B['data'] = json_decode($B['data']);
		return $B;
	}
}

function update_presets($SQL, $SQL_db){
	if(!check_for_presets_table($SQL, $SQL_db)){ return ['error' => $SQL->error]; }
	$module = SafeInput($SQL, $_POST['module']);
	$type = SafeInput($SQL, $_POST['type']);
	$data = json_encode($_POST['data'], JSON_UNESCAPED_UNICODE);

	$A = $SQL->query("
		INSERT INTO module_presets 
		(module, type, data)
		VALUES 
		('$module', '$type', '$data') 
		ON DUPLICATE KEY UPDATE 
		data = '$data'
	");

	if(!$A){ return ['error' => $SQL->error]; }
    return true;
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['get_presets'])){ echo json_encode(get_presets($SQL, $SQL_db)); }
	if(isset($_GET['update_presets'])){ echo json_encode(update_presets($SQL, $SQL_db)); }
}
?>