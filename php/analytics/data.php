<?php
function analytic_get_data_id($SQL){
    $A = $SQL->query("SELECT href FROM analytics_content WHERE pid = ".SafeInput($SQL, $_POST['pid'])." LIMIT 1");
    if(!$A || $A->num_rows == 0){ return false; }
    while ($B = $A->fetch_assoc()){ return $B['href']; }
}

function check_for_special_data($SQL, $query){
    $query = check_for_presets($SQL, $query);
    return $query;
}

function check_for_presets($SQL, $query){
    date_default_timezone_set("UTC");
    if (strpos($query, '{YEAR}') !== false) {
        $preset = intval($_POST['data']['year'] ?? date('Y'));
        $query = str_replace('{YEAR}', $preset, $query);
    }
    if (strpos($query, '{MONTH}') !== false) {
        $preset = intval($_POST['data']['month'] ?? date('m'));
        $query = str_replace('{MONTH}', $preset, $query);
    }
    if (strpos($query, '{USER}') !== false) {
        $preset = intval($_POST['data']['user'] ?? $_SESSION['user_id']);
        $query = str_replace('{USER}', $preset, $query);
    }

    if (strpos($query, '{WHERE}') !== false) {
        $preset = implode(' AND ', $_POST['data']['filter'] ?? []);
        if (!empty($preset)) {
            if (substr_count($query, 'WHERE') === 1) { $preset = 'WHERE ' . $preset; }
            elseif (substr_count($query, 'WHERE') === 2) { $preset = 'AND ' . $preset; }
        }
        $query = str_replace('{WHERE}', $preset, $query);
    }

    if (strpos($query, '{ORDER BY') !== false) {
        $query = preset_orderBy_value($SQL, $query);
    }
    if (strpos($query, '{OFFSET}') !== false) {
        $preset = intval($_POST['data']['offset'] ?? 0);
        $query = str_replace('{OFFSET}', $preset, $query);
    }
    if (strpos($query, '{LIMIT}') !== false) {
        $preset = intval($_POST['data']['limit'] ?? 100);
        $query = str_replace('{LIMIT}', $preset, $query);
    }
    return $query;
}

function preset_orderBy_value($SQL, $query, $orderBy = ''){
    if (strpos($query, '{ORDER BY|') !== false) {
        preg_match('/\{ORDER BY\|([^}]+)\}/', $query, $matches);
        if (isset($matches[1]) && !empty($matches[1])) {
            $orderBy = $matches[1];
            $query = str_replace('{ORDER BY|' . $matches[1] . '}', '{ORDER BY}', $query);
        }
    }

    $userOrderBy = SafeInput($SQL, $_POST['data']['orderBy'] ?? '');

    if (!empty($userOrderBy)) {
        $orderBy = $userOrderBy;
    } elseif (empty($orderBy)) {
        $orderBy = get_first_select_column($query);
    }

    $query = str_replace('{ORDER BY}', $orderBy, $query);
    return $query;
}

function get_first_select_column($query) {
    preg_match('/SELECT\s+.*?\bAS\s+([^\s,]+)/is', $query, $matches);
    return isset($matches[1]) ? trim($matches[1]) : '';
}
?>