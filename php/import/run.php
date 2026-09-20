<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('import/csv_to_php'));

if(isset($_SESSION['user_id'])){
    if(isset($_GET['csv_to_sql'])){
    	echo json_encode(csv_to_sql($SQL, (object)[
    		"table" => $_POST['table'],
    		"columns" => $_POST['columns'],
    		"file" => $_FILES["csv_file"] ?? '',
            "skip" => $_POST['skip'] ?? false
    	]));
    }
}
?>