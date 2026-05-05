<?php
function csv_to_php($obj){
    $filePath = $_SERVER['DOCUMENT_ROOT'].$GLOBALS['MAP']['UPLOADS'].$obj->file.'.csv';

    if (!file_exists($filePath)) {
        return ['error' => 'File does not exist'];
    }

    $file = fopen($filePath, "r");

    // Skip first line if needed (header)
    $firstLine = isset($obj->skip);

    // Optional CSV settings
    $delimiter = $obj->delimiter ?? ",";   // default comma
    $enclosure = $obj->enclosure ?? '"';  // default quote
    $escape    = $obj->escape ?? "\\";    // default escape

    while (($row = fgetcsv($file, 0, $delimiter, $enclosure, $escape)) !== false) {

        if ($firstLine) {
            $firstLine = false;
            continue;
        }

        // Skip empty rows
        if ($row === [null] || $row === false) continue;

        if (isset($obj->line) && is_callable($obj->line)) {
            $obj->line($row);
        }
    }

    fclose($file);
}
?>