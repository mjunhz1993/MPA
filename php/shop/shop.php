<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('API/API'));

function shop_list($INIconf, $SQL){
	return SEND((object)[
		'url' => 'https://shop.oktagon-it.si/crm/API/',
		'sendType' => 'POST',
		'event' => 'products_list',
		'username' => $INIconf['API']['username'],
		'password' => $INIconf['API']['password'],
		'data' => ['search' => $_GET['search']],

		'error' => function($err){ return $err; },
		'done' => function($data){ return json_decode($data); }
	]);
}

function shop_download($INIconf, $SQL){
	$json =  SEND((object)[
		'url' => 'https://shop.oktagon-it.si/crm/API/',
		'sendType' => 'POST',
		'event' => 'product_download',
		'username' => $INIconf['API']['username'],
		'password' => $INIconf['API']['password'],
		'data' => [
			'id' => $_GET['id'],
			'give' => $_GET['give']
		],

		'error' => function($err){ return $err; },
		'done' => function($data){ return json_decode($data, true); }
	]);

	if($_GET['give'] === 'modules'){ return shop_download_modules($SQL, $json); }
    if($_GET['give'] === 'scripts'){ return shop_download_scripts($SQL, $json); }
    if($_GET['give'] === 'content'){ return shop_download_content($SQL, $json); }
}

// DOWNLOAD

function shop_download_modules($SQL, $modules){

	$order_num = sql_select($SQL, "SELECT order_num FROM module ORDER BY order_num DESC LIMIT 1")
	->fetch_assoc()['order_num'];

	$allColumns = [];

	foreach ($modules as $module) {
		$order_num++;
		$module['order_num'] = $order_num;
		
		$sdm = shop_download_module($SQL, $module);
        $allColumns = array_merge($allColumns, $sdm['columns']);

		shop_download_extras($SQL, $sdm['columns'], 'module_columns');
        shop_download_extras($SQL, $sdm['addons'], 'module_addons');
        shop_download_extras($SQL, $sdm['automations'], 'module_automations');

		sql_update($SQL, buildCreateTableQuery($sdm['columns']));
	}

	$ForeignKeys = array_values(array_filter($allColumns, function ($column) {
	    return $column['type'] === 'JOIN_ADD';
	}));

	foreach(buildForeignKeyQueries($ForeignKeys) AS $q){
        $fkq = sql_update($SQL, $q);
		if(is_array($fkq)){ error_log($fkq['error'][1].' - '.$q); }
	}

	return true;
}

function shop_download_module($SQL, $module) {

    // Copy extra fields into $extras
    $extras = [];

    foreach (['columns', 'automations', 'addons'] as $key) {
        if (array_key_exists($key, $module)) {
            $extras[$key] = $module[$key];
        }
    }

    // Remove extra fields from $module
    unset($module['columns'], $module['automations'], $module['addons']);

    // Build SQL query
    $columns = array_keys($module);

    $column_names = implode(', ', array_map(
        fn($column) => "`$column`",
        $columns
    ));

    $placeholders = implode(', ', array_fill(0, count($columns), '?'));

    $query = "INSERT INTO `module` ($column_names) VALUES ($placeholders)";

    // Insert into database
    $result = sql_insert($SQL, $query, array_values($module));
    if(is_array($result)){ error_log($result['error'][1]); }

    return $extras;
}

function shop_download_extras($SQL, $data, $table){
	foreach ($data as $d) {
		shop_download_extra($SQL, $d, $table);
	}
}

function shop_download_extra($SQL, $data, $table, $report = true) {

	unset($data['unique']);

    // Build SQL query
    $columns = array_keys($data);

    $column_names = implode(', ', array_map(
        fn($column) => "`$column`",
        $columns
    ));

    $placeholders = implode(', ', array_fill(0, count($columns), '?'));

    $query = "INSERT INTO `$table` ($column_names) VALUES ($placeholders)";

    // Insert into database
    $result = sql_insert($SQL, $query, array_values($data));
    if(is_array($result) && $report){ error_log($result['error'][1]); }

    return true;
}

// SQL

