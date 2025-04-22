<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('analytics/analytics'));
include(loadPHP('analytics/data'));
include(loadPHP('export/extra'));

if(isset($_SESSION['user_id'])){
    if(isset($_POST['analytics_connect'])){ echo json_encode(analytics_connect($SQL, $INIconf['SQL']['database'])); }
    if(isset($_POST['analytics_create'])){ echo json_encode(analytics_create($SQL)); }
    if(isset($_POST['analytics_get'])){ echo json_encode(analytics_get($SQL, $_SESSION['user_id'])); }
    if(isset($_POST['analytic_tables_create'])){ echo json_encode(analytic_tables_create($SQL)); }
    if(isset($_POST['update_width_of_analytic_table'])){ echo json_encode(update_width_of_analytic_table($SQL)); }
    if(isset($_POST['analytic_tables_get'])){ echo json_encode(analytic_tables_get($SQL)); }
    if(isset($_POST['analytic_content_get'])){ echo json_encode(analytic_content_get($SQL)); }
    if(isset($_POST['analytic_content_create'])){ echo json_encode(analytic_content_create($SQL)); }
    if(isset($_POST['analytic_content_data'])){ echo json_encode(analytic_content_data($SQL)); }

    if(isset($_POST['analytics_delete'])){ echo json_encode(analytics_delete($SQL)); }
}
?>