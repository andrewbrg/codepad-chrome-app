var ModalLoader = function () {

    /************************************************************************************************************
     * Public Methods
     ************************************************************************************************************/
    this.getModalContainer = function (el) {
        var dt = $(el).attr('data-target');
        return (typeof dt === typeof undefined)
            ? undefined
            : $(document).find('.' + this._cleanDataTarget(dt)).first();
    };


    /************************************************************************************************************
     * Private Methods
     ************************************************************************************************************/
    this._cleanDataTarget = function (dt) {
        return dt.replace(/[^a-zA-Z0-9\-]/g, '');
    };

    this._getModalContent = function (el) {
        var $el      = $(el);
        var deferred = $.Deferred();

        if ($el.hasClass('editor-theme')) {
            $.get('/src/html/modals/editor/theme.html').done(function (data) {
                deferred.resolve(data);
            });
        }

        return deferred.promise();
    };


    /************************************************************************************************************
     * Event Callbacks
     ************************************************************************************************************/
    this.onShowBs = function (el) {
        var $el = $(el);
        var $mc = this.getModalContainer($el);

        console.log($mc);
        if (typeof $mc === typeof undefined) {
            return false;
        }

        this._getModalContent($el).done(function (data) {
                console.log(data);
                $mc.find('.modal-content').first().html(data);
            }
        );
    };
};

$(document).ready(function () {
    var ModalLoaderInstance = new ModalLoader();
    $(document).on('show.bs.modal', '.modal', function (e) {
        console.log('sadasdasd');
        ModalLoaderInstance.onShowBs(e.relatedTarget);
    });
});