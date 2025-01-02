(function() {
    var dragFileTimer;

    function onDragOver(event) {
        var dataTransfer = event.originalEvent.dataTransfer;
        if (dataTransfer.types && (dataTransfer.types.indexOf ? dataTransfer.types.indexOf('Files') !== -1 : dataTransfer.types.contains('Files'))) {
            showFileInputs();
            window.clearTimeout(dragFileTimer);
        }
    }

    function showFileInputs() {
        $("input[type=file]").each(function() {
            if ($(this).val() === '' && !$(this).prop('disabled')) {
                $(this).attr('data-content', slovar('Drag_and_drop')).show();
            }
        });
    }

    window.hideFileInputs = function() {
        dragFileTimer = setTimeout(function() {
            $("input[type=file]").hide();
        }, 25);
    }

    function initDragFileEvents() {
        $(document)
            .on('dragover', onDragOver)
            .on('dragleave drop', hideFileInputs);
    }

    initDragFileEvents();
})();