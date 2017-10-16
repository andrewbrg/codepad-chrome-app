//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Initialisation application settings
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {
    $(document).on('change', 'input[type="checkbox"]', function () {
        if (typeof window.EditorTabInstance === typeof undefined ||
            typeof window.EditorTabInstance.aceEditors === typeof undefined) {
            return false;
        }

        var $that    = $(this);
        var value    = $that.val();
        var attrName = $that.attr('name');
        var checked  = $that.prop('checked');

        window.EditorTabInstance.aceEditors.forEach(function (editor) {

            if (typeof editor === typeof undefined) {
                return;
            }

            var ace = editor.ace;
            switch (attrName) {

                case 'chk-highlightActiveLine':
                    ace.setHighlightActiveLine(checked);
                    break;

                case 'chk-showGutter':
                    ace.renderer.setShowGutter(checked);
                    break;

                case 'chk-showInvisibles':
                    ace.renderer.setShowInvisibles(checked);
                    break;

                case 'chk-displayIndentGuides':
                    ace.renderer.setDisplayIndentGuides(checked);
                    break;


                case 'chk-indentation':
                    ace.setShowPrintMargin(value);
                    break;
                case 'chk-useTabs':
                    ace.setShowPrintMargin(checked);
                    break;
                case 'chk-wordWrap':
                    ace.setShowPrintMargin(checked);
                    break;
                case 'chk-wrapLimit':
                    ace.setShowPrintMargin(checked);
                    break;
                case 'chk-showMargin':
                    ace.setShowPrintMargin(checked);
                    break;
                case 'chk-lineEndings':
                    ace.setShowPrintMargin(checked);
                    break;
                case 'chk-scrollPastEnd':
                    ace.setDisplayIndentGuides(checked);
                    break;
                case 'chk-trimTrailingWhitespace':
                    ace.setShowPrintMargin(checked);
                    break;
                case 'chk-trimEmptyLines':
                    ace.trimTrailingSpace(checked);
                    break;
            }
        });
    });
});