//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Initialisation application settings
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
    $(document).on('change', 'input[type="checkbox"]', function () {
        if (
            typeof window.EditorTabInstance === typeof undefined ||
            typeof window.EditorTabInstance.aceEditors === typeof undefined
        ) {
            return false;
        }

        var $that = $(this);
        window.EditorTabInstance.aceEditors.forEach(function (el) {
            switch ($that.attr('name')) {
                case 'chk-word-wrap':
                    el.getSession().setUseWrapMode($that.prop('checked'));
                    break;
                case 'chk-active-line':
                    el.getSession().setHighlightActiveLine($that.prop('checked'));
                    break;
                case 'chk-print-margin':
                    el.getSession().setShowPrintMargin($that.prop('checked'));
                    break;
            }
        });
    });
});