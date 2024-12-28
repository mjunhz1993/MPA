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
    if (strpos($query, '{ORDER_BY}') !== false) {
        $orderBy = SafeInput($SQL, $_POST['data']['orderBy'] ?? '');
        if(empty($orderBy)){ $orderBy = get_first_select_column($query); }
        $query = str_replace('{ORDER_BY}', $orderBy, $query);
    }
    if (strpos($query, '{OFFSET}') !== false) {
        $preset = intval($_POST['data']['offset'] ?? 0);
        $query = str_replace('{OFFSET}', $preset, $query);
    }
    return $query;
}

function get_first_select_column($query) {
    preg_match('/SELECT\s+([^,\s]+)/i', $query, $matches);
    return isset($matches[1]) ? $matches[1] : '';
}
?>