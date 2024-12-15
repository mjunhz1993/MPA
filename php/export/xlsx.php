<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('export/extra'));
include(loadPHP('export/excel/Classes/PHPExcel'));
include(loadPHP('export/excel/Classes/PHPExcel/Writer/Excel2007'));

function izvoz($SQL){
    $query = get_table_query($SQL);
    if(!$query){ return ['error' => 'No_query_found']; }

    $A = $SQL->prepare($query);

    if(!$A){ return ['error' => $SQL->error]; }

    bind_param_to_table($A);

    $A->execute();
    $result = $A->get_result();
    if ($result->num_rows == 0) { return ['error' => 'No_data']; }

    $objPHPExcel = new PHPExcel();

    $objPHPExcel->getProperties()->setCreator("Oktagon-it")
    ->setLastModifiedBy("Oktagon-it");

    $do = $objPHPExcel->getActiveSheet();
    $do->getProtection()->setSheet(true);
    $do->setTitle($_GET['id']);

    $st = 0; $elsxRow = 2;
    while ($row = $result->fetch_assoc()){
        if($st == 0){ addTopRow($do, $row); }
        $elsxCol = 0;
        foreach($row as $r=>$v){
            $do->SetCellValueByColumnAndRow($elsxCol, $elsxRow, $v);
            $elsxCol++;
        }
        $do->getStyle($elsxRow)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
        $do->getStyle($elsxRow)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        $st++;
        $elsxRow++;
    }

    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="'.$_GET['id'].'.xlsx"');
    header('Cache-Control: max-age=0');

    $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
    $objWriter->save('php://output');
    unset($objPHPExcel);
}

function addTopRow($do, $row, $i = 0){
    foreach($row as $r=>$v){
        $do->SetCellValueByColumnAndRow($i, 1, $r);
        $do->getColumnDimension($do->getHighestColumn())->setAutoSize(true);
        $i++;
    }
    $do->getStyle('1')->getFont()->setBold( true );
}

if(isset($_SESSION['user_id'])){ izvoz($SQL); }
else{ echo 'Prijavite se v Oktagon program.'; }
?>