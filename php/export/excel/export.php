<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('export/excel/Classes/PHPExcel'));
include(loadPHP('export/excel/Classes/PHPExcel/Writer/Excel2007'));
include(loadPHP('main/module_functions'));

function export_excel_module($SQL){
	if(!class_exists('ZipArchive')){ return ['error' => 'ZipArchive_not_installed']; }
	$data = array();
	$user_id = $_SESSION['user_id'];
	$module = SafeInput($SQL, $_POST['module']);
	$type = SafeInput($SQL, $_POST['export_type']);
	$WHERE = array();

	// CREATE DIR
	createFileUploadDIR('excel');

	// ADD FILTERS
	$F = getFilterData($SQL, $module, $user_id);
    if(count($F[3]) != 0){ array_push($WHERE, '('. implode(' OR ', $F[3]). ')'); }

	// DELETE OLD FILES
	$files = glob($_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads/excel/'.$module.'_*');
	if(count($files) > 0){foreach ($files as $file){ unlink($file); }}

	// ADD SELECTED ROWS
	if($type == 1){
        $selectedID = explode(',', SafeInput($SQL, $_POST['selectedID']));
        array_push($WHERE, $module.".".$module. "_id IN ('". implode("','", $selectedID). "')");
    }

    // ARRAY TO SQL
    $WHERE = implode(' AND ', $WHERE);
    if($WHERE != ''){ $WHERE = 'WHERE '. $WHERE; }

    $ignore = implode("','", array('FILE','TEXTAREA','JOIN_GET','JOIN_ADD_SELECT','BUTTON'));
    $A = $SQL->query("SELECT column_id,name,type,list FROM module_columns WHERE module = '$module' AND type NOT IN('$ignore') ORDER BY order_num");
    if(!$A){ return ['error' => SQLerror($SQL)]; }

	$SELECT = array();
	$JOIN_COLUMN = array();
	$column_name = array();
	while($B = $A->fetch_row()){
		if(count($F[2]) != 0){if(!in_array($B[0], $F[2])){ continue; }}
		if($B[2] == 'JOIN_ADD'){ array_push($JOIN_COLUMN, $B[3]); }
		array_push($SELECT, $module.'.'.$B[0]);
		array_push($column_name, $B[1]);
	}

	list($SELECT, $LEFT_JOIN) = getLeftJoins('TABLE', $SQL, $module, $SELECT, $JOIN_COLUMN, array(), array('PLAIN_TEXT'));

	$SELECT = implode(',', $SELECT);
	$LEFT_JOIN = implode(' ', $LEFT_JOIN);

    $A = $SQL->query("SELECT $SELECT FROM $module $LEFT_JOIN $WHERE");
    if(!$A){ return ['error' => SQLerror($SQL)]; }

	$spreadsheet = new PHPExcel();
	$do = $spreadsheet->getActiveSheet();
	$do->getProtection()->setSheet(true);
	$do->setTitle($module);

	for($i=0; $i<count($column_name); $i++){
		$do->SetCellValueByColumnAndRow($i, 1, $column_name[$i]);
		$do->getColumnDimension($do->getHighestColumn())->setAutoSize(true);
	}
	$do->getStyle('1')->getFont()->setBold( true );

	$row = 2;
	while($B = $A->fetch_row()){
		for($i=0; $i<count($column_name); $i++){ $do->SetCellValueByColumnAndRow($i, $row, $B[$i]); }
		$do->getStyle($row)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
		$do->getStyle($row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
		$row++;
	}

	return excel_save($module, $spreadsheet);
}

function excel_save($module, $spreadsheet){
	$module = $module.'_'.time();
	$url = '/crm/static/uploads/excel/'.$module.'.xlsx';
	$writer = new PHPExcel_Writer_Excel2007($spreadsheet);
	$writer->save($_SERVER['DOCUMENT_ROOT'].$url);
	return $url;
}

if(isset($_SESSION['user_id'])){
	if(isset($_GET['excel_module'])){ echo json_encode(export_excel_module($SQL)); }
}
?>