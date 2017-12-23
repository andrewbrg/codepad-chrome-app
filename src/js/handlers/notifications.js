var NotificationsHandler = function () {

    this.versionUpdateId  = 'version_update';
    this.ratingReminderId = 'rating_reminder';

    this.versionKey     = 'last_notified_version';
    this.requestRateKey = 'rate_requested';

    this.init = function () {

        var that = this;

        chrome.storage.local.get(this.versionKey, function (version) {

            var currentVer  = chrome.runtime.getManifest().version;
            var previousVer = version[that.versionKey] || false;

            if (!previousVer || currentVer.replace(/[^0-9]/g, '') > previousVer.replace(/[^0-9]/g, '')) {
                chrome.notifications.create(that.versionUpdateId, {
                    type: 'basic',
                    iconUrl: '/src/img/codepad.128.png',
                    title: 'Code Pad IDE updated',
                    message: 'Your installation of Code Pad has been updated to v' + currentVer
                }, function () {

                    if (chrome.runtime.lastError) {
                        console.info(chrome.runtime.lastError.message);
                    }

                    var obj              = {};
                    obj[that.versionKey] = currentVer;
                    chrome.storage.local.set(obj);
                });
            }
        });

        window.setTimeout(function () {
            chrome.storage.local.get(that.requestRateKey, function (requested) {

                requested = requested[that.requestRateKey] || false;

                if (!requested) {

                    chrome.notifications.create(that.ratingReminderId, {
                        type: 'basic',
                        iconUrl: '/src/img/codepad.128.png',
                        title: 'Do you like Code Pad?',
                        message: 'Please help us by leaving a rating on the Chrome Store, it helps the application grow...',
                        requireInteraction: true,
                        isClickable: true,
                        buttons: [{
                            title: 'Click to give your rating'
                        }]
                    }, function () {

                        if (chrome.runtime.lastError) {
                            console.info(chrome.runtime.lastError.message);
                        }

                        var obj                  = {};
                        obj[that.requestRateKey] = true;
                        chrome.storage.local.set(obj);
                    });

                }
            });
        }, 3000);

        chrome.notifications.onButtonClicked.addListener(function (notificationId) {
            if (notificationId === that.ratingReminderId) {
                window.open('https://chrome.google.com/webstore/detail/code-pad-ide/adaepfiocmagdimjecpifghcgfjlfmkh/reviews');
            }
        });
    };

    this.notify = function (type, title, message) {

        var icon;
        var sound;

        type = (message === 'User cancelled') ? 'warning' : type;

        switch (type) {
            case 'danger':
                icon  = 'fa fa-fw fa-exclamation-triangle';
                sound = '/src/sounds/notif-danger.ogg';
                console.info(message);
                break;
            case 'warning':
                icon  = 'fa fa-fw fa-exclamation-triangle';
                sound = '/src/sounds/notif-danger.ogg';
                console.info(message);
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