<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');

function get_custom_files($SQL){
    $WHERE = [];
    if(isset($_POST['ProjectExt']) && $_POST['ProjectExt'] != ''){
        $WHERE[] = "path LIKE '%.".$_POST['ProjectExt']."'";
    }
    if(isset($_POST['ProjectFilter']) && $_POST['ProjectFilter'] != ''){
        $WHERE[] = "name LIKE '%".$_POST['ProjectFilter']."%'";
    }
    if(isset($_POST['GroupFilter']) && $_POST['GroupFilter'] != ''){
        $WHERE[] = "project = '".$_POST['GroupFilter']."'";
    }
    if(isset($_POST['ContentFilter']) && $_POST['ContentFilter'] != ''){
        $arr = searchFilesForPhrase($SQL, $_POST['ContentFilter']);
        if(count($arr)){
            $WHERE[] = "path IN ('".implode("','", $arr)."')";
        }
    }

    $WHERE = implode(' AND ', $WHERE);
    if($WHERE != ''){ $WHERE = 'WHERE '.$WHERE; }
    $query = "SELECT name, path, project, tstamp FROM downloads 
              $WHERE
              ORDER BY project, tstamp DESC";
    
    $result = $SQL->query($query);
    $data = [];
    
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'name' => $row['name'],
            'path' => $_SERVER['DOCUMENT_ROOT'].$row['path'],
            'project' => $row['project'],
            'tstamp' => date('Y-m-d H:i:s', $row['tstamp'])
        ];
    }
    
    return $data;
}

function searchFilesForPhrase($SQL, $phrase){
    $allowedExtensions = ['php', 'sql', 'js'];
    $directory = $_SERVER['DOCUMENT_ROOT'].'/crm/php/downloads/';
    $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));
    foreach ($files as $file) {
        if ($file->isFile()) {
            $extension = pathinfo($file->getFilename(), PATHINFO_EXTENSION);
            if (in_array($extension, $allowedExtensions)) {
                $content = file_get_contents($file->getPathname());
                if (strpos($content, $phrase) !== false) {
                    $arr[] = "/crm/php/downloads/".$file->getFilename();
                }
            }
        }
    }
    return $arr ?? ['empty'];
}

if(isset($_GET['test'])){
echo 'dela<hr>';
$phrase = 'test';
searchFilesForPhrase($SQL, $phrase);
}

if(isset($_SESSION['user_id'])){
    if(isset($_GET['get_custom_files'])){ echo json_encode(get_custom_files($SQL)); }

    if(isset($_GET['get_custom_file'])){
        $file_name = $_POST['file_name'];
        $A = $SQL->query("SELECT path,project FROM downloads WHERE name = '$file_name' LIMIT 1");
        if($A->num_rows == 1){
            while ($B = $A->fetch_row()){
                $path = $_SERVER['DOCUMENT_ROOT'].$B[0];
                $project = $B[1];
                $temp_path = $_SERVER['DOCUMENT_ROOT']. '/crm/php/downloads/'. $file_name. '.txt';
            }
            rename($path, $temp_path);
            @$file_data = file_get_contents($temp_path);
            rename($temp_path, $path);
        }
        echo json_encode([$path, $project, $file_data]);
    }

	if(isset($_GET['create_custom_file'])){
        $data = array();
        $file_name = $_POST['file_name'];
        $file_project = $_POST['file_project'];
        $file_data = $_POST['file_data'];
        $tstamp = time();
        $path = '/crm/php/downloads/'.$file_name.'.'.($_POST['file_ext'] ?? 'php');

        if(isset($_POST['update'])){
            $A = $SQL->query("SELECT path FROM downloads WHERE name = '$file_name' LIMIT 1");
            while ($B = $A->fetch_row()){ $path = $B[0]; }
        }

        if($file_name == ''){ $data['error'] = 'File_name_empty'; }
        else{
            if(
                file_exists($_SERVER['DOCUMENT_ROOT'].$path) && 
                !isset($_POST['update'])
            ){
                $data['error'] = 'File_name_duplicate';
            }
            else{
                if(isset($_POST['update'])){
                    $A = $SQL->query("UPDATE downloads SET project = '$file_project', tstamp = '$tstamp'
                    WHERE name = '$file_name' LIMIT 1");
                }
        		else{
                    $A = $SQL->query("INSERT INTO downloads (name,path,project,tstamp)
                    VALUES ('$file_name','$path','$file_project','$tstamp')");
                }

    			if(!$A){ $data['error'] = $SQL->error; }
    			else{
    				$myfile = fopen($_SERVER['DOCUMENT_ROOT'].$path, "w");
    				fwrite($myfile, $file_data);
    				fclose($myfile);
    			}
            }
        }
        
        echo json_encode($data);
    }

    if(isset($_GET['delete_custom_file']) && isset($_POST['file_name'])){
        $data = array();
        $file_name = $_POST['file_name'];
        $A = $SQL->query("SELECT path FROM downloads WHERE name = '$file_name' LIMIT 1");
        if($A->num_rows == 1){
            while ($B = $A->fetch_row()){ $path = $_SERVER['DOCUMENT_ROOT'].$B[0]; }
            if(unlink($path)){
            	$A = $SQL->query("DELETE FROM downloads WHERE name = '$file_name' LIMIT 1");
    			if(!$A){ $data['error'] = $SQL->error; }
            }
            else{ $data['error'] = 'File does not exist'; }
        }
        else{ $data['error'] = 'File does not exist'; }

        echo json_encode($data);
    }

}
?>