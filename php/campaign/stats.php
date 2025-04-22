<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
if(isset($GLOBALS["config"]["SENDGRID"])):
$SENDGRID = $GLOBALS["config"]["SENDGRID"];


function check_campaign_stat_tables($SQL, $db){
    $T = $SQL->query("SELECT * FROM information_schema.tables WHERE table_schema = '$db' AND table_name = 'campaign_stats' LIMIT 1");
    if($T->num_rows != 1){
        $A = $SQL->query("CREATE TABLE campaign_stats
        (
            stat_date DATE PRIMARY KEY,
            requests INT(100) DEFAULT 0,
            delivered INT(100) DEFAULT 0,
            opens INT(100) DEFAULT 0,
            unique_opens INT(100) DEFAULT 0,
            processed INT(100) DEFAULT 0,
            clicks INT(100) DEFAULT 0,
            unique_clicks INT(100) DEFAULT 0,
            bounces INT(100) DEFAULT 0,
            invalid_emails INT(100) DEFAULT 0,
            spam_reports INT(100) DEFAULT 0,
            blocks INT(100) DEFAULT 0,
            unsubscribes INT(100) DEFAULT 0
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci");

        $A = $SQL->query("CREATE TABLE campaign_stats_devices
        (
            stat_date DATE,
            name VARCHAR(100),
            opens INT(100) DEFAULT 0,
            unique_opens INT(100) DEFAULT 0,
            PRIMARY KEY (stat_date, name)
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci");

        $A = $SQL->query("CREATE TABLE campaign_stats_geo
        (
            stat_date DATE,
            name VARCHAR(100),
            opens INT(100) DEFAULT 0,
            unique_opens INT(100) DEFAULT 0,
            clicks INT(100),
            unique_clicks INT(100),
            PRIMARY KEY (stat_date, name)
        )
        CHARACTER SET utf8 COLLATE utf8_general_ci");
    }
}


if(isset($_GET['get_stats'])){
    $data = array();
    $type = SafeInput($SQL, $_GET['type']);
    $year = SafeInput($SQL, $_GET['year']);
    $month = SafeInput($SQL, $_GET['month']);

    if($type == 'stats'){
        $A = $SQL->query("SELECT DAY(stat_date),requests,delivered,opens,unique_opens,processed,
        clicks,unique_clicks,bounces,invalid_emails,spam_reports,blocks,unsubscribes FROM campaign_stats WHERE YEAR(stat_date) = '$year' AND MONTH(stat_date) = '$month'");
        if($A){while ($B = $A->fetch_row()){
            $data[intval($B[0])] = array(
                'requests' => $B[1],
                'delivered' => $B[2],
                'opens' => $B[3],
                'unique_opens' => $B[4],
                'processed' => $B[5],
                'clicks' => $B[6],
                'unique_clicks' => $B[7],
                'bounces' => $B[8],
                'invalid_emails' => $B[9],
                'spam_reports' => $B[10],
                'blocks' => $B[11],
                'unsubscribes' => $B[12]
            );
        }}
    }
    else if($type == 'stats_specific'){
        $A = $SQL->query("SELECT DAY(stat_date),name,opens,unique_opens,clicks,unique_clicks FROM campaign_stats_geo
        WHERE YEAR(stat_date) = '$year' AND MONTH(stat_date) = '$month'");
        while ($B = $A->fetch_row()){
            $data['geo'][$B[1]][intval($B[0])] = array(
                'opens' => $B[2],
                'unique_opens' => $B[3],
                'clicks' => $B[4],
                'unique_clicks' => $B[5]
            );
        }
        $A = $SQL->query("SELECT DAY(stat_date),name,opens,unique_opens FROM campaign_stats_devices
        WHERE YEAR(stat_date) = '$year' AND MONTH(stat_date) = '$month'");
        while ($B = $A->fetch_row()){
            $data['devices'][$B[1]][intval($B[0])] = array(
                'opens' => $B[2],
                'unique_opens' => $B[3],
            );
        }
    }
    echo json_encode($data);
}

if(isset($_GET['toggle_stats'])){
    check_campaign_stat_tables($SQL, $INIconf['SQL']['database']);
    if($_GET['toggle_stats'] == 'hide'){ $acc = ''; }else{ $acc = 'STATS'; }
    $A = $SQL->query("UPDATE module SET accessories = '$acc' WHERE module = 'campaign' LIMIT 1");
}

endif;
?>