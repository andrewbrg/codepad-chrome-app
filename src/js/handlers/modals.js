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

    this._getModalContent = function (el) {

        var $el      = $(el);
        var deferred = $.Deferred();
        var callback = function (data) {
            deferred.resolve({html: data, idx: $el.attr('data-idx'), nodeid: $el.attr('data-nodeid')});
        };

        if ($el.hasClass('modal-ide-appearance')) {
            $.get('/src/html/modals/editor/appearance.html').done(callback);
        }

        if ($el.hasClass('modal-ide-settings')) {
            $.get('/src/html/modals/editor/ide.settings.html').done(callback);
        }

        if ($el.hasClass('modal-confirm-close-tab')) {
            $.get('/src/html/modals/file/confirm.close.tab.html').done(callback);
        }

        if ($el.hasClass('modal-content-help')) {
            $.get('/src/html/modals/content/help.html').done(callback);
        }

        if ($el.hasClass('modal-github-auth')) {
            $.get('/src/html/modals/github/authenticate.html').done(callback);
        }

        if ($el.hasClass('modal-rename-file')) {
            $.get('/src/html/modals/file/rename.file.html').done(callback);
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

        this._getModalContent($el).done(function (data) {
            var $modalContent = $mc.find('.modal-content').first();

            var title = (typeof $el.attr('data-title') !== typeof undefined)
                ? $el.attr('data-title')
                : $el.html();

            var $html  = $(data.html);
            var $modal = $modalContent.find('.modal-body').first().closest('.modal');

            if (typeof data.idx !== typeof undefined) {
                $html.find('button').attr('data-idx', data.idx);
                $modal.attr('data-idx', data.idx);
            }

            if (typeof data.nodeid !== typeof undefined) {
                $html.find('button').attr('data-nodeid', data.nodeid);
                $modal.attr('data-nodeid', data.nodeid);
            }

            $modalContent.find('.modal-title').first().html(title);
            $modalContent.find('.modal-body').first().html($html);

            if (typeof callback === 'function') {
                callback();
            }
        });
    };

    this.onHideBs = function (el) {

        var $el           = $(el);
        var $modalContent = $el.find('.modal-content').first();

        $modalContent.find('.modal-title').first().html('');
        $modalContent.find('.modal-body').first().html('');
        $modalContent.find('.modal-body').first().closest('.modal').removeAttr('data-idx');
        $modalContent.find('.modal-body').first().closest('.modal').removeAttr('data-nodeid');
    };
};