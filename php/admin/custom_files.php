<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){

    // CUSTOM FILE
    if(isset($_GET['get_custom_files'])){
        $data = array();
        $ProjectExt = '%';
        if(isset($_POST['ProjectExt'])){if($_POST['ProjectExt'] != ''){ $ProjectExt = '%.'.$_POST['ProjectExt']; }}
        $ProjectFilter = '%'.$SQL->real_escape_string($_POST['ProjectFilter'] ?? '').'%';
        $A = $SQL->query("SELECT name,path,project,tstamp FROM downloads 
        WHERE path LIKE '$ProjectExt' AND name LIKE '$ProjectFilter' ORDER BY project, tstamp DESC");
        $st = 0;
        while ($B = $A->fetch_row()){
            $data[$st]['name'] = $B[0];
            $data[$st]['path'] = $B[1];
            $data[$st]['project'] = $B[2];
            $data[$st]['tstamp'] = date('Y-m-d H:i:s', $B[3]);
            $st++;
        }
        echo json_encode($data);
    }

    if(isset($_GET['get_custom_file'])){
        $file_name = $_POST['file_name'];
        $A = $SQL->query("SELECT path,project FROM downloads WHERE name = '$file_name' LIMIT 1");
        if($A->num_rows == 1){
            while ($B = $A->fetch_row()){ $path = $B[0]; $project = $B[1]; }
            $temp_path = $_SERVER['DOCUMENT_ROOT']. '/crm/php/downloads/'. $file_name. '.txt';
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

        $path = $_SERVER['DOCUMENT_ROOT'].'/crm/php/downloads/'.$file_name.'.'.($_POST['file_ext'] ?? 'php');
        if(isset($_POST['update'])){
            $A = $SQL->query("SELECT path FROM downloads WHERE name = '$file_name' LIMIT 1");
            while ($B = $A->fetch_row()){ $path = $B[0]; }
        }

        if($file_name == ''){ $data['error'] = 'File_name_empty'; }
        else{
            if(file_exists($path) && !isset($_POST['update'])){ $data['error'] = 'File_name_duplicate'; }
            else{
                if(isset($_POST['update'])){
                    $A = $SQL->query("UPDATE downloads SET project = '$file_project', tstamp = '$tstamp' WHERE name = '$file_name' LIMIT 1");
                }
        		else{ $A = $SQL->query("INSERT INTO downloads (name,path,project,tstamp) VALUES ('$file_name','$path','$file_project','$tstamp')"); }

    			if(!$A){ $data['error'] = $SQL->error; }
    			else{
    				$myfile = fopen($path, "w");
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
            while ($B = $A->fetch_row()){ $path = $B[0]; }
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