<?php
include($_SERVER['DOCUMENT_ROOT']. '/crm/php/SQL/SQL.php');
include(loadPHP('analytics/class'));
include(loadPHP('analytics/analytics'));
include(loadPHP('analytics/column'));
include(loadPHP('analytics/table'));
include(loadPHP('analytics/sum'));
if(isset($_SESSION['user_id'])){

    if(isset($_POST['analytics_connect'])){ echo json_encode(analytics_connect($SQL, $SQL_db)); }
    if(isset($_POST['analytics_create'])){ echo json_encode(analytics_create($SQL)); }
    if(isset($_POST['analytics_get'])){ echo json_encode(analytics_get($SQL, $_SESSION['user_id'])); }
    if(isset($_POST['analytic_tables_create'])){ echo json_encode(analytic_tables_create($SQL)); }
    if(isset($_POST['analytic_tables_get'])){ echo json_encode(analytic_tables_get($SQL)); }
    if(isset($_POST['analytics_delete'])){ echo json_encode(analytics_delete($SQL)); }
    if(isset($_POST['analytic_content_get'])){ echo json_encode(analytic_content_get($SQL)); }
    if(isset($_POST['analytic_content_create'])){ echo json_encode(analytic_content_create($SQL)); }

    if(isset($_POST['generate_analytic_columns'])){ echo json_encode(generate_analytic_columns($SQL)); }
    if(isset($_POST['generate_analytic_rows'])){ echo json_encode(generate_analytic_rows($SQL)); }

    if(isset($_POST['generate_analytic_sum'])){ echo json_encode(generate_analytic_sum($SQL)); }

    if(isset($_POST['generate_analytic_pie'])){ echo json_encode(generate_analytic_pie($SQL)); }

    if(isset($_POST['generate_analytic_date'])){ echo json_encode(generate_analytic_date($SQL)); }

}
?>