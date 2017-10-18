var ModalsHandler = function () {

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public methods
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.getModalContainer = function (el) {

        var dt = $(el).attr('data-target');

        return (typeof dt === typeof undefined)
            ? undefined
            : $(document).find('.' + this._cleanDataTarget(dt)).first();
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private methods
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this._cleanDataTarget = function (dt) {

        return dt.replace(/[^a-zA-Z0-9\-]/g, '');
    };

    this._getModalContent = function (el, callback) {

        var $el      = $(el);
        var deferred = $.Deferred();

        if ($el.hasClass('modal-appearance')) {
            $.get('/src/html/modals/editor/appearance.html').done(function (data) {
                deferred.resolve(data, callback);
            });
        }

        if ($el.hasClass('modal-ide-settings')) {
            $.get('/src/html/modals/editor/ide.settings.html').done(function (data) {
                deferred.resolve(data, callback);
            });
        }

        return deferred.promise();
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Event Callbacks
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.onShowBs = function (el, callback) {

        var $el = $(el);
        var $mc = this.getModalContainer($el);

        if (typeof $mc === typeof undefined) {
            return false;
        }

        this._getModalContent($el).done(function (data, callback) {
            var $modalContent = $mc.find('.modal-content').first();
            $modalContent.find('.modal-title').first().html($el.html());
            $modalContent.find('.modal-body').first().html(data);

            if (typeof callback !== typeof callback && isFunction(callback)) {
                callback().bind(this);
            }
        });
    };

    this.onHideBs = function (el) {

        var $el           = $(el);
        var $modalContent = $el.find('.modal-content').first();

        $modalContent.find('.modal-title').first().html('');
        $modalContent.find('.modal-body').first().html('');
    };
};