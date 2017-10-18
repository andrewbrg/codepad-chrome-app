var SettingsHandler = function () {

    this.save = function (key, value) {

        if (typeof value === typeof undefined || !value) {
            return this;
        }

        var setting  = {};
        setting[key] = value;

        chrome.storage.sync.set(setting);

        return this;
    }
};