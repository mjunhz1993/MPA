<?php
require $_SERVER['DOCUMENT_ROOT'].'/crm/php/file/resize/ImageResize.php';

function resizeImage(string $orgFile, string $newFile, int $size = 1900): string
{
    $image = new \Gumlet\ImageResize($orgFile);
    $image->resizeToWidth($size);
    $image->save($newFile);
    return true;
}
?>