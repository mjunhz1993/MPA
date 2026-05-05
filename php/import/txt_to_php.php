<?php
function txt_to_php($obj){
	$filePath = $_SERVER['DOCUMENT_ROOT'].$GLOBALS['MAP']['UPLOADS'].$obj->file.'.txt';

	$file = fopen($filePath, "r");
	if(!$file){ return ['error' => 'File does not exsist']; }

	// --- Skip the first line (header) ---
	$firstLine = isset($obj->skip);

	$i = 0;
	while (($line = fgets($file)) !== false) {
	    
	    if ($firstLine) {
	        $firstLine = false;
	        continue;
	    }

	    // Trim newline and skip empty lines
	    $line = trim($line);
	    if ($line === "") continue;

	    // Split line by TAB character
	    if (isset($obj->line) && is_callable($obj->line)) {
            $obj->line(explode("\t", $line));
        }
	}

	fclose($file);
}
?>