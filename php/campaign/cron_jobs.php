<?php
if(!isset($GLOBALS["config"]["SENDGRID"])){ exit(); }

function HTML_emailHead($titel){
    return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'.
    '<html xmlns="https://www.w3.org/1999/xhtml"><head><title>'.$titel.'</title>'.
    '<meta http–equiv="Content-Type" content="text/html; charset=UTF-8" /><meta http–equiv="X-UA-Compatible" content="IE=edge" />'.
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>'.
    '<body style="margin:0px; padding:0px;" bgcolor="#efefef">';
}

function send_event($SQL){
    $maxEmailCount = 1;

    $A = $SQL->query("SELECT id,campaign_list,campaign_template,name,start_date,list_offset
    FROM campaign_event WHERE finished = 0 LIMIT 1");
    if($A->num_rows == 0){ return 'No_events'; }
    while ($B = $A->fetch_row()){
        $id = $B[0];
        $list = $B[1];
        $template = $B[2];
        $subject = $B[3];
        $send_at = strtotime($B[4]);
        $OFFSET = $B[5];
    }

    if($GLOBALS["config"]["crm_email"] == ''){ return 'No_CRM_email'; }
    $A = $SQL->query("SELECT email_accounts_email FROM email_accounts WHERE email_accounts_user = '".$GLOBALS["config"]["crm_email"]."' LIMIT 1");
    if($A->num_rows == 0){ return 'No_CRM_email'; }
    while ($B = $A->fetch_row()){ $from = $B[0]; }

    $A = $SQL->query("SELECT body FROM campaign_template WHERE id = '$template' LIMIT 1");
    while ($B = $A->fetch_row()){ $template = HTML_emailHead($subject).$B[0].'</body></html>'; }

    $A = $SQL->query("SELECT email,name FROM campaign_email WHERE campaign_list = '$list' AND subscribed = 1 LIMIT $maxEmailCount OFFSET $OFFSET");
    $EmailCount = $A->num_rows;
    if($EmailCount == $maxEmailCount){
        $OFFSET = $OFFSET + $maxEmailCount;
        $U = $SQL->query("UPDATE campaign_event SET list_offset = $OFFSET WHERE id = $id LIMIT 1");
    }
    else{
        $U = $SQL->query("UPDATE campaign_event SET finished = 1 WHERE id = $id LIMIT 1");
    }
    if($EmailCount == 0){ return 'List_empty'; }

    $emailArr = array();
    while ($B = $A->fetch_row()){
        $tempArr = array(
            'to' => [array('email' => $B[0])],
            'substitutions' => array(
                '{{user_id}}' => $B[0],
                '{{user_name}}' => $B[1]
            )
        );
        array_push($emailArr, $tempArr);
    }
    return sendgrid_send($emailArr,$from,$subject,$template,$send_at);
}

function sendgrid_send($emailArr,$from,$subject,$template,$send_at){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.sendgrid.com/v3/mail/send");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Authorization: Bearer '.$GLOBALS["config"]["SENDGRID"],
        'Content-Type: application/json'
    ));

    $eventData = array(
        'personalizations' => $emailArr,
        'from' => array('email' => $from), 
        'subject' => $subject, 
        'content' => [array('type' => 'text/html', 'value' => $template)],
        'send_at' => $send_at
    );

    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($eventData));
    $result = curl_exec($ch);
    curl_close($ch);
    if(json_decode($result)->errors){ return $result; }
    return 'Send_success';
}

if(isset($_GET['sendgrid_send_mail'])){ echo send_event($SQL); }

if(isset($_GET['sendgrid_get_stats'])){
    $ch = curl_init();
    $date = date('Y-m-d', strtotime('-1 day'));
    curl_setopt($ch, CURLOPT_URL, "https://api.sendgrid.com/v3/stats?start_date=".$date."&end_date=".$date);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer '.$GLOBALS["config"]["SENDGRID"]));
    $result = json_decode(curl_exec($ch));
    curl_close($ch);
    if(isset($result->errors)){ echo '<hr>'; }
    else if(isset($result[0]->date)){
        $result = $result[0];
        $date = $result->date;
        $r = $result->stats[0]->metrics;
        $A = $SQL->query("INSERT INTO campaign_stats
        (stat_date,requests,delivered,opens,unique_opens,processed,
        clicks,unique_clicks,bounces,invalid_emails,spam_reports,blocks)
        VALUES
        ('$date','$r->requests','$r->delivered','$r->opens','$r->unique_opens','$r->processed',
        '$r->clicks','$r->unique_clicks','$r->bounces','$r->invalid_emails','$r->spam_reports','$r->blocks')
        ON DUPLICATE KEY UPDATE
        requests = '$r->requests', delivered = '$r->delivered', opens = '$r->opens', unique_opens = '$r->unique_opens', processed = '$r->processed', clicks = '$r->clicks',
        unique_clicks = '$r->unique_clicks', bounces = '$r->bounces', invalid_emails = '$r->invalid_emails', spam_reports = '$r->spam_reports', blocks = ' $r->blocks'
        ");
    }
}

if(isset($_GET['sendgrid_get_stats_devices'])){
    $ch = curl_init();
    $date = date('Y-m-d', strtotime('-1 day'));
    curl_setopt($ch, CURLOPT_URL, "https://api.sendgrid.com/v3/devices/stats?start_date=".$date."&end_date=".$date);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer '.$GLOBALS["config"]["SENDGRID"]));
    $result = json_decode(curl_exec($ch));
    curl_close($ch);
    if(isset($result->errors)){ echo '<hr>'; }
    else if(isset($result[0]->date)){
        $result = $result[0];
        $date = $result->date;
        $VALUES = array();
        $s = $result->stats;
        for($i=0; $i<count($s); $i++){
            $name = $s[$i]->name;
            $m = $s[$i]->metrics;
            $arr = array();
            array_push($arr, $date, $name, $m->opens, $m->unique_opens);
            array_push($VALUES, "('".implode("','", $arr)."')");
        }
        $VALUES = implode(',', $VALUES);
        $A = $SQL->query("INSERT INTO campaign_stats_devices (stat_date,name,opens,unique_opens) VALUES $VALUES");
    }
}

if(isset($_GET['sendgrid_get_stats_geo'])){
    $ch = curl_init();
    $date = date('Y-m-d', strtotime('-1 day'));
    curl_setopt($ch, CURLOPT_URL, "https://api.sendgrid.com/v3/geo/stats?start_date=".$date."&end_date=".$date);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer '.$GLOBALS["config"]["SENDGRID"]));
    $result = json_decode(curl_exec($ch));
    curl_close($ch);
    if(isset($result->errors)){ echo '<hr>'; }
    else if(isset($result[0]->date)){
        $result = $result[0];
        $date = $result->date;
        $VALUES = array();
        $s = $result->stats;
        for($i=0; $i<count($s); $i++){
            $name = $s[$i]->name;
            $m = $s[$i]->metrics;
            $arr = array();
            array_push($arr, $date, $name, $m->opens, $m->unique_opens, $m->clicks, $m->unique_clicks);
            array_push($VALUES, "('".implode("','", $arr)."')");
        }
        $VALUES = implode(',', $VALUES);
        $A = $SQL->query("INSERT INTO campaign_stats_geo (stat_date,name,opens,unique_opens,clicks,unique_clicks) VALUES $VALUES");
    }
}
?>