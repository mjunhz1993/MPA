<?php
// CREATE

function createFileUploadDIR($path = ''){
    if(!file_exists($_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads')){ mkdir($_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads'); }
    if(!file_exists($_SERVER['DOCUMENT_ROOT'].$GLOBALS['MAP']['UPLOADS'].$path)){ mkdir($_SERVER['DOCUMENT_ROOT'].$GLOBALS['MAP']['UPLOADS'].$path); }
}

// DELETE

function deleteFileUploadDIR($path){
    if($path != ''){
        $dir = $_SERVER['DOCUMENT_ROOT'].$GLOBALS['MAP']['UPLOADS'].$path.'/';
        array_map('unlink', glob("$dir*"));
        rmdir($dir);
    }
}

function delete_user_temp_files($dir, $name){
	$root = $_SERVER['DOCUMENT_ROOT'].$GLOBALS['MAP']['UPLOADS'];
	foreach (glob($root.$dir.'/'.$name.'_'.$_SESSION['user_id'].'_*') as $file) {
        if(is_file($file)){ unlink($file); }
    }
}
?>