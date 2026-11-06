function detect_swipe(options) {

    var settings = $.extend({
        direction: 'left',
        element: $(document),
        threshold: 50,
        detected: function() {}
    }, options);

    var startX = 0;
    var startY = 0;
    var enabled = true;

    settings.element.on('touchstart.slideDetect', function(e) {
        if (!enabled) return;

        startX = e.originalEvent.touches[0].clientX;
        startY = e.originalEvent.touches[0].clientY;
    });

    settings.element.on('touchend.slideDetect', function(e) {
        if (!enabled) return;

        var endX = e.originalEvent.changedTouches[0].clientX;
        var endY = e.originalEvent.changedTouches[0].clientY;

        var diffX = startX - endX;
        var diffY = startY - endY;

        var detected = false;

        switch (settings.direction) {
            case 'left':
                detected = diffX > settings.threshold && Math.abs(diffX) > Math.abs(diffY);
                break;
            case 'right':
                detected = diffX < -settings.threshold && Math.abs(diffX) > Math.abs(diffY);
                break;
            case 'up':
                detected = diffY > settings.threshold && Math.abs(diffY) > Math.abs(diffX);
                break;
            case 'down':
                detected = diffY < -settings.threshold && Math.abs(diffY) > Math.abs(diffX);
                break;
        }

        if (detected) settings.detected();
    });

    return {
        stop: function() {
            enabled = false;
        },
        start: function() {
            enabled = true;
        },
        destroy: function() {
            enabled = false;
            settings.element.off('.slideDetect');
        }
    };
}