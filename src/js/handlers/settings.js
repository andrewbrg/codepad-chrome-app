var SettingsHandler = function () {

    this.set = function (key, value) {

        if (
            (typeof key === typeof undefined || !key) ||
            (typeof value === typeof undefined || !value)
        ) {
            return this;
        }

        var setting  = {};
        setting[key] = value;

        chrome.storage.sync.set(setting);

        return this;
    };

    this.get = function (key) {

        var deferred = $.Deferred();

        if (typeof key === typeof undefined || !key) {
            deferred.resolve(undefined);
        }
        else {
            chrome.storage.sync.get(key, function (obj) {
                deferred.resolve(obj[key]);
            });
        }

        return deferred.promise();
    };

    this.applyIdeSettingsToView = function (editor) {

        var that = this;

        $(document).find('input[data-option], select[data-option]').each(function (i, v) {

            var $v  = $(v);
            var key = $v.attr('data-option');

            that.get(key).then(function (val) {

                if (typeof $v === typeof undefined) {
                    return false;
                }

                if (typeof val === typeof undefined && typeof editor !== typeof undefined) {
                    val = editor.getOption(key);
                    that.set(key, val);
                }

                if (typeof $v.attr('type') !== typeof undefined) {
                    switch ($v.attr('type')) {
                        case 'checkbox':
                            if (typeof val === 'boolean') {
                                $v.prop('checked', val);
                            }
                            break;

                        case 'number':
                            $v.val(val);
                            break;
                    }
                }
                else if ($v.is('select')) {
                    $v.val(val);
                }
            });
        });
    };
};