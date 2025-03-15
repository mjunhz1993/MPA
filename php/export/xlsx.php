<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('export/extra'));

require $GLOBALS['MAP']['HOME'].'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

function izvoz($SQL){
    if(!isset($_GET['id']) || $_GET['id'] != ''){ return ['error' => 'No_ID']; }
    $_POST['id'] = $_GET['id'];
    
    $query = get_table_query($SQL);
    if(!$query){ return ['error' => 'No_query_found']; }

    $A = $SQL->prepare($query);

    if(!$A){ return ['error' => $SQL->error]; }

    bind_param_to_table($A);

    $A->execute();
    $result = $A->get_result();
    if ($result->num_rows == 0) { return ['error' => 'No_data']; }
    
    $spreadsheet = new Spreadsheet();
    $spreadsheet
    ->getProperties()
    ->setCreator("Oktagon-it")
    ->setLastModifiedBy("Oktagon-it");
    
    $sheet = $spreadsheet->getActiveSheet();
    // $sheet->getProtection()->setSheet(true);
    $sheet->setTitle($_GET['id']);
    
    $st = 0;
    $elsxRow = 2;
    
    while($row = $result->fetch_assoc()){
        if($st == 0){ addTopRow($sheet, $row); }
        $elsxCol = 1;
        foreach($row as $r=>$v){
            $sheet->setCellValue([$elsxCol, $elsxRow], $v);
            $elsxCol++;
        }
        $sheet->getStyle($elsxRow)->getAlignment()->setHorizontal('left');
        $sheet->getStyle($elsxRow)->getAlignment()->setVertical('center');
        $st++;
        $elsxRow++;
    }
    
    download_xlsx($spreadsheet);
}

function addTopRow($sheet, $row, $i = 1){
    foreach($row as $r){
        $sheet->setCellValue([$i, 1], $r);
        $sheet->getColumnDimension($sheet->getHighestColumn())->setAutoSize(true);
        $i++;
    }
    $sheet->getStyle('1')->getFont()->setBold( true );
}

function download_xlsx($spreadsheet){
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="'.$_GET['id'].'.xlsx"');
    header('Cache-Control: max-age=0');
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
}

if(isset($_SESSION['user_id'])){ izvoz($SQL); }
else{ echo 'Prijavite se v Oktagon program.'; }
?>