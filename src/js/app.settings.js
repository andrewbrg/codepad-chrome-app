//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Initialisation application settings
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
    $(document).on('change', 'input[data-option], select[data-option]', function () {
        if (typeof window.EditorTabInstance === typeof undefined ||
            typeof window.EditorTabInstance.aceEditors === typeof undefined) {
            return false;
        }

        var $that = $(this);
        window.EditorTabInstance.aceEditors.forEach(function (editor) {

            if (typeof editor === typeof undefined) {
                return false;
            }

            var val = $that.attr('type') === 'checkbox'
                ? $that.prop('checked')
                : $that.val();

            editor.ace.setOption($that.attr('data-option').toString(), val);
            editor.ace.$blockScrolling = 'Infinity';
        });
    });
});