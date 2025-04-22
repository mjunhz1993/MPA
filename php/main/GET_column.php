<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('main/module_functions'));
if(isset($_SESSION['user_id'])){

    function addToColumnData($data, $st, $B){
        $data[$st]['column'] = $B[0];
        $data[$st]['name'] = $B[1];
        $data[$st]['category'] = $B[2];
        $data[$st]['module'] = $B[3];
        if($B[4] == 0){ $data[$st]['custom'] = false; }else{ $data[$st]['custom'] = true; }
        $data[$st]['order_num'] = $B[5];
        $data[$st]['can_view'] = $B[6];
        $data[$st]['can_edit'] = $B[7];
        $data[$st]['type'] = $B[8];
        $data[$st]['length'] = $B[9];
        if($B[10] == 0){ $data[$st]['special'] = false; }else{ $data[$st]['special'] = true; }
        $data[$st]['preselected_option'] = $B[11];
        $data[$st]['list'] = $B[12];
        if($B[13] == 0){ $data[$st]['mandatory'] = false; }else{ $data[$st]['mandatory'] = true; }
        $data[$st]['show_in_create'] = $B[14];
        if($B[15] == 0){ $data[$st]['editable'] = false; }else{ $data[$st]['editable'] = true; }
        $data[$st]['width'] = $B[16];
        $data[$st]['columnWidth'] = $B[17];
        if($B[18] == 0){ $data[$st]['active'] = false; }else{ $data[$st]['active'] = true; }
        return $data;
    }

    function replaceFakeColumns($SQL, $SELECT, $data, $st, $fakeCol){
        $thisCol = explode(',',$fakeCol[12])[2];
        $A = $SQL->query("SELECT $SELECT FROM module_columns WHERE column_id = '$thisCol' LIMIT 1");
        while ($B = $A->fetch_row()){
            $B[1] = $fakeCol[1];
            $B[15] = $fakeCol[15];
            return addToColumnData($data, $st, $B);
        }
    }

    function get_columns($SQL, $db){
        $user_id = $_SESSION['user_id'];
        $data = array();
        $module = SafeInput($SQL, $_GET['module']);
        $column = SafeInput($SQL, $_GET['column'] ?? null);
        $moduleData = getModuleData($SQL, $module);
        $FROM = $module;

        // FIRST - CHECK ARCHIVE SYSTEM
        checkDiaryArchive($SQL, $db);
        
        // GET FILTERS
        $EXTRA_FILTER = '';
        if($column != ''){ $EXTRA_FILTER .= " AND column_id = '$column'"; }
        $selected_columns = array();
        if(!isset($_GET['showAll'])){
            $EXTRA_FILTER .= " AND active = 1";
            $selected_filter = 0;
            $A = $SQL->query("SELECT filter_id FROM filter_users WHERE module='$module' AND user_id = $user_id LIMIT 1");
            while ($B = $A->fetch_row()){ $selected_filter = $B[0]; }
            if($selected_filter != 0){
                $A = $SQL->query("SELECT column_id FROM filter WHERE id = $selected_filter LIMIT 1");
                while ($B = $A->fetch_row()){ $selected_columns = explode(',', $B[0]); }
            }
            if(count($selected_columns) != 0){ $EXTRA_FILTER .= " AND column_id IN ('".implode("','", $selected_columns)."')"; }
        }

        // GET COLUMNS FROM MODULE
        $SELECT = "column_id,name,category,module,
        custom,order_num,
        can_view,can_edit,type,
        length,special,preselected_option,
        list,mandatory,show_in_create,editable,
        width,columnWidth,active";

        $st = 0;
        $A = $SQL->query("SELECT $SELECT FROM module_columns WHERE module = '$FROM' $EXTRA_FILTER ORDER BY order_num");
        if(!$A){ return ['error' => SQLerror($SQL)]; }

        $filter = array();
        while ($B = $A->fetch_row()){
            $filter[] = $B[0];

            if(isset($_GET['replaceFakeColumns']) && $B[8] == 'JOIN_ADD_SELECT'){
                $data = replaceFakeColumns($SQL, $SELECT, $data, $st, $B);
                $st++; continue;
            }

            $data = addToColumnData($data, $st, $B);
            $st++;
        }

        // REORGANIZE COLUMNS
        if(count($selected_columns) != 0){
            $data_filterd = array();
            for($i=0; $i<count($selected_columns); $i++){
                $found = array_search($selected_columns[$i], $filter);
                if($found !== false){ array_push($data_filterd, $data[$found]); }
            }
            $data = $data_filterd;
        }

        
        return $data;
    }

	if(isset($_GET['get_columns']) && isset($_GET['module'])){ echo json_encode(get_columns($SQL, $INIconf['SQL']['database'])); }
}
?>