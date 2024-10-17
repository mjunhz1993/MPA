<?php
function zip_dir($SQL, $source, $destination){
    $source = $_SERVER['DOCUMENT_ROOT'].'/crm/'.SafeInput($SQL, $source);
    $destination = $_SERVER['DOCUMENT_ROOT'].'/crm/static/uploads/'.SafeInput($SQL, $destination).'.zip';

    if (!extension_loaded('zip') || !file_exists($source)) {
        return 'No_zip_extension';
    }

    $zip = new ZipArchive();
    if (!$zip->open($destination, ZipArchive::CREATE | ZipArchive::OVERWRITE)) {
        return 'Wrong_destination';
    }

    $source = realpath($source);

    if (is_dir($source)) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($source),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $file) {
            // Skip directories (they would be added automatically)
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($source) + 1);

                // Add file to zip
                $zip->addFile($filePath, $relativePath);
            }
        }
    } else if (is_file($source)) {
        $zip->addFile($source, basename($source));
    }

    return $zip->close();
}
?>