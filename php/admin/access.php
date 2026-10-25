
<?php
include($_SERVER['DOCUMENT_ROOT'] . '/crm/php/SQL/SQL.php');

function editModuleAccess(mysqli $SQL): array
{
    $data = [];

    if (!isset($_SESSION['user_id'])) {
        return $data;
    }

    if (!isset($_GET['edit_access'])) {
        return $data;
    }

    if ($_SESSION['user_id'] != 1) {
        return ['error' => slovar('Access_denied')];
    }

    $can_view = isset($_POST['view']) && is_array($_POST['view']) && $_POST['view']
        ? implode(',', $_POST['view'])
        : '';

    $can_add = isset($_POST['add']) && is_array($_POST['add']) && $_POST['add']
        ? implode(',', $_POST['add'])
        : '';

    $can_edit = isset($_POST['edit']) && is_array($_POST['edit']) && $_POST['edit']
        ? implode(',', $_POST['edit'])
        : '';

    $can_delete = isset($_POST['delete']) && is_array($_POST['delete']) && $_POST['delete']
        ? implode(',', $_POST['delete'])
        : '';

    if (isset($_POST['module'])) {

        $module = $_POST['module'];

        $A = sql_update(
            $SQL,
            "UPDATE module SET
                can_view = ?,
                can_add = ?,
                can_edit = ?,
                can_delete = ?
            WHERE module = ?
            LIMIT 1",
            [
                $can_view,
                $can_add,
                $can_edit,
                $can_delete,
                $module
            ]
        );

        if (is_array($A)) {
            return ['error' => $A['error']];
        }

        if (isset($_GET['set_columns'])) {

            $A = sql_update(
                $SQL,
                "UPDATE module_columns
                SET can_view = ?, can_edit = ?
                WHERE module = ?",
                [
                    $can_view,
                    $can_edit,
                    $module
                ]
            );

            if (is_array($A)) {
                return ['error' => $A['error']];
            }
        }

    } elseif (isset($_POST['column'])) {

        $column = $_POST['column'];

        $A = sql_update(
            $SQL,
            "UPDATE module_columns
            SET can_view = ?, can_edit = ?
            WHERE column_id = ?
            LIMIT 1",
            [
                $can_view,
                $can_edit,
                $column
            ]
        );

        if (is_array($A)) {
            return ['error' => $A['error']];
        }

    }

    return $data;
}


// Execute the function when edit_access is requested.
if (isset($_GET['edit_access'])) {
    echo json_encode(editModuleAccess($SQL));
}

?>