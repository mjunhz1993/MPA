<?php
function if_ModuleHasParentRestricts($SQL, $SQL_db, $module){
    $A = $SQL->query("SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS A LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS B ON A.CONSTRAINT_NAME = B.CONSTRAINT_NAME
    WHERE A.TABLE_SCHEMA = '$SQL_db' AND A.REFERENCED_TABLE_NAME = '$module' AND (B.UPDATE_RULE = 'RESTRICT' OR B.DELETE_RULE = 'RESTRICT')");
    if(!$A || $A->num_rows == 0){ return false; }
    return true;
}

function get_ModuleYear($SQL, $module){
    $A = $SQL->query("SELECT archive FROM module WHERE module = '$module' LIMIT 1");
    while ($B = $A->fetch_row()){ return $B[0]; }
    return date('Y');
}

function create_ArchiveModuleName($module, $year){ return $GLOBALS['ARCHIVE_NAME_START']. '_'. $year. '_'. $module; }

function create_CopyOfModule($SQL, $module, $name = false){
    if(!$name){ $name = 'temp_table_'.time(); }
    $A = $SQL->query("CREATE TABLE IF NOT EXISTS $name LIKE $module");
    if(!$A){ return false; }
    return $name;
}

function copy_ForeignKeys($SQL, $SQL_db, $module, $temp_table, $removeKeysFromMainTable = false){
    $A = $SQL->query("SELECT A.COLUMN_NAME, A.REFERENCED_TABLE_NAME, A.REFERENCED_COLUMN_NAME, B.DELETE_RULE, B.UPDATE_RULE, A.CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS A
    LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS B ON A.CONSTRAINT_NAME = B.CONSTRAINT_NAME
    WHERE A.TABLE_SCHEMA = '$SQL_db' AND A.TABLE_NAME = '$module' AND A.REFERENCED_TABLE_NAME IS NOT NULL");
    while ($B = $A->fetch_row()){
        $col_name = $B[0];
        $index_name = $module. '_'. date('Y'). '_'. $col_name;
        $ref_table = $B[1];
        $ref_col = $B[2];
        $delete_rule = $B[3];
        $update_rule = $B[4];

        $F = $SQL->query("ALTER TABLE $temp_table ADD FOREIGN KEY $index_name ($col_name) REFERENCES $ref_table ($ref_col) 
        ON DELETE $delete_rule ON UPDATE $update_rule");

        if(!$removeKeysFromMainTable){ continue; }
        $CONSTRAINT_NAME = $B[5];
        $F = $SQL->query("ALTER TABLE $module DROP FOREIGN KEY $CONSTRAINT_NAME");
    }
}

function copy_ModuleData($SQL, $module, $col, $temp_table, $year, $deleteFromMainTable = false){
    $A = $SQL->query("INSERT INTO $temp_table SELECT * FROM $module WHERE YEAR($col) = '$year'");
    if(!$A){ return false; }
    if(!$deleteFromMainTable){ return true; }
    $A = $SQL->query("DELETE FROM $module WHERE YEAR($col) = '$year'");
    if(!$A){ return false; }
    return true;
}

function rename_Module($SQL, $from, $to){
    $A = $SQL->query("RENAME TABLE $from TO $to");
    if(!$A){ return false; }
    return true;
}

function update_ModuleYear($SQL, $module, $year){
    $A = $SQL->query("UPDATE module SET archive = '$year' WHERE module = '$module' LIMIT 1");
    if(!$A){ return false; }
    return true;
}

// ----------- FILE

function copy_fileDataToArchive($SQL, $SQL_db, $module, $col, $year){
    if(!checkFileArchiveTable($SQL, $SQL_db)){ return false; }
    $file_cols = get_ModuleFileColumns($SQL, $module);
    if(!$file_cols){ return true; }
    $module_id = $module.'_id';
    $file_cols = implode("','", $file_cols);
    $A = $SQL->query("INSERT INTO file_archive (`row`, column_id, tstamp, type, name, archive)
    SELECT `row`, column_id, tstamp, type, name, '$year' FROM file
    LEFT JOIN $module ON `row` = $module_id
    WHERE YEAR($col) = '$year' AND column_id IN ('$file_cols')");
    if(!$A){ return false; }
    $A = $SQL->query("DELETE file FROM file
    LEFT JOIN $module ON `row` = $module_id
    WHERE YEAR($col) = '$year' AND column_id IN ('$file_cols')");
    if(!$A){ return false; }
    return true;
}

function checkFileArchiveTable($SQL, $SQL_db){
    $A = $SQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '$SQL_db' AND table_name = 'file_archive' LIMIT 1");
    if($A->num_rows == 1){ return true; }
    $A = $SQL->query("CREATE TABLE file_archive
    (
        `row` INT(100) UNSIGNED, INDEX(`row`),
        column_id VARCHAR(100),
        tstamp INT(100),
        type VARCHAR(100),
        name TEXT,
        archive INT(10)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci");
    if(!$A){ return false; }
    return true;
}

// ----------- MAIN

function archive_module($SQL, $SQL_db, $module, $col, $year){
    if($year >= date('Y')){ return ['error' => 'Wrong_year']; }
    if(if_ModuleHasParentRestricts($SQL, $SQL_db, $module)){ return ['error' => 'Module_parent_restrict']; }
    $archive_module = create_CopyOfModule($SQL, $module, create_ArchiveModuleName($module, $year));
    if(!$archive_module){ return ['error' => SQLerror($SQL)]; }
    if(!copy_fileDataToArchive($SQL, $SQL_db, $module, $col, $year)){ return ['error' => 'File_copy_error']; }
    if(!copy_ModuleData($SQL, $module, $col, $archive_module, $year, true)){ return ['error' => SQLerror($SQL)]; }
    if(!update_ModuleYear($SQL, $module, date('Y'))){ return ['error' => SQLerror($SQL)]; }
    return [];
}
?>