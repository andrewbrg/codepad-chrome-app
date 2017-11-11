var NotificationsHandler = function () {

    this.notify = function (type, title, message) {

        var icon;
        var sound;

        type = (message === 'User cancelled') ? 'warning' : type;

        switch (type) {
            case 'danger':
                icon  = 'fa fa-fw fa-exclamation-circle';
                sound = '/src/sounds/notif-danger.ogg';
                console.error(message);
                break;
            case 'warning':
                icon  = 'fa fa-fw fa-exclamation-circle';
                sound = '/src/sounds/notif-danger.ogg';
                console.warn(message);
                break;
            default:
                icon  = 'fa fa-fw fa-bell';
                sound = '/src/sounds/notif-info.ogg';
                console.info(message);
                break;
        }

        var obj = {icon: icon, message: message};

        if (typeof message === typeof undefined || message === 'User cancelled') {
            return false;
        }

        if (typeof title !== typeof undefined && title.length > 0) {
            obj.title = '<strong>' + title + '</strong><br />';
        }

        $.notify(obj, {
            type: type,
            delay: 3000,
            placement: {
                from: "bottom",
                align: "right"
            },
            offset: 10,
            animate: {
                enter: 'animated flipInX',
                exit: 'animated fadeOutUp'
            },
            onShow: function () {

                var $el = $(
                    '<audio class="sound-player" autoplay="autoplay" style="display:none;">' +
                    '<source src="' + sound + '" />' +
                    '</audio>'
                );

                $el.appendTo('body');
                setTimeout(function () {
                    $el.remove()
                }, 3000);
            }
        });
    };
};