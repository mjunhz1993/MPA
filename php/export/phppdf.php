<?php
require $GLOBALS['MAP']['HOME'].'vendor/autoload.php';

function phppdf($d = []){
    $phppdf = new \Mpdf\Mpdf([
        'margin_left'   => $d->margin_left ?? 0,
        'margin_right'  => $d->margin_right ?? 0,
        'margin_top'    => $d->margin_top ?? 20,
        'margin_bottom' => $d->margin_bottom ?? 20,
    ]);

    $phppdf->margin_header = 0;
    $phppdf->margin_footer = 0;

    return $phppdf;
}

function phppdf_sign($phppdf, $d = []){
    $existingPdf = $_SERVER['DOCUMENT_ROOT'].$GLOBALS['MAP']['UPLOADS'].$d->pdf.'.pdf';
    $signature   = $_SERVER['DOCUMENT_ROOT'].$GLOBALS['MAP']['UPLOADS'].$d->signature;
    $thisPage = $d->page ?? 0;

    $totalPages = $phppdf->setSourceFile($existingPdf);

    for ($i = 1; $i <= $totalPages; $i++) {
        phppdf_newpage($phppdf);
        $phppdf->useTemplate($phppdf->importPage($i));

        if ($i == $thisPage) {
            $phppdf->Image(
                $signature, 
                $d->x ?? 0, 
                $d->y ?? 0, 
                $d->w ?? 0, 
                $d->h ?? 0
            );
        }
    }
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