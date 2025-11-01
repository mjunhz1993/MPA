<?php
function addBoxMini_joinData($SQL){
	$A = $SQL->query("
		SELECT * 
		FROM ".SafeInput($SQL, $_GET['module'])." 
		WHERE ".SafeInput($SQL, $_GET['filter'])." = '".SafeInput($SQL, $_GET['filter_value'])."'
	");
	if(!$A || $A->num_rows == 0){ return false; }
	while ($B = $A->fetch_assoc()){ $data[] = $B; }
	return $data;
}

function addBoxMini_saveData($SQL, $d){
    // Delete existing child records
    $SQL->query("DELETE FROM $d->module WHERE $d->p_field = " . (int)$d->p_value);

    // Detect item groups by POST key pattern: table_fieldname[]
    $prefix = $d->module . '_';
    $fields = [];

    // Collect all fields belonging to this table
    foreach ($_POST as $key => $values) {
        if (strpos($key, $prefix) === 0 && is_array($values)) {
            $fields[str_replace($prefix, '', $key)] = $values;
        }
    }

    // Number of items (based on first field count)
    $count = count(reset($fields));
    for ($i = 0; $i < $count; $i++) {
        $data = [
            $d->p_field => $d->p_value,
            $d->module . '_id' => $i + 1
        ];

        // Fill row data
        foreach ($fields as $field => $values) {
            $data[$d->module . '_' . $field] = $values[$i];
        }

        // Build and execute INSERT query
        $cols = implode(',', array_keys($data));
        $vals = implode("','", array_map('addslashes', $data));
        $SQL->query("INSERT INTO $d->module ($cols) VALUES ('$vals')");
    }
}
?>