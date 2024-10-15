function resize_columns(){
    hideDropdownMenu();
    var thead = $('#main_table .table thead').first();
    var th = thead.find('th:not(.toolColumn)');
    if(thead.find('.ui-resizable-e').length != 0){ return stop_resize_columns(th) }

    th.each(function(){
        if(!valEmpty($(this).attr('data-width'))){ add_clear_resize_button($(this)) }
    });

    loadJS('https://code.jquery.com/ui/1.12.1/jquery-ui.js', function(){
        th.resizable({
            minWidth: 100,
            maxWidth: 5000,
            start: function(){ th.css('transition','0s') },
            stop: function(event, ui){
                th.css('transition','');
                add_clear_resize_button(ui.element);
                ui.element.attr('data-width',ui.size.width);
                save_resize_columns(ui.element.attr('data-column'), ui.size.width);
            }
        }).attr('onclick','');
        $('.ui-resizable-e').css({
            'cursor':'e-resize',
            'padding':'5px 0',
            'margin-top':'4px',
            'text-align':'center',
            'border':'1px dotted grey'
        }).html(getSVG('move'));
    });
}

function save_resize_columns(col, size){
    if(col.includes('.')){ col = col.split('.')[1] }
    $.post('/crm/php/main/module.php?resize_columns=1', {
        csrf_token: $('[name=csrf_token]').val(),
        column_id:col,
        size:size
    }, function(data){})
}

function add_clear_resize_button(th){
    if(th.find('.x').length != 0){ return }
    th.append('<div class="x">'+getSVG('x')+'</div>');
    th.find('.x').css({
        'position':'absolute',
        'top':'0',
        'right':'0'
    }).click(function(){
        save_resize_columns($(this).parent().attr('data-column'), 0);
        $(this).parent().removeAttr('data-width').css('width','');
        tableResetFixedWidthColumns($(this).closest('table'));
        $(this).remove();
    });
}

function stop_resize_columns(th){
    th.resizable('destroy');
    th.find('.x').remove();
    th.each(function(){if(!$(this).hasClass('no-sort')){ $(this).attr('onclick','sortByColumn($(this))') }});
}