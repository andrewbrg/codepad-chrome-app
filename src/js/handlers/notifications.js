var NotificationsHandler = function(){
    this.notify = function (type, title, message) {

        var obj = {message: message};

        if (typeof title !== typeof undefined) {
            obj.title = title;
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