<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php'); ?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="/crm/static/img/OKTAGON-IT.ico">
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
<title><?php echo $CRM_name; ?> MPA</title>
<style type="text/css">
    body{
        font-family: Roboto,RobotoDraft,Helvetica,Arial,sans-serif;
        margin: 0px;
        padding: 0px;
        text-align: center;
        height: 100vh;
        background-color: #def0ff;
    }
    table{
        width: 100%;
        height: 100%;
    }
    #box{
        display: inline-block;
        background-color: white;
        border: 1px solid gainsboro;
        box-shadow: 0 0 5px black;
        padding: 10px;
    }
    .logo{
        height: 50px;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        margin: 30px 0px;
    }
    p{
        padding: 0px;
        margin: 0px;
    }
</style>
</head>
<body>
    <?php
    $email = SafeInput($SQL, $_GET['email']);
    $A = $SQL->query("SELECT email FROM campaign_email WHERE email = '$email' AND subscribed = 1 LIMIT 1");
    ?>

    <?php
    if($A->num_rows == 1):
    $A = $SQL->query("UPDATE campaign_email SET subscribed = 0 WHERE email = '$email'");
    ?>
        <table>
            <tr>
                <td>
                    <div id="box">
                        <?php if(isset($GLOBALS["config"]['company_logo'])): ?>
                            <div class="logo" style="background-image:url('/crm/php/user_data/<?php echo $GLOBALS["config"]['company_logo']; ?>');"></div>
                            <hr>
                        <?php endif; ?>
                        <h1><?php echo slovar('Unsub_title'); ?></h1>
                        <p><?php echo slovar('Unsub_p_start'); ?> (<b><?php echo $email; ?></b>) <?php echo slovar('Unsub_p_end'); ?>.</p>
                    </div>
                </td>
            </tr>
        </table>
    <?php endif; ?>
</body>
</html>