function buildCreateTableQuery(array $columns): string
{
    if (empty($columns)) {
        throw new InvalidArgumentException('No columns provided.');
    }

    $validateIdentifier = function (string $name): string {
        if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $name)) {
            throw new InvalidArgumentException(
                "Invalid SQL identifier: {$name}"
            );
        }

        return "`{$name}`";
    };

    $allowedTypes = [
        'VARCHAR', 'INT', 'TINYINT',
        'TEXT', 'BLOB', 'DATE', 'DATETIME', 'TIME', 'DECIMAL'
    ];

    $tableName = $columns[0]['module'] ?? null;

    if (!$tableName) {
        throw new InvalidArgumentException('Missing table name.');
    }

    $table = $validateIdentifier($tableName);
    $definitions = [];

    foreach ($columns as $column) {
        $columnName = $column['column_id'] ?? null;

        if (!$columnName) {
            throw new InvalidArgumentException('Missing column_id.');
        }

        $columnSql = $validateIdentifier($columnName);
        $type = strtoupper($column['type'] ?? '');
        $length = (int) ($column['length'] ?? 0);

        if (in_array($type, ['JOIN_ADD_SELECT', 'JOIN_GET', 'BUTTON'], true)) {
        	continue;
        }

        if ($type === 'JOIN_ADD') {
            $definitions[] = "{$columnSql} INT(100) UNSIGNED";
            continue;
        }

        if (in_array($type, ['PRICE', 'PERCENT'], true)) {
            $type = 'DECIMAL';
        }

        if ($type === 'FILE') {
            $type = 'TEXT';
        }

        if ($type === 'TEXTAREA') {
            $type = 'BLOB';
        }

        if ($type === 'CHECKBOX') {
            $type = 'TINYINT';
        }

        if ($type === 'SELECT'){
        	$type = 'VARCHAR';

            $length = 0;

            foreach (explode('|', $column['list']) as $item) {
                $parts = explode(',', $item, 2);

                $partLength = strlen($parts[0]);

                if ($partLength > $length) {
                    $length = $partLength;
                }
            }
        }

        if (!in_array($type, $allowedTypes, true)) {
            throw new InvalidArgumentException(
                "Unsupported column type: {$type}"
            );
        }

        $definition = "{$columnSql} {$type}";

        if ($type === 'VARCHAR') {
            if ($length < 1 || $length > 65535) {
                throw new InvalidArgumentException(
                    "Invalid length for {$columnName}."
                );
            }

            $definition .= "({$length})";
        } elseif ($type === 'DECIMAL') {
            $definition .= '(10,2)';
        }

        // Add DEFAULT when preselected_option has a value.
        if (
            isset($column['preselected_option']) &&
            $column['preselected_option'] !== ''
        ) {
            $default = $column['preselected_option'];

            if (in_array($type, ['INT', 'TINYINT', 'DECIMAL'], true)) {
                if (!is_numeric($default)) {
                    throw new InvalidArgumentException(
                        "Invalid numeric default for {$columnName}."
                    );
                }

                $definition .= " DEFAULT {$default}";
            } else {
                $definition .= " DEFAULT '" .
                    str_replace("'", "''", (string) $default) . "'";
            }
        }

        if (!empty($column['unique'])) {
            $definition .= ' UNIQUE';
        }

        $definitions[] = $definition;
    }

    $primaryKey = $validateIdentifier($tableName . '_id');

    array_unshift(
        $definitions,
        "added INT(100), INDEX(added)"
    );

    array_unshift(
        $definitions,
        "{$primaryKey} INT(100) UNSIGNED AUTO_INCREMENT PRIMARY KEY"
    );

    return "CREATE TABLE {$table} (\n    " .
        implode(",\n    ", $definitions) .
        "\n) ENGINE=InnoDB;";
}


