<?php
function if_ModuleHasParentRestricts(mysqli $SQL, string $db, string $module): bool
{
    $A = sql_select(
        $SQL,
        "SELECT 1
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS A
        LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS B
            ON A.CONSTRAINT_SCHEMA = B.CONSTRAINT_SCHEMA
            AND A.CONSTRAINT_NAME = B.CONSTRAINT_NAME
            AND A.TABLE_NAME = B.TABLE_NAME
        WHERE A.TABLE_SCHEMA = ?
            AND A.REFERENCED_TABLE_NAME = ?
            AND (
                B.UPDATE_RULE = 'RESTRICT'
                OR B.DELETE_RULE = 'RESTRICT'
            )
        LIMIT 1",
        [$db, $module]
    );

    if (is_array($A) || $A->num_rows === 0) {
        return false;
    }

    return true;
}


function get_ModuleYear(mysqli $SQL, string $module): string
{
    $A = sql_select(
        $SQL,
        "SELECT archive
        FROM module
        WHERE module = ?
        LIMIT 1",
        [$module]
    );

    if (is_array($A)) {
        return date('Y');
    }

    $B = $A->fetch_row();

    if ($B !== null && $B !== false && $B[0] !== null && $B[0] !== '') {
        return (string) $B[0];
    }

    return date('Y');
}

function create_ArchiveModuleName($module, $year)
{ 
    return $GLOBALS['ARCHIVE_NAME_START']. '_'. $year. '_'. $module;
}


function create_CopyOfModule(mysqli $SQL, string $module, string|false $name = false): string|false
{
    if (!$name) {
        $name = 'temp_table_' . time();
    }

    // Validate SQL identifiers.
    if (
        !preg_match('/^[a-zA-Z0-9_]+$/', $name) ||
        !preg_match('/^[a-zA-Z0-9_]+$/', $module)
    ) {
        return false;
    }

    $name = '`' . $name . '`';
    $module = '`' . $module . '`';

    $A = $SQL->query(
        "CREATE TABLE IF NOT EXISTS $name LIKE $module"
    );

    if (!$A) {
        return false;
    }

    return trim($name, '`');
}

function copy_ForeignKeys($SQL, $db, $module, $temp_table, $removeKeysFromMainTable = false){
    $A = $SQL->query("SELECT A.COLUMN_NAME, A.REFERENCED_TABLE_NAME, A.REFERENCED_COLUMN_NAME, B.DELETE_RULE, B.UPDATE_RULE, A.CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS A
    LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS B ON A.CONSTRAINT_NAME = B.CONSTRAINT_NAME
    WHERE A.TABLE_SCHEMA = '$db' AND A.TABLE_NAME = '$module' AND A.REFERENCED_TABLE_NAME IS NOT NULL");
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


function copy_ModuleData(
    mysqli $SQL,
    string $module,
    string $col,
    string $temp_table,
    int|string $year,
    bool $deleteFromMainTable = false
): bool {

    // Validate SQL identifiers (table and column names).
    foreach ([$module, $col, $temp_table] as $identifier) {
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $identifier)) {
            return false;
        }
    }

    // Validate year.
    if (!filter_var($year, FILTER_VALIDATE_INT) || (int)$year < 1) {
        return false;
    }

    $module = '`' . $module . '`';
    $col = '`' . $col . '`';
    $temp_table = '`' . $temp_table . '`';
    $year = (int)$year;

    if ($deleteFromMainTable && !$SQL->begin_transaction()) {
        return false;
    }

    // Copy records for the specified year.
    $A = sql_run(
        $SQL,
        "INSERT INTO $temp_table
         SELECT * FROM $module
         WHERE YEAR($col) = ?",
        [$year]
    );

    if (is_array($A)) {
        if ($deleteFromMainTable) {
            $SQL->rollback();
        }
        return false;
    }

    $A->close();

    // Stop here if deletion is not requested.
    if (!$deleteFromMainTable) {
        return true;
    }

    // Delete copied records from the original table.
    $A = sql_run(
        $SQL,
        "DELETE FROM $module
         WHERE YEAR($col) = ?",
        [$year]
    );

    if (is_array($A)) {
        $SQL->rollback();
        return false;
    }

    $A->close();

    // Commit both operations.
    if (!$SQL->commit()) {
        $SQL->rollback();
        return false;
    }

    return true;
}

function rename_Module(mysqli $SQL, string $from, string $to): bool
{
    // Validate table names.
    if (
        !preg_match('/^[a-zA-Z0-9_]+$/', $from) ||
        !preg_match('/^[a-zA-Z0-9_]+$/', $to)
    ) {
        return false;
    }

    $from = '`' . $from . '`';
    $to = '`' . $to . '`';

    $A = $SQL->query("RENAME TABLE $from TO $to");

    if (!$A) {
        return false;
    }

    return true;
}

