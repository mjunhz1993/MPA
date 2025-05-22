<?php
function getFilterData($SQL, $module, $user_id){
    // GET FILTERS
    $selected_filter = 0;
    $order_by = array();
    $selected_columns = array();
    $selected_conditions = array();
    $A = $SQL->query("SELECT filter_id FROM filter_users WHERE module='$module' AND user_id = $user_id LIMIT 1");
    while ($B = $A->fetch_row()){ $selected_filter = $B[0]; }
    if($selected_filter != 0){
        // GET SELECTED COLUMNS
        $A = $SQL->query("SELECT order_by,column_id FROM filter WHERE id = $selected_filter AND column_id != '' LIMIT 1");
        while ($B = $A->fetch_row()){
            $order_by = explode(',', $B[0]);
            $selected_columns = explode(',', $B[1]);
        }
        // GET SELECTED CONDITIONS
        $group_num = 1;
        $cond_type = 'AND';
        $temp = array();
        $A = $SQL->query("SELECT group_num, type, column_id, condition_type, value FROM filter_conditions WHERE filter_id = $selected_filter ORDER BY group_num");
        while ($B = $A->fetch_row()){

            if(strpos($B[2], '.') !== false){ $col = $B[2]; }
            else{ $col = $module.'.'.$B[2]; }

            if($group_num != $B[0]){
                array_push($selected_conditions, '('. implode(' '. $cond_type. ' ', $temp). ')');
                $temp = array();
                $group_num = $B[0];
            }

            if($B[3] == 'Equals'){ array_push($temp, $col. " = '". $B[4]. "'"); }
            else if($B[3] == 'Equals'){ array_push($temp, $col. " = '". $B[4]. "'"); }
            else if($B[3] == 'Not_equal_to'){ array_push($temp, $col. " != '". $B[4]. "'"); }
            else if($B[3] == 'Less_then'){ array_push($temp, $col. " < '". $B[4]. "'"); }
            else if($B[3] == 'Greater_then'){ array_push($temp, $col. " > '". $B[4]. "'"); }
            else if($B[3] == 'Is_empty'){ array_push($temp, $col. " IS NULL"); }
            else if($B[3] == 'Is_not_empty'){ array_push($temp, $col. " IS NOT NULL"); }
            else if($B[3] == 'Begins_with'){ array_push($temp, $col. " LIKE '". $B[4]. "%'"); }
            else if($B[3] == 'Ends_with'){ array_push($temp, $col. " LIKE '%". $B[4]. "'"); }
            else if($B[3] == 'Contains'){ array_push($temp, $col. " LIKE '%". $B[4]. "%'"); }
            else if($B[3] == 'Does_not_contain'){ array_push($temp, $col. " NOT LIKE '%". $B[4]. "%'"); }
            $cond_type = $B[1];
        }
        if(count($temp) != 0){ array_push($selected_conditions, '('. implode(' '. $cond_type. ' ', $temp). ')'); }
    }

    return [$selected_filter, $order_by, $selected_columns, $selected_conditions];
}

function getTableFilterData($SQL, $filters, $filter_values){
    $WHERE = array();
    for($i=0; $i<count($filters); $i++){
        $column_id = SafeInput($SQL, $filters[$i]);
        $column_id_exp = explode('.', $column_id)[1] ?? '';
        $value = SafeInput($SQL, $filter_values[$i]);
        $A = $SQL->query("SELECT type FROM module_columns WHERE column_id = '$column_id_exp' LIMIT 1");
        while ($B = $A->fetch_row()){ $type = $B[0]; }
        array_push($WHERE, renderTableFilterData($type ?? '', $value, $column_id));
    }
    return $WHERE;
}
function renderTableFilterData($type, $value, $column_id){
    if(in_array($type, array('DATE','TIME','DATETIME'))){
        if(strpos($value, ',')){
            $value = explode(',', $value);
            return $column_id." >= '".$value[0]."' AND ".$column_id." <= '".$value[1]."'";
        }
        return $column_id." > '".$value."'";
    }
    if(
        in_array($type, array('ID','SELECT','JOIN_ADD')) ||
        $column_id == 'diary.diary_module'
    ){
        return $column_id." = '".$value."'";
    }
    if($value[0] === '*'){ return renderWildcardFilterData($value, $column_id); }
    return $column_id." LIKE '%".$value."%'";
}

function checkIfDropDownMenuSearch($SQL, $module, $WHERE){
    if(isset($_GET['dropdownMenu'])){ $LIMIT = 100; }else{ $LIMIT = $GLOBALS['ALLOWED_TABLE_SIZE']; }
    if(isset($_GET['dropdownMenu']) && $_GET['dropdownMenu_search_value'] != ''){
        $value = SafeInput($SQL, $_GET['dropdownMenu_search_value']);
        $A = $SQL->query("SELECT column_id FROM module_columns 
        WHERE module = '$module' AND ((type = 'VARCHAR' AND list = 'PRIMARY') OR (type = 'ID'))");
        while ($B = $A->fetch_row()){
            if($value[0] === '*'){
                array_push($WHERE, renderWildcardFilterData($value, $module.'.'.$B[0]));
                continue;
            }
            if(isset($_GET['searchMode']) && $_GET['searchMode'] == 'a%'){
                array_push($WHERE, $module.'.'.$B[0]." LIKE '".$value."%'");
                continue;
            }
            array_push($WHERE, $module.'.'.$B[0]." LIKE '%".$value."%'");
        }
    }
    $dropdownMenu_filter = array();
    if(isset($_GET['dropdownMenu']) && isset($_GET['dropdownMenu_filter']) && is_array($_GET['dropdownMenu_filter'])){
        for($i=0; $i<count($_GET['dropdownMenu_filter']); $i++){if($_GET['dropdownMenu_filter'][$i] != ''){
            $col = SafeInput($SQL, $_GET['dropdownMenu_filter'][$i]);
            $value = SafeInput($SQL, $_GET['dropdownMenu_filter_value'][$i]);
            array_push($dropdownMenu_filter, $module.'.'.$col. " = '". $value. "'");
        }}
    }
    return [$LIMIT, $WHERE, $dropdownMenu_filter];
}

function renderWildcardFilterData($value, $column_id, $wc = array()){
    $value = explode(' ', substr($value, 1));
    foreach($value as $v){ array_push($wc, $column_id." LIKE '%".$v."%'"); }
    return implode(' AND ', $wc);
}
?>