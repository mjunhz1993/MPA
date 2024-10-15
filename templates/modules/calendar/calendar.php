<?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/head_tags.php'); ?>
<body>
    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['token']; ?>">
    <div id="Main"><div id="main_calendar"></div></div>
    <script type="text/javascript">
        $('#Main').prepend(HTML_h1_table('Calendar'));
        $(document).ready(function(){loadJS('calendar/calendar', function(){
            setupCalendar($('#main_calendar'), {
                module:'event',
                start:'event_start_date',
                end:'event_end_date',
                color:'event_color',
                assigned:'event_assigned',
                share:'event_share'
            })
        })})
    </script>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/top_nav.php'); ?>
    <?php include($_SERVER['DOCUMENT_ROOT']. '/crm/templates/common/left_nav.php'); ?>
</body>
</html>