function update_ModuleYear(mysqli $SQL, string $module, int|string $year): bool
{
    // Validate year.
    if (
        filter_var($year, FILTER_VALIDATE_INT) === false ||
        (int)$year < 1
    ) {
        return false;
    }

    $A = sql_update(
        $SQL,
        "UPDATE module
        SET archive = ?
        WHERE module = ?
        LIMIT 1",
        [
            (int)$year,
            $module
        ]
    );

    if (is_array($A)) {
        return false;
    }

    return true;
}

// ----------- FILE

function copy_fileDataToArchive($SQL, $db, $module, $col, $year)
{
    if (!checkFileArchiveTable($SQL, $db)) {
        return false;
    }

    // Validate SQL identifiers (cannot be parameterized)
    if (
        !preg_match('/^[a-zA-Z0-9_]+$/', $module) ||
        !preg_match('/^[a-zA-Z0-9_]+$/', $col)
    ) {
        return false;
    }

    $year = (int)$year;

    if ($year < 1) {
        return false;
    }

    $file_cols = get_ModuleFileColumns($SQL, $module);

    if (!$file_cols) {
        return true;
    }

    // Validate column IDs
    foreach ($file_cols as $file_col) {
        if (!is_string($file_col) ||
            !preg_match('/^[a-zA-Z0-9_]+$/', $file_col)) {
            return false;
        }
    }

    $module_id = $module . '_id';
    $placeholders = implode(',', array_fill(0, count($file_cols), '?'));

    $insert_sql = "
        INSERT INTO file_archive
            (`row`, column_id, tstamp, type, name, archive)
        SELECT
            f.`row`, f.column_id, f.tstamp, f.type, f.name, ?
        FROM file AS f
        INNER JOIN `$module` AS m
            ON f.`row` = m.`$module_id`
        WHERE YEAR(m.`$col`) = ?
          AND f.column_id IN ($placeholders)
    ";

    $delete_sql = "
        DELETE f
        FROM file AS f
        INNER JOIN `$module` AS m
            ON f.`row` = m.`$module_id`
        WHERE YEAR(m.`$col`) = ?
          AND f.column_id IN ($placeholders)
    ";

    // Start transaction so failed archiving does not delete source files
    if (!$SQL->begin_transaction()) {
        return false;
    }

    try {
        $insert_values = array_merge(
            [$year, $year],
            array_values($file_cols)
        );

        $insert = sql_insert($SQL, $insert_sql, $insert_values);

        if (is_array($insert)) {
            $SQL->rollback();
            return false;
        }

        $delete_values = array_merge(
            [$year],
            array_values($file_cols)
        );

        $deleted = sql_delete($SQL, $delete_sql, $delete_values);

        if (is_array($deleted)) {
            $SQL->rollback();
            return false;
        }

        if (!$SQL->commit()) {
            $SQL->rollback();
            return false;
        }

        return true;
    } catch (Throwable $e) {
        $SQL->rollback();
        return false;
    }
}

function checkFileArchiveTable($SQL, $db)
{
    $result = sql_select(
        $SQL,
        "SELECT 1
         FROM information_schema.tables
         WHERE table_schema = ?
           AND table_name = 'file_archive'
         LIMIT 1",
        [$db]
    );

    if (is_array($result)) {
        error_log('Checking file_archive failed: ' . print_r($result, true));
        return false;
    }

    if ($result->num_rows > 0) {
        return true;
    }

    $create_sql = "
        CREATE TABLE IF NOT EXISTS `file_archive` (
            `row` INT UNSIGNED,
            INDEX (`row`),
            `column_id` VARCHAR(100),
            `tstamp` INT,
            `type` VARCHAR(100),
            `name` TEXT,
            `archive` INT
        )
        CHARACTER SET utf8
        COLLATE utf8_general_ci
    ";

    $created = sql_run($SQL, $create_sql);

    if (is_array($created)) {
        error_log('Creating file_archive failed: ' . print_r($created, true));
        return false;
    }

    $created->close();

    return true;
}

// ----------- MAIN

function archive_module($SQL, $db, $module, $col, $year){
    if($year >= date('Y')){ return ['error' => 'Wrong_year']; }
    if(if_ModuleHasParentRestricts($SQL, $db, $module)){ return ['error' => 'Module_parent_restrict']; }
    $archive_module = create_CopyOfModule($SQL, $module, create_ArchiveModuleName($module, $year));
    if(!$archive_module){ return ['error' => SQLerror($SQL)]; }
    if(!copy_fileDataToArchive($SQL, $db, $module, $col, $year)){ return ['error' => 'File_copy_error']; }
    if(!copy_ModuleData($SQL, $module, $col, $archive_module, $year, true)){ return ['error' => SQLerror($SQL)]; }
    if(!update_ModuleYear($SQL, $module, date('Y'))){ return ['error' => SQLerror($SQL)]; }
    return [];
}
?>