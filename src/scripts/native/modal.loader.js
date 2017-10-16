var ModalLoader = function () {

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

    this._getModalTitle = function (el) {

        var attr = $(el).attr('data-title');

        return (typeof attr !== typeof undefined && attr !== false)
            ? attr
            : '';
    };

    this._getModalContent = function (el) {

        var $el      = $(el);
        var deferred = $.Deferred();

        if ($el.hasClass('modal-appearance')) {
            $.get('/src/html/modals/editor/appearance.html').done(function (data) {
                deferred.resolve(data);
                return deferred.promise();
            });
        }

        if ($el.hasClass('modal-ide-settings')) {
            $.get('/src/html/modals/editor/ide.settings.html').done(function (data) {
                deferred.resolve(data);
                return deferred.promise();
            });
        }
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Event Callbacks
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.onShowBs = function (el) {

        var that = this;
        var $el  = $(el);
        var $mc  = this.getModalContainer($el);

        if (typeof $mc === typeof undefined) {
            return false;
        }

        this._getModalContent($el).done(function (data) {
            $mc.find('.modal-content').first().find('.modal-title').first().html(that._getModalTitle($el));
            $mc.find('.modal-content').first().find('.modal-body').first().html(data);
        });
    };

    this.onHideBs = function (el) {

    };
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Initialisation of modals
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {

    // Initialise the modal controller
    var ModalLoaderInstance = new ModalLoader();

    // Push the template into the modal before showing it
    $(document).on('show.bs.modal', '.modal', function (e) {
        ModalLoaderInstance.onShowBs(e.relatedTarget);
    });

    $(document).on('hide.bs.modal', '.modal', function (e) {
        ModalLoaderInstance.onHideBs(e.relatedTarget);
    });
});