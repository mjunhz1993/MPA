<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('main/module_functions'));

function sumData(mysqli $SQL): array
{
    // Validate required GET parameters.
    $module = $_GET['module'] ?? '';
    $column = $_GET['column'] ?? '';
    $type   = strtoupper($_GET['type'] ?? '');

    // Table and column names cannot be parameterized.
    // Accept simple SQL identifiers only.
    if (
        !is_string($module) ||
        !is_string($column) ||
        !preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $module) ||
        !preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $column)
    ) {
        return ['error' => 'Invalid table or column name'];
    }

    // Only allow supported aggregate functions.
    $allowedTypes = ['SELECT', 'SUM', 'AVG', 'MIN', 'MAX', 'COUNT'];

    if (!in_array($type, $allowedTypes, true)) {
        return ['error' => 'Invalid aggregation type'];
    }

    // Build filters.
    $filterValues = $_GET['filter_values'] ?? [];

    $filters = (
        isset($_GET['filters']) &&
        is_array($_GET['filters']) &&
        is_array($filterValues)
    )
        ? getTableFilterData($SQL, $_GET['filters'], $filterValues)
        : [];

    $selected_conditions = getFilterData(
        $SQL,
        $module,
        $_SESSION['user_id']
    )[3] ?? [];

    $WHERE = [];

    if (!empty($filters)) {
        $WHERE[] = '(' . implode(' AND ', $filters) . ')';
    }

    if (!empty($selected_conditions)) {
        $WHERE[] = '(' . implode(' OR ', $selected_conditions) . ')';
    }

    $WHERE_SQL = $WHERE
        ? 'WHERE ' . implode(' AND ', $WHERE)
        : '';

    // Build and execute the query.
    $query = sumDataQuery(
        $type,
        $column,
        $module,
        $WHERE_SQL
    );

    $result = sql_select($SQL, $query);

    if (is_array($result)) {
        return $result;
    }

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    $result->free();

    return $data;
}


function sumDataQuery(
    string $type,
    string $column,
    string $module,
    string $WHERE_SQL
): string {
    // Quote validated identifiers.
    $column = "`$column`";
    $module = "`$module`";

    if ($type === 'SELECT') {
        return "
            SELECT
                $column AS status,
                ROUND(
                    COUNT(*) * 100.0 /
                    NULLIF(
                        (SELECT COUNT(*) FROM $module $WHERE_SQL),
                        0
                    ),
                    2
                ) AS percentage
            FROM $module
            $WHERE_SQL
            GROUP BY $column
        ";
    }

    return "
        SELECT $type($column) AS `sum`
        FROM $module
        $WHERE_SQL
        LIMIT 1
    ";
}


// Endpoint.
if (
    isset($_SESSION['user_id']) &&
    isset($_GET['get_column_sum'])
) {
    echo json_encode(
        sumData($SQL)
    );
}
?>