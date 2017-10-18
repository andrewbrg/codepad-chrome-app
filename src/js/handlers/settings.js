var SettingsHandler = function () {

    this.save = function (key, value) {

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

    this.load = function (key) {

        if (typeof key === typeof undefined || !key) {
            return this;
        }

        chrome.storage.sync.get(key);

        return this;
    };
};