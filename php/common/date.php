<?php
function UtcToLocal($UtcDate, $local = 'Europe/Ljubljana'){
	$date = DateTime::createFromFormat(
        'Y-m-d H:i:s',
        $UtcDate,
        new DateTimeZone('UTC')
    );
    $date->setTimeZone(new DateTimeZone($local));
    return $date;
}
?>