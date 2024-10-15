<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('file/file'));

if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    
    function upload_jspdf($SQL){
        createFileUploadDIR('jspdf');
        $name = SafeInput($SQL, $_POST['title']).'_'.time().'.pdf';
        if(!move_uploaded_file($_FILES['pdf']['tmp_name'], $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads/jspdf/'.$name)){ return ['error' => 'Upload_error']; }
        return ['file' => $name];
    }
    
    if(isset($_GET['jspdf'])){ echo json_encode(upload_jspdf($SQL)); }
}