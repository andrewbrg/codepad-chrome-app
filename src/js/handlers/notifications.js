let NotificationsHandler = function () {

    this.versionUpdateId = 'version_update';
    this.ratingReminderId = 'rating_reminder';

    this.versionKey = 'last_notified_version';
    this.requestRateKey = 'rate_requested';
    this.disableRateKey = 'rate_disabled';

    this.init = function () {

        let that = this;

        chrome.storage.local.get(this.versionKey, function (version) {

            let currentVer = chrome.runtime.getManifest().version;
            let previousVer = version[that.versionKey] || false;

            if (!previousVer || currentVer.replace(/[^0-9]/g, '') > previousVer.replace(/[^0-9]/g, '')) {

                if (parseInt(currentVer.replace(/[^0-9]/g, '')) === 1095) {
                    return;
                }

                chrome.notifications.create(that.versionUpdateId, {
                    type: 'basic',
                    iconUrl: '/src/img/codepad.128.png',
                    title: 'Code Pad IDE updated',
                    message: 'Your installation of Code Pad has been updated to v' + currentVer
                }, function () {

                    if (chrome.runtime.lastError) {
                        console.info(chrome.runtime.lastError.message);
                    }

                    let obj = {};
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
                        message: 'Please leave a rating on the Chrome Store, it helps the application grow :)',
                        requireInteraction: true,
                        isClickable: true,
                        buttons: [{
                            title: 'Click to give your rating'
                        }]
                    }, function () {
                        if (chrome.runtime.lastError) {
                            console.info(chrome.runtime.lastError.message);
                        }

                        let obj = {};
                        obj[that.requestRateKey] = true;
                        chrome.storage.local.set(obj);
                    });
                }
            });
        }, 3000);


        chrome.storage.local.get(that.disableRateKey, function (requested) {
            requested = requested[that.disableRateKey] || false;
            if (!requested) {
                window.setTimeout(function () {
                    $(document).find('[data-toggle="modal"].modal-content-rate').trigger('click');
                }, 5000);
            }
        });

        chrome.notifications.onButtonClicked.addListener(function (notificationId) {
            if (notificationId === that.ratingReminderId) {
                window.open('https://chrome.google.com/webstore/detail/code-pad-ide/adaepfiocmagdimjecpifghcgfjlfmkh/reviews');
            }
        });
    };

    this.notify = function (type, title, message) {

        let icon;
        let sound;

        type = (message === 'User cancelled') ? 'warning' : type;

        switch (type) {
            case 'danger':
                icon = 'fa fa-fw fa-exclamation-triangle';
                sound = '/src/sounds/notif-danger.ogg';
                console.info(message);
                break;
            case 'warning':
                icon = 'fa fa-fw fa-exclamation-triangle';
                sound = '/src/sounds/notif-danger.ogg';
                console.info(message);
                break;
            default:
                icon = 'fa fa-fw fa-bell';
                sound = '/src/sounds/notif-info.ogg';
                console.info(message);
                break;
        }

        let obj = {icon: icon, message: message};

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

                let $el = $(
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