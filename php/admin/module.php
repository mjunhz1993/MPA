<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(isset($_SESSION['user_id']) && isset($_POST['csrf_token']) && $token == $_POST['csrf_token']){if($_SESSION['user_id'] == 1){
    
    // -------------------------------------------------------------------------------------------------------------------------------- MODULS

    if(isset($_GET['add_module'])){
        $data = array();
        $module = $_POST['module'];
        $name = $_POST['name'];
        $category = $_POST['category'];
        $id_name = $module. '_id';
        $archive = '';
        
        $TRASH = 0;

        if($_POST['custom_file'] == ''){
            if(isset($_POST['TRASH'])){ $TRASH = 1; }
        }
        if(isset($_POST['archive'])){
            date_default_timezone_set("UTC");
            $archive = date('Y', time());
        }
        
        $A = $SQL->query("
            SELECT * FROM information_schema.tables 
            WHERE table_schema = '".$INIconf['SQL']['database']."' AND table_name = '$module' LIMIT 1");
        if($A->num_rows == 0){
            if($_POST['custom_file'] == ''){
                $A = $SQL->query("CREATE TABLE $module (
                $id_name INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
                added INT(100), INDEX(added)) CHARACTER SET utf8 COLLATE utf8_general_ci");
                if(!$A){ $data['error'] = $SQL->error; }
                else{
                    $A = $SQL->query("INSERT INTO module (module,name,category,archive) VALUES ('$module','$name','$category','$archive')");
                    if(!$A){ $data['error'] = $SQL->error; }
                    {
                        $A = $SQL->query("INSERT INTO module_columns 
                        (column_id,name,category,module,custom,order_num,type,special,editable) 
                        VALUES 
                        ('$id_name','id','General','$module','0','0','ID','1','0')");
                        if(!$A){ $data['error'] = $SQL->error; }
                        else{}
                    }
                }
            }
            else{
                $custom_file = $_POST['custom_file'];
                $A = $SQL->query("SELECT path FROM downloads WHERE name = '$custom_file' LIMIT 1");
                if($A->num_rows == 1){
                    while ($B = $A->fetch_row()){ $url = '/crm/php/downloads/'. basename($B[0]); }
                    $A = $SQL->query("INSERT INTO module (module,name,category,url) VALUES ('$module','$name','$category','$url')");
                }
            }
        }
        else{ $data['error'] = 'Ime modula že obstaja !'; }

        // ADD ACCESSORIES IF SELECTED
        if(!isset($data['error'])){
            $accessories = array();

            if($TRASH == 1){ $A = $SQL->query("ALTER TABLE $module ADD COLUMN trash TINYINT DEFAULT 0"); array_push($accessories, 'TRASH'); }

            if(count($accessories) != 0){
                $accessories = implode('|',$accessories);
                $A = $SQL->query("UPDATE module SET accessories='$accessories' WHERE module='$module' LIMIT 1");
            }
        }

        echo json_encode($data);
    }
    
    
    if(isset($_GET['edit_module'])){
        $data = array();
        $module = $_POST['module'];
        $name = $_POST['name'];
        $icon = $_POST['icon'];
        $category = $_POST['category'];
        $accessories = $_POST['accessories'];

        $A = $SQL->query("UPDATE module SET name='$name', icon='$icon', category='$category', accessories='$accessories' WHERE module='$module' LIMIT 1");
        if(!$A){ $data['error'] = $SQL->error; }

        echo json_encode($data);
    }

    if(isset($_GET['toggle_module'])){
        $module = $_POST['module'];
        $active = $_POST['active'];
        $A = $SQL->query("UPDATE module SET active = $active WHERE module = '$module' LIMIT 1");
    }
    
    
    if(isset($_GET['delete_module'])){
        $data = array();
        $module = $_POST['module'];
        
        $A = $SQL->query("SELECT * FROM $module LIMIT 1");
        if($A->num_rows == 1){ $data['error'] = 'Modul ima že vnesene vrstice'; }

        if(!isset($data['error'])){
            $url = '';
            $A = $SQL->query("SELECT url FROM module WHERE module = '$module' LIMIT 1");
            while ($B = $A->fetch_row()){ $url = $B[0]; }
            if($url == ''){ $A = $SQL->query("DROP TABLE $module"); }
            if(!$A){ $data['error'] = $SQL->error; }
            else{
                // BRISANJE Z module
                $A = $SQL->query("DELETE FROM module WHERE module = '$module'");
                if(!$A){ $data['error'] = $SQL->error; }
                else{}
            }
        }
        echo json_encode($data);
    }

    // --------------------------------------------------------------------------------------------------------------------------------- ADDONS

    if(isset($_GET['add_module_addon'])){
        $data = array();
        $module = $_GET['module'];
        $addon_type = $_POST['addon_type'];
        $addon = array($addon_type);

        if(
            $addon_type == 'copyDifferentModule' ||
            $addon_type == 'quick_add_after' ||
            $addon_type == 'varchar_multiselect' ||
            $addon_type == 'select_to_progress'
        ){ array_push($addon, $_POST['from_module']); }
        if(
            $addon_type == 'copy' ||
            $addon_type == 'copyDifferentModule' ||
            $addon_type == 'FURS' ||
            $addon_type == 'varchar_multiselect'
        ){ array_push($addon, $_POST['button_position']); }
        if(
            $addon_type == 'copy' ||
            $addon_type == 'copyDifferentModule' ||
            $addon_type == 'FURS' ||
            $addon_type == 'hide_inputs' ||
            $addon_type == 'parent_filter' ||
            $addon_type == 'parent_copy' ||
            $addon_type == 'checkbox_group'
        ){ array_push($addon, $_POST['button_label']); }
        if(
            $addon_type == 'copy' ||
            $addon_type == 'copyDifferentModule' ||
            $addon_type == 'FURS' ||
            $addon_type == 'parent_filter' ||
            $addon_type == 'quick_add_after' ||
            $addon_type == 'parent_copy'
        ){
            $arr = array();
            for($i=0; $i<count($_POST['from']); $i++){
                array_push($arr, $_POST['from'][$i].','.$_POST['to'][$i]);
            }
            array_push($addon, implode(',', $arr));
        }
        if(
            $addon_type == 'hide_inputs' ||
            $addon_type == 'checkbox_group'
        ){
            $arr = array();
            for($i=0; $i<count($_POST['from']); $i++){
                array_push($arr, $_POST['from'][$i]);
            }
            array_push($addon, implode(',', $arr));
        }
        if(
            $addon_type == 'JSCommand' ||
            $addon_type == 'loadJS'
        ){ array_push($addon, $_POST['custom_data_type'], $SQL->real_escape_string($_POST['custom_data'])); }

        if(isset($_POST['addons'])){ $addon = array_merge($addon, $_POST['addons']); }
        
        $addon = implode('|', $addon);
        $tstamp = time();
        $A = $SQL->query("INSERT INTO module_addons (module,addon,tstamp) VALUES ('$module','$addon','$tstamp')");
        if(!$A){ $data['error'] = $SQL->error; }
        echo json_encode($data);
    }

    if(isset($_GET['delete_module_addon'])){
        $data = array();
        $tstamp = $_POST['tstamp'];
        $A = $SQL->query("DELETE FROM module_addons WHERE tstamp = '$tstamp' LIMIT 1");
        if(!$A){ $data['error'] = $SQL->error; }  
        echo json_encode($data); 
     }

     // --------------------------------------------------------------------------------------------------------------------------------- AUTOMATION

     if(isset($_GET['add_module_automation'])){
        $data = array();
        $order_num = time();
        $action = $_POST['action'] ?? '';
        $module = $_POST['module'];
        $command = $_POST['file'].'|'.$_POST['function'];
        
        if(isset($_POST['order_num'])){
            $SQL->query("UPDATE module_automations
            SET auto_command = '$command'
            WHERE order_num = {$_POST['order_num']}");
        }
        else{
            $SQL->query("INSERT INTO module_automations
            (order_num,module,auto_command,action) VALUES ('$order_num','$module','$command','$action')");
        }
        
        $A = $SQL->query("SELECT accessories FROM module WHERE module = '$module' LIMIT 1");
        while ($B = $A->fetch_row()){ $acc = explode('|', $B[0]); }
        if(!in_array('AUTOMATIONS', $acc)){
            array_push($acc, 'AUTOMATIONS');
            $acc = implode('|', $acc);
            $A = $SQL->query("UPDATE module SET accessories = '$acc' WHERE module = '$module' LIMIT 1");
        }

        echo json_encode($data);
    }

    if(isset($_GET['delete_module_automation'])){
        $data = array();
        $module = $_POST['module'];
        $order_num = $_POST['order_num'];
        $A = $SQL->query("DELETE FROM module_automations WHERE order_num = '$order_num' LIMIT 1");
        if(!$A){ $data['error'] = $SQL->error; }
        else{
            $A = $SQL->query("SELECT * FROM module_automations WHERE module = '$module' LIMIT 1");
            if($A->num_rows == 0){
                $A = $SQL->query("SELECT accessories FROM module WHERE module = '$module' LIMIT 1");
                while ($B = $A->fetch_row()){ $acc = explode('|', $B[0]); }
                $index = array_search('AUTOMATIONS', $acc);
                unset($acc[$index]);
                $acc = implode('|', $acc);
                $A = $SQL->query("UPDATE module SET accessories = '$acc' WHERE module = '$module' LIMIT 1");
            }
        }
        echo json_encode($data); 
     }

    // --------------------------------------------------------------------------------------------------------------------------------- IMPORT

    if(isset($_GET['find_import_module'])){
        $data = array();
        $table_name = $_POST['table_name'];
        $st = 0;

        $A = $SQL->query("SELECT * FROM module WHERE module = '$table_name' LIMIT 1");

        if($A->num_rows != 1){
            $A = $SQL->query("
                SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA FROM information_schema.columns 
                WHERE TABLE_SCHEMA = '".$INIconf['SQL']['database']."' AND TABLE_NAME = '$table_name' ORDER BY ORDINAL_POSITION
            ");
            if($A->num_rows != 0){while ($B = $A->fetch_row()){
                $data[$st]['COLUMN_NAME'] = $B[0];
                $data[$st]['DATA_TYPE'] = $B[1];
                $data[$st]['COLUMN_TYPE'] = $B[2]. ' '. $B[5];
                $data[$st]['COLUMN_KEY'] = $B[3];
                $data[$st]['COLUMN_DEFAULT'] = $B[4];
                $st++;
            }}
            else{ $data['error'] = 'Tabela ne obstaja !'; }
        }
        else{ $data['error'] = 'Tabela že obstaja !'; }

        echo json_encode($data);
    }

    if(isset($_GET['add_import_module'])){
        $data = array();
        $module = $_POST['module'];
        $name = $_POST['name'];

        // CHECK IF AUTO-INCREMENT EXISTS
        if(in_array('PRIMARY', $_POST['col_index'])){
            $arr_index = array_search('PRIMARY', $_POST['col_index']);
            if(strpos($_POST['col_type'][$arr_index], 'auto_increment') !== false){}else{ $data['error'] = 'PRIMARY KEY ni primeren za aplikacijo'; }
        }

        if(!isset($data['error'])){
            $A = $SQL->query("ALTER TABLE $module ADD COLUMN added INT(100) DEFAULT 1, ADD INDEX (added)");
            if(!$A){ $data['error'] = $SQL->error; }
            {
                $A = $SQL->query("INSERT INTO module (module,name,category) VALUES ('$module','$name','Imports')");
                if(!$A){ $data['error'] = $SQL->error; }
                else{
                    $order_num = 0;
                    for($i=0; $i<count($_POST['col_id']); $i++){
                        $col_id = $_POST['col_id'][$i];
                        $new_col_id = $module. '_'. $col_id;
                        $col_name = $_POST['col_name'][$i];
                        $col_index = $_POST['col_index'][$i];
                        $col_type = $_POST['col_type'][$i];
                        $data_type = $_POST['data_type'][$i];
                        $col_default = $_POST['col_default'][$i];
                        $custom = 1;
                        $special = 0;
                        $editable = 1;
                        $mandatory = 0;

                        $length = 0;
                        if(strpos($col_type, '(') !== false && strpos($col_type, ')') !== false){
                            $length = explode('(', explode(')', $col_type)[0])[1];
                        }

                        if($data_type == 'int'){ $type = 'INT'; }
                        else if($data_type == 'varchar'){ $type = 'VARCHAR'; }
                        else if($data_type == 'decimal'){ $type = 'DECIMAL'; }
                        else if($data_type == 'date'){ $type = 'DATE'; }
                        else if($data_type == 'time'){ $type = 'TIME'; }
                        else if($data_type == 'datetime'){ $type = 'DATETIME'; }
                        else if($data_type == 'text'){ $type = 'TEXTAREA'; }
                        else if($data_type == 'blob'){ $type = 'TEXTAREA'; }
                        else{ $type = 'VARCHAR'; }

                        if($col_index == 'PRIMARY'){
                            $new_col_id = $module . '_id';
                            $col_name = 'id';
                            $custom = 0;
                            $special = 1;
                            $editable = 0;
                            $type = 'ID';
                        }
                        else if($col_index == 'UNIQUE'){ $special = 1; $mandatory = 1; }
                        else if($col_index == 'INDEX'){ $mandatory = 1; }

                        $A = $SQL->query("ALTER TABLE $module CHANGE $col_id $new_col_id $col_type");
                        if(!$A){ $data['error'] = $SQL->error; }
                        else{
                            $A = $SQL->query("INSERT INTO module_columns 
                            (column_id,name,category,module,custom,order_num,type,length,special,preselected_option,mandatory,editable)
                            VALUES
                            ('$new_col_id','$col_name','General','$module','$custom','$order_num','$type','$length','$special','$col_default','$mandatory','$editable')");
                            if(!$A){ $data['error'] = $SQL->error; }
                            else{ $order_num++; }
                        }
                    }
                }
            }
        }

        echo json_encode($data);
    }
    
    
    // --------------------------------------------------------------------------------------------------------------------------------- COLUMNS
    
    if(isset($_GET['add_column']) && isset($_GET['module'])){
        $data = array();
        $CREATE = '';
        $module = $_GET['module'];
        $column_id = $module. '_'. $_POST['column_id'];
        $name = $_POST['name'];
        $category = $_POST['category'];
        $type = $_POST['type'];
        if(isset($_POST['length'])){ $length = $_POST['length']; }else{ $length = 0; }
        $decimal_points = $_POST['decimal_points'] ?? '';
        $list = '';
        $preselected_option = '';
        $editable = 1;
        
        if(
            $type == 'VARCHAR' ||
            $type == 'EMAIL'
        ){
            $list = $_POST['list'];
            $CREATE = "ALTER TABLE $module ADD COLUMN $column_id VARCHAR($length) NULL";
        }
        else if($type == 'INT'){
            $CREATE = "ALTER TABLE $module ADD COLUMN $column_id INT($length)";
        }
        else if(
            $type == 'DECIMAL' ||
            $type == 'PRICE' ||
            $type == 'PERCENT'
        ){
            $list = $decimal_points;
            $CREATE = "ALTER TABLE $module ADD COLUMN $column_id DECIMAL($length,$decimal_points)";
        }
        else if($type == 'TIME'){ $CREATE = "ALTER TABLE $module ADD COLUMN $column_id TIME"; }
        else if(
            $type == 'DATE' ||
            $type == 'DATETIME'
        ){
            $CREATE = "ALTER TABLE $module ADD COLUMN $column_id DATETIME";
        }
        else if($type == 'TEXTAREA'){
            $CREATE = "ALTER TABLE $module ADD COLUMN $column_id BLOB";
        }
        else if($type == 'CHECKBOX'){
            $preselected_option = 0;
            $CREATE = "ALTER TABLE $module ADD COLUMN $column_id TINYINT DEFAULT 0";
        }
        else if($type == 'SELECT'){
            $list = array();
            $select_option_1 = $_POST['select_option_1'];
            $select_option_2 = $_POST['select_option_2'];
            $select_option_3 = $_POST['select_option_3'];
            for($i=0; $i<count($select_option_1); $i++){
                if($select_option_1[$i] != ''){ array_push($list, $select_option_1[$i].','.$select_option_2[$i].','.$select_option_3[$i]); }
            }
            $list = implode('|', $list);
            $length = max(array_map('strlen', $select_option_1));
            $CREATE = "ALTER TABLE $module ADD COLUMN $column_id VARCHAR($length) NULL";
        }
        else if($type == 'FILE'){
            $list = $_POST['file_op1']. ','. $_POST['file_op2'];
            $CREATE = "ALTER TABLE $module ADD COLUMN $column_id TEXT NULL";
        }
        else if($type == 'JOIN_ADD'){
            $ref_module = $_POST['ref_table'];
            $ref_column = $_POST['ref_table']. '_id';
            $temp = array();
            $select_option_1 = $_POST['select_option_1'] ?? '';
            $select_option_2 = $_POST['select_option_2'] ?? '';
            if(is_array($select_option_1)){for($i=0; $i<count($select_option_1); $i++){
                if($select_option_1[$i] != ''){ array_push($temp, $select_option_1[$i].','.$select_option_2[$i]); }
            }}
            $temp = implode('|', $temp);
            $list = $column_id. ','. $ref_module. ','. $ref_column. '|'. $temp;
            $CREATE = "ALTER TABLE $module ADD COLUMN $column_id INT(100) UNSIGNED, ADD INDEX ($column_id), ";
            $CREATE .= "ADD FOREIGN KEY ($column_id) REFERENCES $ref_module($ref_column) ON DELETE RESTRICT ON UPDATE CASCADE";
        }
        else if($type == 'JOIN_ADD_SELECT'){
            $editable = 0;
            $table_column = $column_id;
            $ref_module = $_POST['ref_table'];
            $ref_column = $_POST['ref_column'];
            $ref_table_counter = $_POST['ref_table_counter'];
            $list = $table_column. ','. $ref_module. ','. $ref_column. ','. $ref_table_counter;
            $CREATE = 1;
        }
        else if($type == 'JOIN_GET'){
            $editable = 0;
            $table_column = $module. '_id';
            $ref_module = $_POST['ref_table'];
            $ref_column = $_POST['ref_column'];
            $list = $table_column. ','. $ref_module. ','. $ref_column;
            $CREATE = 1;
        }
        else if($type == 'BUTTON'){
            $editable = 0;
            $list = implode('|',$_POST['list']);
            $CREATE = 1;
        }
        
        $A = $SQL->query("SELECT * FROM module_columns WHERE column_id = '$column_id' LIMIT 1");
        if($A->num_rows == 0){
            if($CREATE != ''){
                $FAKE_COLUMNS = array('JOIN_GET','JOIN_ADD_SELECT','BUTTON');
                if(in_array($type, $FAKE_COLUMNS)){ $A = 1; }else{ $A = $SQL->query("$CREATE"); }
                if(!$A){ $data['error'] = $SQL->error; }
                else{
                    $A = $SQL->query("SELECT order_num FROM module_columns WHERE module = '$module' ORDER BY order_num DESC LIMIT 1");
                    while ($B = $A->fetch_row()){ $order_num = $B[0] + 1; }
                    $A = $SQL->query("INSERT INTO module_columns 
                    (column_id,name,category,module,order_num,type,length,list,preselected_option,editable) 
                    VALUES 
                    ('$column_id','$name','$category','$module','$order_num','$type','$length','$list','$preselected_option','$editable')");
                    if(!$A){ $data['error'] = $SQL->error; }
                }
            }
            else{ $data['error'] = 'Tega tipa še ni možno dodati !'; }
        }
        else{ $data['error'] = 'Ime stolpca že obstaja !'; }
        echo json_encode($data);
    }
    
    
    if(isset($_GET['edit_column']) && isset($_GET['column'])){
        $data = array();
        $SET = array();
        $column = $_GET['column'];
        if(isset($_POST['editable'])){ $editable = 1; }else{ $editable = 0; }
        if(isset($_POST['active'])){ $active = 1; }else{ $active = 0; }
        if(isset($_POST['special'])){ $special = 1; }else{ $special = 0; }
        if(isset($_POST['mandatory'])){ $mandatory = 1; }else{ $mandatory = 0; }
        
        if(isset($_POST['show_in_create'])){ $show_in_create = 1; }else{ $show_in_create = 0; }
        if(isset($_POST['show_in_create_quick'])){ $show_in_create = 2; }
        
        $err = 0;
        $A = $SQL->query("SELECT module, custom, type, special FROM module_columns WHERE column_id='$column' LIMIT 1");
        while ($B = $A->fetch_row()){
            $module = $B[0];
            $custom = $B[1];
            $type = $B[2];
            $old_special = $B[3];
        }
        
        if($custom == 1){
            array_push($SET, "name = '".$_POST['name']."'");
            array_push($SET, "editable = '". $editable. "'");
            array_push($SET, "active = '". $active. "'");
            array_push($SET, "special = '". $special. "'");
            array_push($SET, "mandatory = '". $mandatory. "'");
            array_push($SET, "show_in_create = '". $show_in_create. "'");
            array_push($SET, "preselected_option = '".($_POST['preselected_option'] ?? ""). "'");
            if($_POST['width']){ array_push($SET, "width = '". $_POST['width']. "'"); }
            if($_POST['category']){ array_push($SET, "category = '". $_POST['category']. "'"); }
            
            // ALTER UNIQUE KEY FOR MODULE
            if($old_special != $special){
                if($special == 1){ $A = $SQL->query("ALTER TABLE $module ADD UNIQUE ($column)"); }
                else{ $A = $SQL->query("ALTER TABLE $module DROP INDEX $column"); }
                if(!$A){ $data['error'] = $SQL->error; $err++; }
            }
            
        }

        if($type == 'ID'){
            if($_POST['id_addons'] != '' && strpos($_POST['id_addons'], ',') == false){ $_POST['id_addons'] = $_POST['id_addons']. ','; }
            array_push($SET, "list = '". $_POST['id_addons']. "'");
        }
        else if($type == 'SELECT'){
            $list = array();
            $select_option_1 = $_POST['select_option_1'];
            $select_option_2 = $_POST['select_option_2'];
            $select_option_3 = $_POST['select_option_3'];
            for($i=0; $i<count($select_option_1); $i++){
                if($select_option_1[$i] != ''){ array_push($list, $select_option_1[$i].','.$select_option_2[$i].','.$select_option_3[$i]); }
            }
            $list = implode('|', $list);
            $length = max(array_map('strlen', $select_option_1));
            $A = $SQL->query("ALTER TABLE $module MODIFY $column VARCHAR($length) DEFAULT '".$_POST['preselected_option']."'");
            if(!$A){ $data['error'] = $SQL->error; $err++; }
            array_push($SET, "list = '". $list. "'");
        }
        
        $SET = implode(',', $SET);
        
        if($err == 0){
            $A = $SQL->query("UPDATE module_columns SET $SET WHERE column_id='$column' LIMIT 1");
            if(!$A){ $data['error'] = $SQL->error; }
        }
        
        echo json_encode($data);
    }
    
    if(isset($_GET['sort_modules'])){
        $modules = $_POST['modules'];
        for($i=0; $i<count($modules); $i++){
            $module = $modules[$i];
            $A = $SQL->query("UPDATE module SET order_num = '$i' WHERE module='$module' LIMIT 1");
        }
    }
    if(isset($_GET['sort_columns'])){
        $column_id = explode(',', $_POST['column_id']);
        for($i=0; $i<count($column_id); $i++){
            $column = $column_id[$i];
            $A = $SQL->query("UPDATE module_columns SET order_num = '$i' WHERE column_id='$column' LIMIT 1");
        }
    }
    
    
    if(isset($_GET['delete_column'])){
        $data = array();
        $column_id = $_POST['column_id'];
        $A = $SQL->query("SELECT module, type FROM module_columns WHERE column_id = '$column_id' LIMIT 1");
        if($A->num_rows == 1){
            while ($B = $A->fetch_row()){ $module = $B[0]; $type = $B[1]; }

            $A = $SQL->query("SELECT * FROM $module WHERE $column_id != '' LIMIT 1");
            if($A->num_rows == 1){ $data['error'] = 'V tem stolpcu so že vneseni podatki'; }

            if(!isset($data['error'])){
                $FAKE_COLUMNS = array('JOIN_GET','JOIN_ADD_SELECT','BUTTON');
                if(in_array($type, $FAKE_COLUMNS)){ $A = 1; }else{

                    if($type == 'JOIN_ADD'){ 
                        $A = $SQL->query("
                            SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                            WHERE REFERENCED_TABLE_SCHEMA = '".$INIconf['SQL']['database']."' AND 
                            TABLE_NAME = '$module' AND COLUMN_NAME = '$column_id' LIMIT 1
                        "); 
                        while ($B = $A->fetch_row()){ $CONSTRAINT_NAME = $B[0]; }
                        $A = $SQL->query("ALTER TABLE $module DROP FOREIGN KEY $CONSTRAINT_NAME");
                    }

                    $A = $SQL->query("ALTER TABLE $module DROP COLUMN $column_id");
                }
                if(!$A){ $data['error'] = $SQL->error; }
                else{ $A = $SQL->query("DELETE FROM module_columns WHERE column_id = '$column_id' LIMIT 1"); }
            }
        }
        echo json_encode($data);
    }
    
    
}}

if(isset($_SESSION['user_id'])){

    if(isset($_GET['get_module_addons']) && isset($_GET['module'])){
        $module = SafeInput($SQL, $_GET['module']);
        $data = array();
        $st = 0;
        $A = $SQL->query("SELECT addon,tstamp FROM module_addons WHERE module='$module' ORDER BY tstamp ASC");
        while ($B = $A->fetch_row()){
            $data[$st]['addon'] = $B[0];
            $data[$st]['tstamp'] = $B[1];
            $st++;
        }
        echo json_encode($data);
    }

    if(isset($_GET['get_module_automations']) && isset($_GET['module'])){
        $module = SafeInput($SQL, $_GET['module']);
        $data = array();
        $st = 0;
        $A = $SQL->query("SELECT module,auto_command,order_num,action
        FROM module_automations WHERE module='$module' ORDER BY order_num ASC");
        while ($B = $A->fetch_row()){
            $data[$st]['module'] = $B[0];
            $data[$st]['command'] = $B[1];
            $data[$st]['order_num'] = $B[2];
            $data[$st]['action'] = $B[3];
            $st++;
        }
        echo json_encode($data);
    }
    
}
?>