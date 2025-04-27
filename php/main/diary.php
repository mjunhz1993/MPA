<?php
function diaryLog($SQL, $d){
    if(!is_object($d)){ return error_log('diaryLog: no object found'); }

    foreach (['module', 'row', 'subject'] as $prop) {
        if(!property_exists($d, $prop)){ return error_log("diaryLog: Missing property: $prop"); }
    }

    if($d->module == 'diary'){ return; }

    date_default_timezone_set("UTC");
    $d->time = date('Y-m-d H:i:s', time());
    $d->user = $_SESSION['user_id'];

    if(!property_exists($d, 'desc')){ $d->desc = ''; }
    if(!property_exists($d, 'type')){ $d->type = ''; }

    $SQL->query("INSERT INTO diary (added,diary_subject,diary_user,diary_module,diary_row,diary_description,diary_time,diarytype) 
    VALUES 
    ('$d->user','$d->subject','$d->user','$d->module','$d->row','$d->desc','$d->time','$d->type')");
}

function buildDiaryTable($headers, $rows) {
    $table = '<table><tr>';
    foreach ($headers as $header) $table .= "<th>$header</th>";
    $table .= '</tr>';
    foreach ($rows as $row) {
        $table .= '<tr>';
        foreach ($row as $cell) $table .= "<td>$cell</td>";
        $table .= '</tr>';
    }
    return $table . '</table>';
}

function addToDiary($SQL, $module, $row, $desc, $type = ''){
    if($module != 'diary'){
    	$data = array();
    	$user_id = $_SESSION['user_id'];
        date_default_timezone_set("UTC");
        $t = date('Y-m-d H:i:s', time());
        $diary_subject = '';
        $Ddesc = '';

        if($type == 'ADD'){
            $diary_subject = slovar('Added_row');
            $Ddesc = buildDiaryTable($desc[0], [$desc[1]]);
        }
        else if($type == 'EDIT'){
            $diary_subject = slovar('Edited_row');
            $headers = array_merge([''], $desc[0]);
            $rows = [
                array_merge([slovar('To')], $desc[1]),
                array_merge([slovar('From')], $desc[2])
            ];
            $Ddesc = buildDiaryTable($headers, $rows);
        }
        else if($type == 'DELETE'){
            $diary_subject = slovar('Deleted_row');
            while ($B = $desc[1]->fetch_row()) {
                $Ddesc = buildDiaryTable($desc[0], [array_slice($B, 1)]);
                $thisRow = $B[0];
                $data[] = "('$user_id', '$diary_subject', '$user_id','$module','$thisRow','$Ddesc','$t','$type')";
            }
        }
        else if($type == 'DELETE_FILE'){
            $diary_subject = slovar('Deleted_file');
            $Ddesc = '<table><tr>';
            while($B = $desc->fetch_row()){ $Ddesc .= '<th>'.$B[0].'</th><td>'.$B[1].'</td>'; }
            $Ddesc .= '</tr></table>';
        }
        else{
            $diary_subject = $desc;
            $Ddesc = '';
            if($type != ''){ $Ddesc = $type; }
        }

        if($diary_subject != ''){
            if(count($data) == 0){ array_push($data, "('$user_id', '$diary_subject', '$user_id','$module','$row','$Ddesc','$t','$type')"); }
            // ADD TO DIARY SQL
            $data = implode(',', $data);
        	$A = $SQL->query("INSERT INTO diary (added,diary_subject,diary_user,diary_module,diary_row,diary_description,diary_time,diarytype) VALUES $data");
        }
    }
}

function checkDiaryArchive($SQL, $db, $module = 'diary'){
    $currentYear = get_ModuleYear($SQL, $module);
    date_default_timezone_set("UTC");
    $newYear = date('Y', time());
    if($newYear <= $currentYear){ return ['error' => 'Archive_already_exists']; }

    $temp_table = create_CopyOfModule($SQL, $module);
    if(!$temp_table){ return ['error' => SQLerror($SQL)]; }
    
    copy_ForeignKeys($SQL, $db, $module, $temp_table, true);

    if(!rename_Module($SQL, $module, create_ArchiveModuleName($module, $currentYear))){ return ['error' => SQLerror($SQL)]; }
    if(!rename_Module($SQL, $temp_table, $module)){ return ['error' => SQLerror($SQL)]; }

    update_ModuleYear($SQL, $module, $newYear);
}
?>