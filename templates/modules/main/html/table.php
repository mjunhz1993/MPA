<div id="main_table" class="tableBox box col100" data-module="<?php echo $module; ?>" data-filteraccess="<?php echo $_SESSION['role_module_filter_access']; ?>"><div class="horizontalTable"></div></div>

<script>
    var data = {
        left: { button: "add" },
        center: true,
        right: { table: "Options_table" }
    }
    $('#main_table').prepend(HTML_tableTop(data));

    var data = {
        left: {table: "counter"},
        right: {table: "load_more"}
    }
    $('#main_table').append(HTML_tableTop(data));
</script>

<?php if(!isset($moduleCanAdd) || !in_array($_SESSION['user_role_id'], $moduleCanAdd)): ?>
<script> $('#main_table .tableTop .buttonGreen').first().remove() </script>
<?php endif ;?>