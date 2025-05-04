<?php
include(loadPHP('file/file'));
include(loadPHP('main/filter'));
include(loadPHP('main/diary'));
include(loadPHP('main/archive'));
include(loadPHP('notifications/notifications'));
// -------------------------------- MODULE

function getModuleData($SQL, $module){
    $arr = array();
    $WHERE = 'ORDER BY order_num';
    if($module != ''){ $WHERE = "WHERE module = '$module' LIMIT 1"; }

    $A = $SQL->query("SELECT
    module,name,category,url,custom,
    can_view,can_add,can_edit,can_delete,
    icon,active,accessories,
    archive
    FROM module $WHERE");
    if($A->num_rows == 0){ return ['error' => 'No_module_found']; }

    if($module != ''){while ($B = $A->fetch_row()){
        $arr['module'] = $B[0];
        $arr['name'] = $B[1];
        $arr['category'] = $B[2];
        $arr['url'] = $B[3];
        if($B[4] == 0){ $arr['custom'] = false; }else{ $arr['custom'] = true; }
        $arr['can_view'] = explode(',', $B[5]);
        $arr['can_add'] = explode(',', $B[6]);
        $arr['can_edit'] = explode(',', $B[7]);
        $arr['can_delete'] = explode(',', $B[8]);
        $arr['icon'] = $B[9];
        if($B[10] == 0){ $arr['active'] = false; }else{ $arr['active'] = true; }
        $arr['accessories'] = explode('|', $B[11]);
        $arr['archive'] = $B[12];
    }}
    else{$st=0;while ($B = $A->fetch_row()){
        $arr[$st]['module'] = $B[0];
        $arr[$st]['name'] = $B[1];
        $arr[$st]['category'] = $B[2];
        $arr[$st]['url'] = $B[3];
        if($B[4] == 0){ $arr[$st]['custom'] = false; }else{ $arr[$st]['custom'] = true; }
        $arr[$st]['can_view'] = explode(',', $B[5]);
        $arr[$st]['can_add'] = explode(',', $B[6]);
        $arr[$st]['can_edit'] = explode(',', $B[7]);
        $arr[$st]['can_delete'] = explode(',', $B[8]);
        $arr[$st]['icon'] = $B[9];
        if($B[10] == 0){ $arr[$st]['active'] = false; }else{ $arr[$st]['active'] = true; }
        $arr[$st]['accessories'] = explode('|', $B[11]);
        $st++;
    }}
    return $arr;
}

function getRows($SQL, $db){
    $data = array();
    $user_id = $_SESSION['user_id'];
    $user_role_id = $_SESSION['user_role_id'];
    $module = SafeInput($SQL, $_GET['module']);
    $module_id = $module.'.'.$module.'_id';
    $WHERE = array();

    // ADD OFFEST
    $OFFSET = 0;
    if(isset($_GET['offset'])){ $OFFSET = SafeInput($SQL, $_GET['offset']); }

    // CHECK ARCHIVE YEAR
    $FROM = $module;
    $archive = '';
    if(isset($_GET['archive']) && $_GET['archive'] != ''){
        $archive = SafeInput($SQL, $_GET['archive']);
        $FROM = $GLOBALS['ARCHIVE_NAME_START']. '_'. $archive. '_'. $module;
    }

    // GET MODULE ACCESSORIES
    $moduleData = getModuleData($SQL, $module);
    
    // ADD ORDER BY
    $ORDER_BY = 'ORDER BY '.$module_id.' DESC';
    if(isset($_GET['sort_column']) && $_GET['sort_column'] != '' && $_GET['sort_direction'] != ''){ 
        $ORDER_BY = 'ORDER BY '. SafeInput($SQL, $_GET['sort_column']). ' '. SafeInput($SQL, $_GET['sort_direction']);
    }

    // GET FILTERS
    list($selected_filter, $filter_order_by, $selected_columns, $selected_conditions) = getFilterData($SQL, $module, $user_id);

    // CREATE SQL FILTER
    $EXTRA_FILTER = '';
    if(count($selected_columns) != 0){ $EXTRA_FILTER = "AND column_id IN ('".implode("','", $selected_columns)."')"; }

    // ADD SORTING FROM FILTERS IF NO SORTING YET
    if(
        (!isset($_GET['sort_column']) || $_GET['sort_column'] == '')
        && count($filter_order_by) != 0 && $filter_order_by[0] != ''){
        $temp = array();
        for($i=0; $i<count($filter_order_by); $i++){ array_push($temp, $module. '.'. implode(' ', explode('|', $filter_order_by[$i]))); }
        $ORDER_BY = 'ORDER BY '. implode(',', $temp);
    }
    
    // GET TABLE FILTERS
    if(isset($_GET['filter']) && is_array($_GET['filter'])){ $WHERE = getTableFilterData($SQL, $_GET['filter'], $_GET['filter_value']); }
    
    // ADD LIMIT + FILTERS FOR DROPDOWN MENU - (JOIN_ADD ONLY)
    list($LIMIT, $WHERE, $dropdownMenu_filter) = checkIfDropDownMenuSearch($SQL, $module, $WHERE);
    if(isset($_GET['limit']) && $_GET['limit'] != ''){ $LIMIT = SafeInput($SQL, $_GET['limit']); }
    
    // CHANGE FILTERS TO SQL SYNTAX
    if(count($WHERE) != 0){
        if(isset($_GET['dropdownMenu'])){ $WHERE = 'WHERE ('. implode(' OR ', $WHERE). ')'; }
        else{ $WHERE = 'WHERE ('. implode(' AND ', $WHERE). ')'; }
        if(count($selected_conditions) != 0){ $WHERE .= ' AND ('. implode(' AND ', $selected_conditions). ')'; }
        if(count($dropdownMenu_filter) != 0){ $WHERE .= ' AND ('. implode(' AND ', $dropdownMenu_filter). ')'; }
    }
    else{
        $WHERE = ''; $WHERE_COND = ' WHERE ';
        if(count($selected_conditions) != 0){ $WHERE .= $WHERE_COND. ' ('. implode(' AND ', $selected_conditions). ')'; $WHERE_COND = ' AND '; }
        if(count($dropdownMenu_filter) != 0){ $WHERE .= $WHERE_COND. ' ('. implode(' AND ', $dropdownMenu_filter). ')'; }
    }
    
    // SHOW ONLY USER ROWS IF USER DOES NOT HAVE ACCESS FOR VIEW
    if(!in_array($user_role_id, $moduleData['can_view'])){
        if($WHERE != ''){ $WHERE .= ' AND '. $module. '.added = '. $user_id; }
        else{ $WHERE = 'WHERE '. $module.'.added = '. $user_id; }
    }

    // CHECK TRASH SYSTEM
    if(in_array('TRASH', $moduleData['accessories'])){
        if(!is_array($_GET['filter'])){
            if($WHERE != ''){ $WHERE .= ' AND '. $module. '.trash = 0'; }
            else{ $WHERE = 'WHERE '. $module.'.trash = 0'; }
        }
        else if(!in_array($module.'.trash', $_GET['filter'])){
            if($WHERE != ''){ $WHERE .= ' AND '. $module. '.trash = 0'; }
            else{ $WHERE = 'WHERE '. $module.'.trash = 0'; }
        }
    }
    
    // ---------------------- CREATE SQL SELECT STATEMENT
    
    // ADD MODUL COLUMNS
    $SELECT = array();
    $ID_COLUMN_ADDONS = '';
    $JOIN_COLUMN = array();
    $JOIN_COLUMN_SELECT = array();
    $FAKE_COLUMNS = array();
    $TEXTAREA_COLUMN = array();
    
    // USE ONLY VARCHAR COLUMNS IF DROPDOWN MENU - (JOIN_ADD)
    $VARCHAR_only = '';
    if(isset($_GET['dropdownMenu'])){ $VARCHAR_only = "AND type = 'VARCHAR' AND list = 'PRIMARY' AND mandatory = 1"; }
    
    // GET TABLE COLUMNS
    if($archive == ''){
        $A = $SQL->query("SELECT column_id, type, list, can_view, preselected_option
        FROM module_columns WHERE module='$module' AND active = 1 $VARCHAR_only $EXTRA_FILTER ORDER BY order_num");
    }
    else{
        $A = $SQL->query("SELECT column_id, type, list, can_view, preselected_option
        FROM information_schema.columns 
        LEFT JOIN module_columns ON COLUMN_NAME = column_id
        WHERE TABLE_SCHEMA = '$db' AND TABLE_NAME='$FROM' AND active = 1 $VARCHAR_only $EXTRA_FILTER ORDER BY order_num");
    }
    if(!$A){ return ['error' => SQLerror($SQL)]; }

    while ($B = $A->fetch_row()){
        $type = $B[1];
        if($type == 'ID'){ $ID_COLUMN_ADDONS = $B[2]; }
        else if($type == 'JOIN_ADD'){ array_push($JOIN_COLUMN, $B[2]); }
        else if($type == 'JOIN_ADD_SELECT'){ array_push($JOIN_COLUMN_SELECT, $B[2]); }
        else if($type == 'JOIN_GET'){ array_push($FAKE_COLUMNS, $module.'.'.$B[0]); $FAKE_COLUMN_TYPE[$module.'.'.$B[0]] = $B[2].'|'.$B[4]; }
        else if($type == 'TEXTAREA'){ array_push($TEXTAREA_COLUMN, $module.'.'.$B[0]); }
        else if($type == 'BUTTON'){ array_push($FAKE_COLUMNS, $module.'.'.$B[0]); }
        $role_column_view_access[$module.'.'.$B[0]] = $B[3];
        array_push($SELECT, $module.'.'.$B[0]);
    }

    // REORGANIZE COLUMNS
    if(count($selected_columns) != 0){
        $temp = array();
        for($i=0; $i<count($selected_columns); $i++){
            if(!in_array($module.'.'.$selected_columns[$i], $SELECT)){ continue; }
            array_push($temp, $SELECT[array_search($module.'.'.$selected_columns[$i], $SELECT)]);
        }
        $SELECT = $temp;
    }
    
    // ADD JOINED COLUMNS
    list($SELECT, $LEFT_JOIN) = getLeftJoins('TABLE', $SQL, $module, $SELECT, $JOIN_COLUMN, $JOIN_COLUMN_SELECT);
    
    // REPLACE FAKE COLUMNS
    $GROUP_BY = '';
    for($i = 0; $i < count($FAKE_COLUMNS); $i++){
        if(!in_array($FAKE_COLUMNS[$i], $SELECT)){ continue; }
        $index = array_search($FAKE_COLUMNS[$i], $SELECT);
        list($LEFT_JOIN, $SELECT[$index], $addGroupBy) = checkJOIN_GETtype($FAKE_COLUMN_TYPE[$FAKE_COLUMNS[$i]] ?? '', $LEFT_JOIN, $module);
        if($addGroupBy){ $GROUP_BY = 'GROUP BY '.$module_id; }
    }

    // CHANGE COLUMNS TO SQL SYNTAX
    array_unshift($SELECT, $module_id);
    $SELECT_imp = implode(',', $SELECT);
    $LEFT_JOIN = implode(' ', $LEFT_JOIN);
    
    // GET ROWS FROM MODUL
    $row = 0;
    $SQLquery = "SELECT $SELECT_imp, $module.added FROM $FROM AS $module $LEFT_JOIN $WHERE $GROUP_BY $ORDER_BY LIMIT $LIMIT OFFSET $OFFSET";
    // return ['error' => $SQLquery];

    $A = $SQL->query($SQLquery);
    if(!$A){ return ['error' => SQLerror($SQL)]; }

    while ($B = $A->fetch_row()){
        for($i = 0; $i<count($SELECT); $i++){
            $showToUser = false;

            if($i == 0 || !isset($role_column_view_access[$SELECT[$i]]) || $user_id == $B[count($SELECT)]){ $showToUser = true; }
            else{if(in_array($user_role_id, explode(',', $role_column_view_access[$SELECT[$i]]))){ $showToUser = true; }}

            if($showToUser){
                if(in_array($SELECT[$i], $JOIN_COLUMN)){ $data[$row][$i] = 'test'; }
                else if(in_array($SELECT[$i], $TEXTAREA_COLUMN) && $B[$i] != ''){ $data[$row][$i] = 1; }
                else{ $data[$row][$i] = $B[$i]; }
            }
            else{ $data[$row][$i] = slovar('Access_denied'); }
        }
        $row++;
    }
    return $data;
}

function getRow($SQL, $db){
    $data = array();
    $user_id = $_SESSION['user_id'];
    $user_role_id = $_SESSION['user_role_id'];
    $module = SafeInput($SQL, $_GET['module']);
    $module_id = $module.'.'.$module. '_id';
    $id = SafeInput($SQL, $_GET['id']);
    $archive = SafeInput($SQL, $_GET['archive'] ?? '');
    $TEST_IF_ACCESS = array();

    $FROM = $module;
    if($archive != ''){ $FROM = $GLOBALS['ARCHIVE_NAME_START']. '_'. $archive. '_'. $module; }
    
    $SELECT = array($module.'.added');

    // GET MODUL DATA
    $moduleData = getModuleData($SQL, $module);
    if(!in_array($user_role_id, $moduleData['can_view'])){ array_push($TEST_IF_ACCESS, $module. ".added = '". $user_id. "'"); }
    $data['accessories'] = implode('|', $moduleData['accessories']);
    
    // ADD COLUMNS
    $FILE_COLUMN = array();
    $JOIN_COLUMN = array();
    $role_column_view_access = array('');

    $type = implode("','", array('JOIN_GET','JOIN_ADD_SELECT','BUTTON'));
    $editable = "AND editable = 1";
    if(isset($_GET['readonly'])){ $editable = ''; }

    if($archive == ''){
        $A = $SQL->query("SELECT column_id, type, list, can_view
        FROM module_columns WHERE module='$FROM' AND type NOT IN ('$type') $editable ORDER BY order_num");
    }
    else{
        $A = $SQL->query("SELECT column_id, type, list, can_view
        FROM information_schema.columns
        LEFT JOIN module_columns ON COLUMN_NAME = column_id
        WHERE TABLE_SCHEMA = '$db' AND TABLE_NAME='$FROM' AND type NOT IN ('$type') $editable ORDER BY order_num");
    }

    while ($B = $A->fetch_row()){
        $type = $B[1];
        if($type == 'FILE'){ array_push($FILE_COLUMN, $B[0]); }
        else if($type == 'JOIN_ADD'){ array_push($JOIN_COLUMN, $B[2]); }
        array_push($SELECT, $module.'.'.$B[0]);
        array_push($role_column_view_access, $B[3]);
    }

    // ADD FILES
    if(count($FILE_COLUMN) != 0){
        if($moduleData['archive'] != '' && $archive != ''){}else{ $archive = false; }
        $data['file'] = get_RowFiles($SQL, $module, $FILE_COLUMN, $id, $archive);
        /*
        $Fcount = 0;
        $FILE_COLUMN = implode("','", $FILE_COLUMN);
        if($moduleData['archive'] != '' && $archive != ''){
            $A = $SQL->query("SELECT `row`,column_id,tstamp,type,name FROM file_archive
            WHERE `row` = '$id' AND column_id IN ('$FILE_COLUMN') AND archive = '$archive'");
        }
        else{
            $A = $SQL->query("SELECT `row`,column_id,tstamp,type,name FROM file WHERE `row` = '$id' AND column_id IN ('$FILE_COLUMN')");
        }
        while ($B = $A->fetch_row()){
            $fileinfo = pathinfo($B[4]);
            $data['file']['column'][$Fcount] = $B[1];
            $data['file']['name'][$Fcount] = $B[0]. '_'. $B[1]. '_'. $B[2]. '.'. $fileinfo['extension'];
            $data['file']['type'][$Fcount] = $B[3];
            $data['file']['oldName'][$Fcount] = $B[4];
            $Fcount++;
        }
        */
    }
    
    // ADD JOINED COLUMNS
    list($SELECT, $LEFT_JOIN, $ACCESS_DATA) = getLeftJoins('ROW', $SQL, $module, $SELECT, $JOIN_COLUMN);
    $role_column_view_access = array_merge($role_column_view_access, $ACCESS_DATA);

    // GET FILTERS
    $F = getFilterData($SQL, $module, $user_id);
    if(count($F[3]) != 0){ $TEST_IF_ACCESS = array_merge($TEST_IF_ACCESS, $F[3]); }
    
    $SELECT_imp = implode(',', $SELECT);
    $LEFT_JOIN = implode(' ', $LEFT_JOIN);
    $TEST_IF_ACCESS = implode(' AND ', $TEST_IF_ACCESS);
    if($TEST_IF_ACCESS != ''){ $TEST_IF_ACCESS = ' AND '. $TEST_IF_ACCESS; }
    
    // GET DATA FOR COLUMNS
    $A = $SQL->query("SELECT $SELECT_imp FROM $FROM AS $module $LEFT_JOIN WHERE $module_id = '$id' $TEST_IF_ACCESS LIMIT 1");
    if($A->num_rows == 0){ return ['error' => slovar('No_item')]; }

    while ($B = $A->fetch_row()){
        for($i = 0; $i<count($SELECT); $i++){
            if(strpos($SELECT[$i], $module.'.') !== false){ $SELECT[$i] = explode($module.'.', $SELECT[$i])[1]; }
            if(
                $i == 0 || 
                $user_id == $B[0] || 
                in_array($user_role_id, explode(',', $role_column_view_access[$i]))
            ){
                $data[$SELECT[$i]] = $B[$i];                
            }
            else{ $data[$SELECT[$i]] = null; } // HIDE DATA FROM USER
        }
    }
    
    return $data;
}

// -------------------------------- INPUTS

function checkInput($SQL, $inputs, $input, $value, $type){
    if($type == 'CHECKBOX'){if($value){ return '1'; }else{ return '0'; }}
    if($type == 'PASSWORD'){if($value != '' && !isset($_POST['table_value'])){ return password_hash($value, PASSWORD_DEFAULT); }}
    return $value;
}

// -------------------------------- LEFT JOINS

function getLeftJoins($type, $SQL, $module, $SELECT, $JOIN_COLUMN = array(), $JOIN_COLUMN_SELECT = array(), $extra = array()){
    $LEFT_JOIN = array();
    $all_join_modules = array($module);
    $all_join_columns = array();
    if($type == 'ROW'){ $role_column_view_access = array(); }

    if(count($JOIN_COLUMN) != 0){
        for($i=0; $i<count($JOIN_COLUMN); $i++){
            $list = explode(',', explode('|', $JOIN_COLUMN[$i])[0]);
            $join_column1 = $list[0];
            array_push($all_join_columns, $join_column1);
            $join_module = $list[1];
            $join_module_label = $join_module;
            $join_column2 = $list[2];

            // ADD LEFT JOINS
            if(in_array($join_module, $all_join_modules)){ $join_module_label = $join_module. count($all_join_modules); }
            array_push($all_join_modules, $join_module_label);
            $temp = 'LEFT JOIN '. $join_module. ' AS '. $join_module_label. ' ON '. $module.'.'.$join_column1. ' = '. $join_module_label.'.'.$join_column2;
            array_push($LEFT_JOIN, $temp);

            if(in_array($module.'.'.$join_column1, $SELECT)){
                if($type == 'TABLE'){ $JOINED_COLUMNS = array(); }

                $A = $SQL->query("SELECT column_id, can_view FROM module_columns 
                WHERE module='$join_module' AND type = 'VARCHAR' AND list = 'PRIMARY' AND mandatory = 1 ORDER BY order_num");
                while ($B = $A->fetch_row()){
                    if($type == 'TABLE'){ array_push($JOINED_COLUMNS, $join_module_label.'.'.$B[0]); }
                    else if($type == 'ROW'){
                        array_push($SELECT, $join_module_label.'.'.$B[0]);
                        array_push($role_column_view_access, $B[1]);
                    }
                }

                if($type == 'TABLE'){
                    $index = array_search($module.'.'.$join_column1, $SELECT);
                    $module_link_id = $SELECT[$index];
                    if(count($JOINED_COLUMNS) == 0){ array_push($JOINED_COLUMNS, $module_link_id); }
                    $JOINED_COLUMNS = implode(", ', ', ", $JOINED_COLUMNS);

                    if(in_array('PLAIN_TEXT', $extra)){ $SELECT[$index] = $JOINED_COLUMNS; }
                    else{
                        $SELECT[$index] = "CONCAT('<a onclick=\"loadJS(\'main/read-box-mini\', function(el){ ";
                        $SELECT[$index] .= "open_readBoxMini(el,\'row\',\'$join_module\',',$module_link_id,')},$(this))\" ";
                        $SELECT[$index] .= "class=\"link\">',$JOINED_COLUMNS,'</a>')";
                    }
                }
            }
        }
    }

    if(count($JOIN_COLUMN_SELECT) != 0){
        for($i=0; $i<count($JOIN_COLUMN_SELECT); $i++){
            $list = explode(',', $JOIN_COLUMN_SELECT[$i]);
            $join_column1 = $list[0];
            $join_module = $list[1];
            $join_module_label = $join_module;
            $join_column2 = $list[2];
            $join_column3 = $list[3];

            // ADD LEFT JOINS
            if(!in_array($join_column3, $all_join_columns)){
                array_push($all_join_columns, $join_column3);
                if(in_array($join_module, $all_join_modules)){ $join_module_label = $join_module. count($all_join_modules); }
                array_push($all_join_modules, $join_module_label);
                $temp = 'LEFT JOIN '. $join_module. ' AS '. $join_module_label. ' ON '. $module.'.'.$join_column3. ' = '. $join_module_label.'.'.$join_module.'_id';
                array_push($LEFT_JOIN, $temp);
            }

            for($j=0; $j<count($JOIN_COLUMN); $j++){
                if(strpos($JOIN_COLUMN[$j], $join_column3.','.$join_module.',') !== false){
                    $join_module_label = $all_join_modules[$j+1];
                    break;
                }
            }

            if(in_array($module.'.'.$join_column1, $SELECT)){
                $index = array_search($module.'.'.$join_column1, $SELECT);
                $SELECT[$index] = $join_module_label.'.'.$join_column2;
            }
        }
    }
    
    if($type == 'TABLE'){ return [$SELECT, $LEFT_JOIN]; }
    else if($type == 'ROW'){ return [$SELECT, $LEFT_JOIN, $role_column_view_access]; }
}

function checkJOIN_GETtype($FAKE_COLUMN_TYPE, $LEFT_JOIN, $module){
    $FAKE_COLUMN_TYPE = explode('|', $FAKE_COLUMN_TYPE);
    if(!isset($FAKE_COLUMN_TYPE[1]) || $FAKE_COLUMN_TYPE[1] == ''){ return [$LEFT_JOIN, "'-'", false]; }
    $list = explode(',', $FAKE_COLUMN_TYPE[0]);
    $options = explode(',',$FAKE_COLUMN_TYPE[1]);

    $join_module_label = 'JOIN_GET'.count($LEFT_JOIN);
    $temp = 'LEFT JOIN '. $list[1]. ' AS '. $join_module_label. ' ON '. $join_module_label.'.'.$list[2]. ' = '. $module.'.'.$module.'_id';
    array_push($LEFT_JOIN, $temp);

    return [$LEFT_JOIN, 'IFNULL('.$options[0]."(".$join_module_label.".".$options[1]."),0)", true];
}
?>