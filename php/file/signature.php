<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('file/common'));

function save_signature(){
	$root = $_SERVER['DOCUMENT_ROOT'].$GLOBALS['MAP']['UPLOADS'];
	$dir = $_POST['dir'] ?? 'signature';
	$data = $_POST['image'];
	$name = 'signature';

	createFileUploadDIR($dir);

	list($type, $data) = explode(';', $data);
	list(, $data)      = explode(',', $data);
	$data = base64_decode($data);

	delete_user_temp_files($dir, $name);

	$name = $name.'_'.$_SESSION['user_id'].'_'.time().'.png';

	file_put_contents($root.$dir.'/'.$name, $data);

	return $name;
}

if(isset($_SESSION['user_id'])){
    if(isset($_POST['image'])){ echo json_encode(save_signature()); }
}
?>