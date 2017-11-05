var NotificationsHandler = function () {
    this.notify = function (type, title, message) {

        var obj = {message: message};

        if (typeof title !== typeof undefined && title.length > 0) {
            obj.title = '<strong>' + title + '</strong><br />';
        }

        $.notify(
            obj,
            {
                type: type,
                placement: {
                    from: "bottom",
                    align: "right"
                },
                offset: 10
            }
        );
    };
};