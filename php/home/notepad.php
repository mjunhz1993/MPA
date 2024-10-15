<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('file/file'));
$user_id = $_SESSION['user_id'];
$filePath = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/home/notepad'.$user_id.'.txt';
if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){

	if(isset($_GET['write_notepad'])){
		createFileUploadDIR('home');
		if($_POST['notepad'] == ''){if(file_exists($filePath)){ unlink($filePath); }}
		else{
			$newFile = fopen($filePath, "w");
			fwrite($newFile, $_POST['notepad']);
			fclose($newFile);
		}
		echo json_encode('');
	}

}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['get_notepad'])){
		$data = array();
		createFileUploadDIR('home');
		if(file_exists($filePath)){
			$fh = fopen($filePath,'r');
			while($line = fgets($fh)){ $data[] = $line; }
			fclose($fh);
		}
        echo implode('',$data);
	}
}
?>