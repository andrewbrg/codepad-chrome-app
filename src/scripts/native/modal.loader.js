$(document).ready(function () {




    $(document).on('show.bs.modal', '*[data-toggle="modal"]', function () {
        var dataTarget = $(this).attr('data-target');
        if (typeof dataTarget === typeof undefined) {
            return false;
        }

        dataTarget          = dataTarget.replace(/[^a-zA-Z0-9\-]/g, '');
        var $modalContainer = $(document).find('.' + dataTarget).first();
        if (typeof $modalContainer === typeof undefined) {
            return false;
        }

        var promise = undefined;
        if ($(this).hasClass('editor-theme')) {
            promise = $.get('/src/html/modals/editor/theme.html');
        }


        if(typeof promise === typeof undefined){

        }
    });
});