function buildForeignKeyQueries(array $columns): array
{
    if (empty($columns)) {
        return [];
    }

    $validateIdentifier = function (string $name): string {
        if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $name)) {
            throw new InvalidArgumentException(
                "Invalid SQL identifier: {$name}"
            );
        }

        return "`{$name}`";
    };

    $queries = [];

    foreach ($columns as $column) {
        if (strtoupper($column['type'] ?? '') !== 'JOIN_ADD') {
            continue;
        }

        $tableName = $column['module'] ?? null;
        $table = $validateIdentifier($tableName);

        $columnName = $column['column_id'] ?? null;
        $list = trim($column['list'] ?? '', '|');
        $parts = array_map('trim', explode(',', $list));

        if (!$columnName || count($parts) !== 3) {
            throw new InvalidArgumentException(
                'Invalid JOIN_ADD definition.'
            );
        }

        [$localColumn, $referencedTable, $referencedColumn] = $parts;

        $localSql = $validateIdentifier($localColumn);
        $referencedTableSql = $validateIdentifier($referencedTable);
        $referencedColumnSql = $validateIdentifier($referencedColumn);

        // Ensure the JOIN_ADD column matches column_id.
        if ($localColumn !== $columnName) {
            throw new InvalidArgumentException(
                "JOIN_ADD column_id does not match list: {$columnName}"
            );
        }

        $constraintName = $validateIdentifier(
            'fk_' . $tableName . '_' . $localColumn
        );

        $queries[] =
            "ALTER TABLE {$table} " .
            "ADD CONSTRAINT {$constraintName} " .
            "FOREIGN KEY ({$localSql}) " .
            "REFERENCES {$referencedTableSql} ({$referencedColumnSql}) " .
            "ON DELETE RESTRICT ON UPDATE CASCADE;";
    }

    return $queries;
}

// FILE DOWNLOADS

function shop_download_scripts($SQL, $json){
    foreach ($json as $script){
        $code = base64_decode($script['script'], true);
        unset($script['script']);

        shop_download_extra($SQL, $script, 'downloads', false);

        if (file_put_contents($_SERVER['DOCUMENT_ROOT'].$script['path'], $code) === false) {
            throw new RuntimeException("Failed to save script: {$path}");
        }
    }

    return true;
}

// ROW INSERTS

function shop_download_content(mysqli $SQL, array $json): array
{
    $results = [];

    foreach ($json as $item) {

        $module = $item['module'] ?? '';

        // Validate table name
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $module)) {
            continue;
        }

        $table = $module;

        foreach ($item['inserts'] ?? [] as $insert) {

            $row = (int)($insert['row'] ?? 0);
            $value = $insert['value'] ?? '';

            if ($row <= 0 || empty($value)) {
                continue;
            }

            $fields = explode('|', $value);

            $columns = [];
            $values = [];

            foreach ($fields as $field) {

                $parts = explode(';', $field, 2);

                if (count($parts) !== 2) {
                    continue;
                }

                $column = trim($parts[0]);
                $fieldValue = trim($parts[1]);

                if (!preg_match('/^[a-zA-Z0-9_]+$/', $column)) {
                    continue;
                }

                $columns[] = $table . '_' . $column;
                $values[] = $fieldValue;
            }

            if (empty($columns)) {
                continue;
            }

            // Add primary key
            array_unshift($columns, $table . '_id');
            array_unshift($values, $row);
            array_unshift($columns, 'added');
            array_unshift($values, 1);

            // Build INSERT
            $columnSQL = implode(', ', array_map(
                fn($column) => "`$column`",
                $columns
            ));

            $placeholders = implode(', ', array_fill(0, count($values), '?'));

            // Build UPDATE
            $updates = [];

            foreach (array_slice($columns, 1) as $column) {
                $updates[] = "`$column` = VALUES(`$column`)";
            }

            $updateSQL = implode(', ', $updates);

            $query = "
                INSERT INTO `$table` ($columnSQL)
                VALUES ($placeholders)
                ON DUPLICATE KEY UPDATE $updateSQL
            ";

            $result = sql_insert($SQL, $query, $values);

            $results[] = [
                'module' => $module,
                'row' => $row,
                'result' => $result
            ];
        }
    }

    return $results;
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['shop_list'])){ echo json_encode(shop_list($INIconf, $SQL)); }
	if(isset($_GET['shop_download'])){ echo json_encode(shop_download($INIconf, $SQL)); }
}
?>