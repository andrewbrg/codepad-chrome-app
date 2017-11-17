var IdeSettingsHandler = function () {

    this.Editors   = undefined;
    this.parentKey = 'ide_settings';

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this._persist = function (key, val) {

        if (typeof key === typeof undefined || typeof val === typeof undefined) {
            return this;
        }

        var that = this;
        chrome.storage.sync.get(this.parentKey, function (obj) {

            if (typeof obj === typeof undefined || !obj.hasOwnProperty(that.parentKey)) {
                obj[that.parentKey] = {};
            }

            obj[that.parentKey][key] = val;
            chrome.storage.sync.set(obj);
        });
    };

    this._populateViewSetting = function (el) {

        var $el  = $(el);
        var type = $el.attr('type');
        var key  = $el.attr('data-option').toString();

        this.fetch(key).then(function (val) {

            switch (type) {

                case undefined:
                case 'text':
                case 'number':
                case 'range':
                    $el.val(val);
                    break;

                case 'checkbox':
                    $el.prop('checked', (typeof val === 'boolean') ? val : false);
                    break;
            }

            if ($el.is('select')) {
                $el.select2();
                $el.trigger('change');
            }
        });
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.init = function (Editors) {

        var found = false;
        chrome.storage.sync.get(this.parentKey, function () {
            found = true;
        });

        if (!found) {
            var obj             = {};
            obj[this.parentKey] = {};
            chrome.storage.sync.set(obj);
        }

        this.Editors = Editors;
    };

    this.apply = function (obj) {

        if (typeof obj.key === typeof undefined || typeof obj.val === typeof undefined) {
            return false;
        }

        this.Editors.getAllEditorObjects().forEach(function (editor) {
            if (typeof editor !== typeof undefined) {
                editor.ace.setOption(obj.key, obj.val);
                editor.ace.$blockScrolling = 'Infinity';
            }
        });

        return true;
    };

    this.fetch = function (key) {

        var that     = this;
        var deferred = $.Deferred();

        chrome.storage.sync.get(this.parentKey, function (obj) {

            if (typeof obj === typeof undefined || !obj.hasOwnProperty(that.parentKey) || that.Editors.getNumTabs() === 0) {
                deferred.reject();
            }

            else if (typeof key === typeof undefined || !key) {
                deferred.resolve(obj[that.parentKey]);
            }

            else if (obj[that.parentKey].hasOwnProperty(key)) {
                deferred.resolve(obj[that.parentKey][key]);
            }

            else {
                that.Editors.getAllEditorObjects().forEach(function (editor) {
                    if (typeof editor !== typeof undefined) {
                        deferred.resolve(editor.ace.getOption(key));
                        console.log(editor.ace.getOption(key));
                        return deferred.promise();
                    }
                });
                deferred.reject();
            }
        });

        return deferred.promise();
    };

    this.fetchAll = function () {
        return this.fetch();
    };

    this.flush = function (key) {

        var that = this;

        if (typeof key !== typeof undefined) {
            chrome.storage.sync.get(this.parentKey, function (obj) {

                if (typeof obj === typeof undefined || !obj.hasOwnProperty(that.parentKey)) {
                    obj[that.parentKey] = {};
                }

                delete obj[that.parentKey][key];
                chrome.storage.sync.set(obj);
            });
        }
    };

    this.reset = function (key) {

        this.apply({key: key, val: false});
        this.flush(key);
    };

    this.persistAndApply = function (obj) {

        if (typeof obj.key === typeof undefined || typeof obj.val === typeof undefined) {
            return false;
        }

        if (this.apply(obj) !== false) {
            this._persist(obj.key, obj.val);
        }
    };

    this.getKeyValFromEl = function (el) {

        var $el  = $(el);
        var type = $el.attr('type');
        var key  = $el.attr('data-option').toString();
        var obj  = {key: key, val: undefined};

        if (typeof key === typeof undefined) {
            return obj;
        }

        if ($el.is('input') && typeof type !== typeof undefined && type === 'checkbox') {
            obj.val = $el.prop('checked');
            return obj;
        }

        obj.val = $el.val();
        return obj;
    };

    this.decorateView = function () {

        var that         = this;
        var fontOpts     = '';
        var themeOps     = '';
        var fontSizeOpts = '';

        $(document).find('[data-action="ide-setting"][data-option]').each(function (i, v) {

            var $el = $(v);
            var key = $el.attr('data-option').toString();

            if (key === 'theme') {
                $.get('/src/settings/ace.themes.json', function (data) {
                    $.each(JSON.parse(data), function (i1, v1) {
                        themeOps += '<optgroup label="' + i1 + '">';
                        $.each(v1, function (i2, v2) {
                            themeOps += '<option value="' + i2 + '">' + v2 + '</option>';
                        });
                        themeOps += '</optgroup>';
                    });
                    $el.html(themeOps);
                    that._populateViewSetting($el);
                });
            }
            else if (key === 'fontSize') {
                $.get('/src/settings/ace.font.sizes.json', function (data) {
                    $.each(JSON.parse(data), function (i1, v1) {
                        fontSizeOpts += '<option value="' + i1 + '">' + v1 + '</option>';
                    });
                    $el.html(fontSizeOpts);
                    that._populateViewSetting($el);
                });
            }
            else if (key === 'fontFamily') {
                $.get('/src/settings/ace.fonts.json', function (data) {
                    $.each(JSON.parse(data), function (i1, v1) {
                        fontOpts += '<optgroup label="' + i1 + '">';
                        $.each(v1, function (i2, v2) {
                            fontOpts += '<option value="' + i2 + '">' + v2 + '</option>';
                        });
                        fontOpts += '</optgroup>';
                    });
                    $el.html(fontOpts);
                    that._populateViewSetting($el);
                });
            }
            else {
                that._populateViewSetting($el);
            }
        });
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


};