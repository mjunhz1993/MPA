<?php
require $GLOBALS['MAP']['HOME'].'vendor/autoload.php';

function phppdf($d = []){
    $phppdf = new \Mpdf\Mpdf([
        'margin_left'   => $d->margin_left ?? 0,
        'margin_right'  => $d->margin_right ?? 0,
        'margin_top'    => $d->margin_top ?? 20,
        'margin_bottom' => $d->margin_bottom ?? 20,
        'autoPageBreak' => true,
    ]);

    $phppdf->margin_header = 0;
    $phppdf->margin_footer = 0;

    return $phppdf;
}

function phppdf_header($phppdf, $html){ $phppdf->SetHTMLHeader($html); }
function phppdf_footer($phppdf, $html){ $phppdf->SetHTMLFooter($html); }
function phppdf_body($phppdf, $html){ $phppdf->WriteHTML($html); }

function phppdf_newpage($phppdf){ $phppdf->AddPage(); }

function phppdf_save($phppdf, $filename){
    $path = $_SERVER['DOCUMENT_ROOT'].$GLOBALS['MAP']['UPLOADS'];
    $phppdf->Output($path.$filename.'.pdf', 'F');
}

function phppdf_show($phppdf){ $phppdf->Output(); }
?>