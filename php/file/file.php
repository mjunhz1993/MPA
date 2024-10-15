<?php
function get_ModuleFileColumns($SQL, $module){
    $A = $SQL->query("SELECT column_id FROM module_columns WHERE module = '$module' AND type = 'FILE'");
    if($A->num_rows == 0){ return false; }
    $col = array();
    while ($B = $A->fetch_row()){ array_push($col, $B[0]); }
    return $col;
}

function get_RowFiles($SQL, $module, $col = array(), $id, $archive = false){
    $col = implode("','", $col);
    if($archive){
        $A = $SQL->query("SELECT `row`,column_id,tstamp,type,name FROM file_archive
        WHERE `row` = '$id' AND column_id IN ('$col') AND archive = '$archive'");
    }
    else{
        $A = $SQL->query("SELECT `row`,column_id,tstamp,type,name FROM file
        WHERE `row` = '$id' AND column_id IN ('$col')");
    }
    if($A->num_rows == 0){ return; }
    $data = array();
    $i = 0;
    while ($B = $A->fetch_row()){
        $fileinfo = pathinfo($B[4]);
        $path = getFileDIR($module);
        $name = $B[0].'_'.$B[1].'_'.$B[2].'.'.$fileinfo['extension'];
        if(!file_exists($path.$name)){ $name = date('Y',$B[2]).'/'.$name; }
        $data['column'][$i] = $B[1];
        $data['name'][$i] = $name;
        $data['type'][$i] = $B[3];
        $data['oldName'][$i] = $B[4];
        $i++;
    }
    return $data;
}

function createFileUploadDIR($path = ''){
    if(!file_exists($_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/'.$path)){ mkdir($_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/'.$path); }
}

function deleteFileUploadDIR($path){
    if($path != ''){
        $dir = $_SERVER['DOCUMENT_ROOT']. '/crm/static/uploads/'.$path.'/';
        array_map('unlink', glob("$dir*"));
        rmdir($dir);
    }
}

function checkFile($SQL, $files){
    createFileUploadDIR();
    foreach($files as $column => $value){
        if(!is_array($value['tmp_name'])){ continue; }
        for($i=0; $i<count($value['tmp_name']); $i++){
            if($value['tmp_name'][$i] != ''){
                $name = $value['name'][$i];
                $fileinfo = pathinfo($name);
                $size = $value['size'][$i];
                // GET INPUT LIST DATA
                $A = $SQL->query("SELECT list FROM module_columns WHERE column_id = '$column' LIMIT 1");
                while ($B = $A->fetch_row()){ $list = explode(',', $B[0]); }
                if($list[0] == 'IMG'){ $allowedTypes = $GLOBALS['ALLOWED_IMG_TYPES']; }
                else{ $allowedTypes = ''; }
                // TEST FILE TYPE
                if($allowedTypes != ''){
                    if(strpos(strtoupper($allowedTypes), strtoupper($fileinfo['extension'])) !== false){}else{ return ['error' => slovar('Wrong_file_type')]; }
                }
                // TEXT FILE SIZE
                if($size > intval($GLOBALS["config"]["max_file_size"])){
                    $maxFileSize = ((intval($GLOBALS["config"]["max_file_size"]) * 0.001) * 0.001);
                    return ['error' => slovar('Wrong_file_size'). ' Max: '. number_format($maxFileSize, 2, '.', '')];
                }
            }
            else if($value['tmp_name'][$i] == '' && $value['name'][$i] != ''){
                $maxFileSize = ((intval($GLOBALS["config"]["max_file_size"]) * 0.001) * 0.001);
                return ['error' => slovar('Wrong_file_size'). ' Max: '. number_format($maxFileSize, 2, '.', ''). 'Mb'];
            }
        }
    }
    return [];
}

function uploadFiles($SQL, $module, $id, $files){
    $time = time();
    $path = getFileDIR($module);
    createFileUploadDIR($module);

    foreach($files as $column => $value){
        if(!is_array($value['tmp_name'])){ continue; }

        $file_count = 0;
        for($i=0; $i<count($value['tmp_name']); $i++){
            if($value['tmp_name'][$i] == ''){ continue; }
            $thisFile = generateUploadFileData($value, $i, $id, $column, $time);
            if(!moveUploadedFile($thisFile, $path)){ continue; }
            if(insertIntoFileModule($SQL, $path, $thisFile)){ $time++; $file_count++; }
            checkIfSmallImageNeeded($SQL, $path, $thisFile);
        }

        if($file_count == 0){ continue; }
        updateModuleFileColumnSQLdata($SQL, $module, $column, $id, $thisFile);
    }
}

function moveUploadedFile($thisFile, $path, $mode = 'UPLOAD'){
    if($mode == 'UPLOAD'){ return move_uploaded_file($thisFile['tmp_name'], $path.$thisFile['NewName']); }
    if($mode == 'MOVE'){ return rename($thisFile['tmp_name'], $path.$thisFile['NewName']); }
}

function generateUploadFileData($value, $i, $id, $column, $time){
    $data['OrgName'] = $value['name'][$i];
    $data['tmp_name'] = $value['tmp_name'][$i];
    $data['type'] = $value['type'][$i];
    $data['extension'] = pathinfo($data['OrgName'], PATHINFO_EXTENSION);
    $data['NewName'] = generateUploadFileName($id,$column,$time,$data['extension']);
    $data['id'] = $id;
    $data['column'] = $column;
    $data['time'] = $time;
    return $data;
}

function moveFileToModule($SQL, $oldPath, $name, $module, $column, $id){
    $path = getFileDIR($module);
    createFileUploadDIR($module);

    $thisFile['tmp_name'] = $oldPath;
    $thisFile['id'] = $id;
    $thisFile['column'] = $column;
    $thisFile['time'] = time();
    $thisFile['type'] = '';
    $thisFile['extension'] = pathinfo($thisFile['tmp_name'], PATHINFO_EXTENSION);
    $thisFile['NewName'] = generateUploadFileName($id,$column,$thisFile['time'],$thisFile['extension']);
    $thisFile['OrgName'] = $name;

    if(!moveUploadedFile($thisFile, $path, 'MOVE')){ return ['error' => 'moving_file_error']; }
    if(!insertIntoFileModule($SQL, $path, $thisFile)){ return ['error' => 'uploading_to_file_sql_error']; }
    return updateModuleFileColumnSQLdata($SQL, $module, $column, $id, $thisFile);
}

function getFileDIR($module){ return $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads/'.$module.'/'; }
function generateUploadFileName($id,$column,$time,$extension){ return $id. '_'. $column. '_'. $time. '.'. $extension; }
function getDataFromUploadedFileName($file){
    if(strpos($file, '/') !== false){ $file = explode('/', $file)[1]; }
    $data = explode('_', explode('.', $file)[0]);
    return [$data[0], implode('_', array_slice($data, 1, -1)), $data[count($data) - 1]];
}

function insertIntoFileModule($SQL, $path, $thisFile){
    $A = $SQL->query("INSERT INTO file (`row`,column_id,tstamp,type,name) 
    VALUES ('".$thisFile['id']."','".$thisFile['column']."','".$thisFile['time']."','".$thisFile['type']."','".$thisFile['OrgName']."')");
    if(!$A){ return false; }
    return true;
}

function checkIfSmallImageNeeded($SQL, $path, $thisFile){
    $A = $SQL->query("SELECT list FROM module_columns WHERE column_id = '".$thisFile['column']."' LIMIT 1");
    while ($B = $A->fetch_row()){ $list = explode(',', $B[0]); }
    if($list[0] == 'IMG' && $list[1] == '1'){
        return uploadImage($path.$thisFile['NewName'], $path.$thisFile['id'].'_'.$thisFile['column'].'_'.$thisFile['time'].'_small.'.$thisFile['extension'], 100);
    }
    return true;
}

function uploadImage($img, $saveLocation, $scale = 1900){
    $im = new Imagick($img);
    if($im->getImageWidth() > $scale){
        $im->scaleImage($scale, 0);
        $im->setImageFilename($saveLocation);
        $im->writeImage();
        return true;
    }
    return copy($img, $saveLocation);
}

function updateModuleFileColumnSQLdata($SQL, $module, $column, $id, $thisFile){
    $file_count = 0;
    $A = $SQL->query("SELECT COUNT(*) FROM file WHERE `row` = '$id' AND column_id = '$column'");
    while ($B = $A->fetch_row()){ $file_count = $B[0]; }
    if($file_count != 1){ $thisFile['NewName'] = $file_count; }
    $A = $SQL->query("UPDATE $module SET $column = '".$thisFile['NewName']."' WHERE ".$module."_id = '$id' LIMIT 1");
    return true;
}

// ---- DELETE
function deleteFile($SQL, $module, $path, $file, $list){
    $moduleData = getModuleData($SQL, $module);
    if(file_exists($path.$file)){if(unlink($path.$file)){
        DF_RemoveSmallIMG($path, $file, $list);
        DF_RemoveSQLdata($SQL, $module, $file, $moduleData['archive']);
    }}
    else if(!file_exists($path.$file)){
        DF_RemoveSQLdata($SQL, $module, $file, $moduleData['archive']);
    }
    else{ return ['error' => slovar('Delete_fail')]; }
    return [];
}
function DF_RemoveSmallIMG($path, $file, $list){
    if($list[0] == 'IMG' && $list[1] == '1'){
        $fileinfo = pathinfo($file);
        $fileSmall = explode('.', $file)[0]. '_small.'. $fileinfo['extension'];
        unlink($path. $fileSmall);
    }
}
function DF_RemoveSQLdata($SQL, $module, $file, $archive){
    list($id, $column, $tstamp) = getDataFromUploadedFileName($file);
    $diary = $SQL->query("SELECT column_id,name FROM file WHERE `row` = '$id' AND column_id = '$column' AND tstamp = '$tstamp' LIMIT 1");
    $A = $SQL->query("DELETE FROM file WHERE `row` = '$id' AND column_id = '$column' AND tstamp = '$tstamp' LIMIT 1");
    if(!$A){ $data['error'] = SQLerror($SQL); }
    else{ DF_updateRowData($SQL, $id, $column, $module, $file, $archive, $diary); }
}
function DF_updateRowData($SQL, $id, $column, $module, $file, $archive, $diary){
    $module_id = $module.'_id';
    $countFiles = 0;
    if($archive != ''){ $archive = 'AND tstamp BETWEEN '. strtotime($archive.'-01-01 -1 hour'). ' AND '. strtotime(($archive+ 1).'-01-01 -1 hour'); }
    $A = $SQL->query("SELECT COUNT(*) FROM file WHERE `row` = '$id' AND column_id = '$column' $archive");
    while ($B = $A->fetch_row()){ $countFiles = $B[0]; }
    if($countFiles == 1){ $SET = $file; }
    else if($countFiles == 0){ $SET = ''; }
    else{ $SET = $countFiles; }
    $A = $SQL->query("UPDATE $module SET $column = '$SET' WHERE $module_id = '$id' LIMIT 1");
    addToDiary($SQL, $module, $id, $diary, 'DELETE_FILE');
}
?>