<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('main/module_functions'));
include(loadPHP('main/automations'));

if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){
    
    $user_id = $_SESSION['user_id'];
    $user_role_id = $_SESSION['user_role_id'];
    
    if(isset($_GET['add_row']) && isset($_GET['module'])){
        $data = array();
        $module = SafeInput($SQL, $_GET['module']);
        $col = array();
        $diary_description[0] = array();
        $diary_description[1] = array();
        $col_value = array();
        
        // GET MODULE DATA
        $moduleData = getModuleData($SQL, $module);
        if(!isset($moduleData['error'])){ if(!in_array($user_role_id, $moduleData['can_add'])){ $data['error'] = slovar('Access_denied'); }}
        else{ $data['error'] = $moduleData['error']; }

        // CHECK UPLOADED FILES
        if(!isset($data['error']) && $_FILES){ $data = checkFile($SQL, $_FILES); }
        
        if(!isset($data['error'])){
            // COLUMN TYPES TO IGNORE
            $ignore_types = implode("','", array('FILE'));
            // NORMAL ADD OR QUICK ADD
            $show_in_create = 1;
            if(isset($_POST['quick_add'])){ $show_in_create = 2; }
            // GET COLUMNS FROM MODULE
            $A = $SQL->query("SELECT column_id, type, list, name FROM module_columns 
            WHERE module = '$module' AND (special = 1 OR mandatory = 1 OR show_in_create >= $show_in_create) AND editable = 1 AND type NOT IN ('$ignore_types')");
            while ($B = $A->fetch_row()){
                $temp1 = $B[0];
                $type = $B[1];
                $list = $B[2];
                $keepHTML = false;
                if($type == 'TEXTAREA'){ $keepHTML = true; }
                $temp2 = checkInput($SQL, $_POST, $temp1, SafeInput($SQL, $_POST[$B[0]], $keepHTML), $type);
                if(!is_array($temp2)){
                    if($temp2 != ''){
                        array_push($col, $temp1);
                        array_push($col_value, $temp2);
                        array_push($diary_description[0], $B[3]);
                        array_push($diary_description[1], $temp2);
                    }
                }
                else{ $data['error'] = $temp2['error']; }
            }
        }

        // CHECK AUTOMATION LIMITS
        $add_check = '';
        if(!isset($data['error']) && in_array('AUTOMATIONS', $moduleData['accessories'])){ $add_check = execute_automation_ADD_CHECK($SQL, $module, $col, $col_value); }
        if($add_check != ''){ $data['error'] = $add_check; }

        if(!isset($data['error'])){
            $col_imp = implode(',', $col);
            $col_value_imp = implode("','", $col_value);
            $A = $SQL->query("INSERT INTO $module ($col_imp, added) VALUES ('$col_value_imp', '$user_id')");
            if(!$A){ $data['error'] = SQLerror($SQL); }
            else{
                $new_id = $SQL->insert_id;
                // ADD EVENT TO DIARY
                addToDiary($SQL, $module, $new_id, $diary_description, 'ADD');
                // ADD NOTIFICATION - IF CONFIGERTED
                checkForNotificationEvent($SQL, $_POST, $module, $moduleData['notification_config'], $new_id);
                if($_FILES){ uploadFiles($SQL, $module, $new_id, $_FILES); }
                // EXECUTE AUTOMATION - IF CONFIGERTED
                if(in_array('AUTOMATIONS', $moduleData['accessories'])){ execute_automation_ADD($SQL, $module, $data_auto ?? '', $new_id); }
            }
        }
        
        echo json_encode($data);
    }
    
    
    function edit_row($SQL, $user_id, $user_role_id){
        $module = SafeInput($SQL, $_GET['module']);
        $id = SafeInput($SQL, $_POST['id']);
        $module_id = $module. '_id';
        $diary_description[0] = array();
        $diary_description[1] = array();
        $diary_description[2] = array();
        $SET = array();
        $automationData['column'] = array();
        $automationData['value'] = array();
        
        // LOCK ADMIN USER AND ROLE
        if(($module == 'user' || $module == 'role') && $id == 1 && $user_id != 1){ return ['error' => slovar('Access_denied')]; }
        
        // GET MODUL DATA
        $moduleData = getModuleData($SQL, $module);
        if(isset($moduleData['error'])){ return ['error' => $moduleData['error']]; }
        if(!in_array($user_role_id, $moduleData['can_edit'])){ return ['error' => slovar('Access_denied')]; }

        // CHECK UPLOADED FILES
        if($_FILES){ $data = checkFile($SQL, $_FILES); }
        if(isset($data['error'])){ return ['error' => $data['error']]; }

        $ignore_types = implode("','", array('FILE'));
        $A = $SQL->query("SELECT column_id, type, can_view, can_edit, name FROM module_columns 
        WHERE module = '$module' AND editable = 1 AND type NOT IN ('$ignore_types')");
        while ($B = $A->fetch_row()){
            if(
                (
                    in_array($user_role_id, explode(',', $B[2])) && 
                    in_array($user_role_id, explode(',', $B[3]))
                )
            ){
                $temp1 = $B[0];
                $type = $B[1];

                $keepHTML = false;
                if($type == 'TEXTAREA'){ $keepHTML = true; }
                $temp2 = checkInput($SQL, $_POST, $temp1, SafeInput($SQL, $_POST[$B[0]] ?? '', $keepHTML), $type);
                $temp2_old = checkInput($SQL, $_POST, $temp1, SafeInput($SQL, $_POST[$B[0].'_old'], $keepHTML), $type);

                if(!is_array($temp2)){
                    if($temp2 != $temp2_old){
                        if($type == 'PASSWORD' && $temp2 == ''){ continue; }
                        if($temp2 != ''){ $temp = $temp1. " = '". $temp2. "'"; }else{ $temp = $temp1. " = NULL"; }
                        array_push($diary_description[0], $B[4]);
                        array_push($diary_description[1], $temp2);
                        array_push($diary_description[2], $temp2_old);
                        array_push($SET, $temp);
                        array_push($automationData['column'], $temp1);
                        array_push($automationData['value'], $temp2);
                    }
                }
                else{ return ['error' => $temp2['error']]; }
            }
        }

        // CHECK AUTOMATION LIMITS
        $edit_check = '';
        if(in_array('AUTOMATIONS', $moduleData['accessories'])){ $edit_check = execute_automation_EDIT_CHECK($SQL, $module); }
        if($edit_check != ''){ return ['error' => $edit_check]; }
        
        // UPDATE ROW
        if(count($SET) != 0){
            $SET = implode(', ', $SET);
            $A = $SQL->query("UPDATE $module SET $SET WHERE $module_id = '$id' LIMIT 1");
            if(!$A){ return ['error' => SQLerror($SQL)]; }
        }

        if($_FILES){ uploadFiles($SQL, $module, $id, $_FILES); }
        if(in_array('AUTOMATIONS', $moduleData['accessories'])){ execute_automation_EDIT($SQL, $module, $id, $automationData); }
        if(!is_array($SET)){ addToDiary($SQL, $module, $id, $diary_description, 'EDIT'); }
        return ['message' => slovar('Successfully_edited')];
    }
    if(isset($_GET['edit_row']) && isset($_GET['module'])){ echo json_encode(edit_row($SQL, $user_id, $user_role_id)); }
    
    
    function delete_file($SQL){
        $user_id = $_SESSION['user_id'];
        $user_role_id = $_SESSION['user_role_id'];
        $module = SafeInput($SQL, $_POST['module']);
        $module_id = $module. '_id';
        $file = SafeInput($SQL, $_POST['file']);
        list($id, $column, $tstamp) = getDataFromUploadedFileName($file);

        $moduleData = getModuleData($SQL, $module);
        if(isset($moduleData['error'])){ return $moduleData['error']; }

        $ACCESS = $SQL->query("SELECT * FROM $module WHERE $module_id = '$id' AND added = '$user_id' LIMIT 1");
        if(!in_array($user_role_id, $moduleData['can_edit']) && $ACCESS->num_rows == 0){ return ['error' => slovar('Access_denied')]; }

        $A = $SQL->query("SELECT can_edit, list FROM module_columns WHERE column_id = '$column' LIMIT 1");
        while ($B = $A->fetch_row()){
            if(!in_array($user_role_id, explode(',', $B[0]))){ return ['error' => slovar('Access_denied')]; }
            $list = explode(',', $B[1]);
        }

        return deleteFile($SQL, $module, getFileDIR($module), $file, $list);
    }

    if(isset($_GET['delete_row']) && isset($_GET['module'])){
        $data = array();
        $module = SafeInput($SQL, $_GET['module']);
        $id = SafeInput($SQL, $_POST['id']);
        if(strpos($id, ',') !== false){ $id = explode(',', $id); }
        $module_id = $module. '_id';
        $dataFromDeletedRow = array();
        
        // LOCK ADMIN USER AND ROLE
        if($module == 'user' || $module == 'role'){
            if(is_array($id)){if(in_array(1, $id)){ $data['error'] = "ADMIN locked"; }}
            else{if($id == 1){ $data['error'] = "ADMIN locked"; }}
        }
        // PREVENT SELF DELETE
        if($module == 'user'){
            if(is_array($id)){if(in_array($user_id, $id)){ $data['error'] = slovar('Delete_yourself_error'); }}
            else{if($user_id == $id){ $data['error'] = slovar('Delete_yourself_error'); }}
        }
        // GET MODUL DATA
        if(!isset($data['error'])){
            $moduleData = getModuleData($SQL, $module);
            if(!isset($moduleData['error'])){ if(!in_array($user_role_id, $moduleData['can_delete'])){ $data['error'] = slovar('Access_denied'); }}
            else{ $data['error'] = $moduleData['error']; }
        }

        // GET ID SELECTOR
        if(is_array($id)){ $isRow = "IN ('". implode("','", $id). "')"; }
        else{ $isRow = "= '$id'"; }

        if(!isset($data['error'])){
            $A = $SQL->query("SELECT `row`,column_id,tstamp,name FROM file WHERE `row` $isRow AND column_id LIKE '$module\_%'");
            while ($B = $A->fetch_row()){
                $_POST['module'] = $_GET['module'];
                $file = generateUploadFileName($B[0],$B[1],$B[2],pathinfo($B[3],PATHINFO_EXTENSION));
                if(!file_exists(getFileDIR($module).$file)){ $file = date('Y',$B[2]).'/'.$file; }
                $_POST['file'] = $file;
                delete_file($SQL);
            }

            if(!isset($data['error'])){
                // GET DATA FOR DIARY
                $A = $SQL->query("SELECT column_id,name FROM module_columns WHERE module='$module' AND editable = 1 ORDER BY order_num");
                $column_id = array(); $column_name = array();
                while ($B = $A->fetch_row()){ array_push($column_id, $B[0]); array_push($column_name, $B[1]); }
                $column_id = implode(',', $column_id);
                $A = $SQL->query("SELECT $module_id, $column_id FROM $module WHERE $module_id $isRow");
                $dataFromDeletedRow[0] = $column_name;
                $dataFromDeletedRow[1] = $A;
                // DELETE SQL
                $A = $SQL->query("DELETE FROM $module WHERE $module_id $isRow");
                if(!$A){ $data['error'] = SQLerror($SQL); }
                else{
                    $data['message'] = slovar('Successfully_deleted');
                    // ADD EVENT TO DIARY
                    addToDiary($SQL, $module, $id, $dataFromDeletedRow, 'DELETE');
                    mysqli_data_seek($dataFromDeletedRow[1], 0);
                    if(in_array('AUTOMATIONS', $moduleData['accessories'])){ execute_automation_DELETE($SQL, $module, $id, $dataFromDeletedRow[1]); }
                }
            }
        }
        
        echo json_encode($data);
    }

    if(isset($_GET['delete_file'])){ echo json_encode(delete_file($SQL)); }

    if(isset($_GET['archive_module'])){
        $module = SafeInput($SQL, $_POST['module']);
        $col = SafeInput($SQL, $_POST['col']);
        $year = SafeInput($SQL, $_POST['year']);
        echo json_encode(archive_module($SQL, $SQL_db, $module, $col, $year));
    }
    
    if(isset($_GET['resize_columns'])){
        $column_id = $_POST['column_id'];
        $size = $_POST['size'];
        $A = $SQL->query("UPDATE module_columns SET columnWidth = '$size' WHERE column_id='$column_id' LIMIT 1");
    }
}

// ---------------- GET

if(isset($_SESSION['user_id'])){
    
    $user_id = $_SESSION['user_id'];
    $user_role_id = $_SESSION['user_role_id'];

    if(isset($_GET['get_column_sum']) && isset($_GET['module']) && isset($_GET['column'])){
        $data = array();
        $module = SafeInput($SQL, $_GET['module']);
        $column = SafeInput($SQL, $_GET['column']);
        $type = SafeInput($SQL, $_GET['type']);
        $WHERE = array();
        // CHECK ARCHIVE YEAR
        if($_GET['archive'] != ''){ $archive = SafeInput($SQL, $_GET['archive']); }else{ $archive = ''; }
        if($archive == ''){ $FROM = $module; }
        else{ $FROM = $GLOBALS['ARCHIVE_NAME_START']. '_'. $archive. '_'. $module; }
        // GET FILTERS
        $F = getFilterData($SQL, $module, $user_id);
        $selected_conditions = $F[3];
        // GET TABLE FILTERS
        if(is_array($_GET['filters'])){ $WHERE = getTableFilterData($SQL, $_GET['filters'], $_GET['filter_values']); }
        // IF FILTERS EXIST - CHANGE THEM TO SQL SYNTAX
        if(count($WHERE) != 0){
            $WHERE = 'WHERE ('. implode(' AND ', $WHERE). ')';
            if(count($selected_conditions) != 0){ $WHERE .= ' AND ('. implode(' OR ', $selected_conditions). ')'; }
        }
        else{
            $WHERE = '';
            if(count($selected_conditions) != 0){ $WHERE .= 'WHERE ('. implode(' OR ', $selected_conditions). ')'; }
        }
        $A = $SQL->query("SELECT $type($column) FROM $FROM $WHERE LIMIT 1");
        while ($B = $A->fetch_row()){ $data['sum'] = $B[0]; }
        echo json_encode($data);
    }
    
    // ------------------------ GLOBAL USAGE

    if(isset($_GET['get_archive_years'])){
        $data = array();
        $module = SafeInput($SQL, $_GET['module']);
        $archiveName = $GLOBALS['ARCHIVE_NAME_START'].'_%_'.$module;

        $A = $SQL->query("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = '$SQL_db' AND table_name LIKE '$archiveName'");
        if($A->num_rows != 0){while ($B = $A->fetch_row()){
            $year = intval(explode('_', explode($GLOBALS['ARCHIVE_NAME_START'].'_', $B[0])[1])[0]);
            array_push($data, $year);
        } rsort($data); }

        echo json_encode($data);
    }

    if(isset($_GET['get_date_column_years'])){
        $data = array();
        $module = SafeInput($SQL, $_GET['module']);
        $module_id = $module.'_id';
        $col = SafeInput($SQL, $_GET['col']);
        $i = 0;

        $A = $SQL->query("SELECT DISTINCT(YEAR($col)) AS y, COUNT($module_id) FROM $module GROUP BY y ORDER BY y");
        if($A->num_rows != 0){while ($B = $A->fetch_row()){
            if($B[0] == null){ continue; }
            $data[$i]['year'] = $B[0];
            $data[$i]['count'] = $B[1];
            $i++;
        }}

        echo json_encode($data);
    }

    if(isset($_GET['get_all_users'])){
        $data = array();
        $st = 0;
        $A = $SQL->query("SELECT user_id,user_username,user_email,role_name FROM user LEFT JOIN role ON role_id = user_role_id WHERE user_active = 1");
        while ($B = $A->fetch_row()){
            $data[$st]['user_id'] = $B[0];
            $data[$st]['user_username'] = $B[1];
            $data[$st]['user_email'] = $B[2];
            $data[$st]['user_role'] = $B[3];
            if($user_id == $B[0]){ $data[$st]['me'] = 1; }else{ $data[$st]['me'] = 0; }
            $st++;
        }
        echo json_encode($data);
    }
    
    
    if(isset($_GET['get_all_roles'])){
        $data = array();
        $st = 0;
        $A = $SQL->query("SELECT role_id,role_name FROM role");
        while ($B = $A->fetch_row()){
            $data[$st]['role_id'] = $B[0];
            $data[$st]['role_name'] = $B[1];
            if($user_role_id == $B[0]){ $data[$st]['me'] = 1; }else{ $data[$st]['me'] = 0; }
            $st++;
        }
        echo json_encode($data);
    }
        
}
?>