<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('file/zip'));

function get_files($SQL){
    $dir = $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads'.SafeInput($SQL, $_GET['path']);
    $fakeDir = 'https://'.$_SERVER['SERVER_NAME'].'/crm/static/uploads'.SafeInput($SQL, $_GET['path']);
    if(!is_dir($dir)){ return ['error' => 'Not_found_dir']; }
    $filter = SafeInput($SQL, $_GET['filter']);
    if($filter != ''){ return get_files_filterd($filter, $dir, $fakeDir); }
    return get_files_default($dir, $fakeDir);
}
function get_files_default($dir, $fakeDir, $data = array()){
    $files = opendir($dir);
    if(!$files){ return ['error' => 'Dir_open_error']; }

    $thisFile = $i = $OFFSET = 0;
    if(isset($_GET['OFFSET'])){ $OFFSET = $_GET['OFFSET']; }

    while (($file = readdir($files)) !== false){
        if(in_array($file, array('.','..'))){ continue; }
        if($thisFile < $OFFSET){ $thisFile++; continue; }

        $data['file'][$i]['path'] = $fakeDir.$file;
        $pi = pathinfo($data['file'][$i]['path']);
        if(!isset($pi['extension']) || $pi['extension'] == ''){ $pi['extension'] = false; }
        $data['file'][$i]['name'] = $file;
        $data['file'][$i]['extension'] = $pi['extension'];
        $i++;

        if($i >= 50){ $data['OFFSET'] = $OFFSET + $i; break; }
    }
    closedir($files);
    return $data;
}
function get_files_filterd($filter, $dir, $fakeDir, $data = array()){
    $thisFile = $i = $OFFSET = 0;
    if(isset($_GET['OFFSET'])){ $OFFSET = $_GET['OFFSET']; }

    foreach(glob($dir.'*'.$filter.'*') as $file){
        if(in_array($file, array('.','..'))){ continue; }
        if($thisFile < $OFFSET){ $thisFile++; continue; }

        $pi = pathinfo($file);
        $data['file'][$i]['path'] = $fakeDir.$pi['basename'];
        if($pi['extension'] == ''){ $pi['extension'] = false; }
        $data['file'][$i]['name'] = $pi['basename'];
        $data['file'][$i]['extension'] = $pi['extension'];
        $i++;

        if($i >= 50){ $data['OFFSET'] = $OFFSET + $i; break; }
    }
    return $data;
}

function create_dir(){
    $name = $_POST['name'];
    $path = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads'.$_POST['path'];
    if(file_exists($path.$name)){ return ['error' => 'Error']; }
    return mkdir($path.$name);
}

function upload_file(){
    $file = $_FILES['file'];
    $path = $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads'.$_POST['path'];
    if($file['size'] > $GLOBALS["config"]["max_file_size"]){ return ['error' => 'Wrong_file_size']; }
    return move_uploaded_file($file["tmp_name"], $path.$file['name']);
}

function rename_file($SQL){
    $file = $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads'.SafeInput($SQL, $_GET['file']);
    $pi = pathinfo($file);
    return rename($file, $pi['dirname'].'/'.SafeInput($SQL, $_GET['name']));
}

function paste_file($SQL){
    $dir = $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads'.SafeInput($SQL, $_POST['path']);
    $file = $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads'.SafeInput($SQL, $_POST['file']);
    $pi = pathinfo($file);
    return rename($file, $dir.$pi['basename']);
}

function delete_file($SQL){
    $file = $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads'.SafeInput($SQL, $_GET['file']);
    if(is_dir($file)){ return rmdir($file); }
    return unlink($file);
}

function move_files_by_year($SQL, $data = array()){
    $thisPath = SafeInput($SQL, $_POST['path']);
    $dir = $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads'.$thisPath;
    $files = opendir($dir);
    if(!$files){ return ['error' => 'Dir_open_error']; }
    $i = 0;

    while (($file = readdir($files)) !== false){
        if(in_array($file, array('.','..'))){ continue; }
        $path = $dir.$file;
        $pi = pathinfo($path);
        if($pi['extension'] == ''){ continue; }
        $exp = explode('_', explode('.', $file)[0]);
        $exp = $exp[count($exp) - 1];
        if(!is_numeric($exp)){ continue; }

        $data[$i]['year'] = date('Y', $exp);
        $data[$i]['path'] = $dir.$file;

        $_POST['name'] = date('Y', $exp);
        create_dir();
        $_POST['file'] = $thisPath.$file;
        $_POST['path'] = $thisPath.$_POST['name'].'/';
        paste_file($SQL);

        $i++;

        if($i >= 10){ break; }
    }
    closedir($files);
    return $data;
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['get_files'])){ echo json_encode(get_files($SQL)); }
    if(isset($_GET['create_dir'])){ echo json_encode(create_dir($SQL)); }
    if(isset($_GET['upload_file'])){ echo json_encode(upload_file($SQL)); }
    if(isset($_GET['rename_file'])){ echo json_encode(rename_file($SQL)); }
    if(isset($_GET['paste_file'])){ echo json_encode(paste_file($SQL)); }
    if(isset($_GET['move_files_by_year'])){ echo json_encode(move_files_by_year($SQL)); }
    if(isset($_GET['zip_dir'])){ echo json_encode(zip_dir($SQL,$_GET['source'],$_GET['destination'])); }
    if(isset($_GET['delete_file'])){ echo json_encode(delete_file($SQL)); }
}
?>