<?php

function csv_to_php($obj)
{
    $filePath = $_SERVER['DOCUMENT_ROOT']
        . $GLOBALS['MAP']['UPLOADS']
        . $obj->filename
        . '.csv';

    // Upload file if requested
    if (!empty($obj->upload)) {

        if (
            empty($obj->file['tmp_name'][0]) ||
            !is_uploaded_file($obj->file['tmp_name'][0])
        ) {
            return ['error' => 'Invalid uploaded file'];
        }

        if (!move_uploaded_file($obj->file['tmp_name'][0], $filePath)) {
            return ['error' => 'Could not save uploaded CSV'];
        }
    }

    if (!file_exists($filePath)) {
        return ['error' => 'File does not exist'];
    }

    $file = fopen($filePath, "r");

    if ($file === false) {
        return ['error' => 'Could not open CSV file'];
    }

    // Skip first line if requested
    $skipFirstLine = !empty($obj->skip);

    // CSV settings
    $delimiter = $obj->delimiter ?? ";";
    $enclosure = $obj->enclosure ?? '"';
    $escape    = $obj->escape ?? "\\";

    while (($row = fgetcsv(
        $file,
        0,
        $delimiter,
        $enclosure,
        $escape
    )) !== false) {

        if ($skipFirstLine) {
            $skipFirstLine = false;
            continue;
        }

        // Skip empty rows
        if ($row === [null] || empty(array_filter($row, function ($value) {
            return $value !== null && $value !== '';
        }))) {
            continue;
        }

        if (isset($obj->line) && is_callable($obj->line)) {

            $result = ($obj->line)($row);

            // Allow callback to return an error
            if (is_array($result) && !empty($result['error'])) {
                fclose($file);
                return $result;
            }
        }
    }

    fclose($file);

    return ['rows' => true];
}


function csv_to_sql($SQL, $obj)
{
    if (empty($obj->columns)) {
        return ['error' => 'No MySQL columns specified'];
    }

    if (empty($obj->table)) {
        return ['error' => 'No MySQL table specified'];
    }

    // Validate table name
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $obj->table)) {
        return ['error' => 'Invalid table name'];
    }

    // Validate columns
    foreach ($obj->columns as $column) {

        if (!preg_match('/^[a-zA-Z0-9_]+$/', $column)) {
            return [
                'error' => 'Invalid column name: ' . $column
            ];
        }
    }

    // Build column SQL
    $columnSql = '`' . implode('`, `', $obj->columns) . '`';

    // Build placeholders
    $placeholders = implode(
        ', ',
        array_fill(0, count($obj->columns), '?')
    );

    // Build INSERT
    $insert = "
        INSERT INTO `$obj->table` ($columnSql)
        VALUES ($placeholders)
    ";

    $stmt = $SQL->prepare($insert);

    if ($stmt === false) {
        return [
            'error' => 'Prepare failed: ' . $SQL->error
        ];
    }

    $inserted = 0;

    // Create temporary CSV object
    $tempFile = new stdClass();

    $tempFile->filename = 'tempCsv';
    $tempFile->file = $obj->file;

    $tempFile->upload = true;

    $tempFile->skip = $obj->skip ?? false;
    $tempFile->delimiter = $obj->delimiter ?? ";";
    $tempFile->enclosure = $obj->enclosure ?? '"';
    $tempFile->escape = $obj->escape ?? "\\";

    // Callback for every CSV row
    $tempFile->line = function ($row) use (
        $obj,
        $stmt,
        &$inserted
    ) {

        // Not enough columns
        if (count($row) < count($obj->columns)) {
            return;
        }

        // Only take required columns
        $row = array_slice(
            $row,
            0,
            count($obj->columns)
        );

        // All CSV values are strings
        $types = str_repeat(
            's',
            count($obj->columns)
        );

        if (!$stmt->bind_param($types, ...$row)) {
            return [
                'error' => 'bind_param failed: ' . $stmt->error
            ];
        }

        if (!$stmt->execute()) {

            return [
                'error' =>
                    'Insert failed on row '
                    . ($inserted + 1)
                    . ': '
                    . $stmt->error
            ];
        }

        $inserted++;
    };

    // Process CSV
    $csvResult = csv_to_php($tempFile);

    if (!empty($csvResult['error'])) {
        $stmt->close();

        return $csvResult;
    }

    $stmt->close();

    return [
        'rows' => $inserted
    ];
}

?>