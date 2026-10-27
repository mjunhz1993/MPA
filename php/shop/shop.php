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
}

// DOWNLOAD

function shop_download_modules($SQL, $modules){

	$order_num = sql_select($SQL, "SELECT order_num FROM module ORDER BY order_num DESC LIMIT 1")
	->fetch_assoc()['order_num'];

	foreach ($modules as $module) {
		$order_num++;
		$module['order_num'] = $order_num;
		$sdm = shop_download_module($SQL, $module);
		return $sdm;
	}
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

    return [
        'result' => $result,
        'extras' => $extras
    ];
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['shop_list'])){ echo json_encode(shop_list($INIconf, $SQL)); }
	if(isset($_GET['shop_download'])){ echo json_encode(shop_download($INIconf, $SQL)); }
}
?>