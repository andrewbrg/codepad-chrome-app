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
        window.EditorTabInstance.aceEditors.forEach(function (aceEditor) {

            if (typeof aceEditor !== typeof undefined) {

                aceEditor      = aceEditor.ace;
                var aceSession = aceEditor.getSession();

                switch ($that.attr('name')) {
                    case 'chk-highlightLine':
                        aceSession.setHighlightActiveLine($that.prop('checked'));
                        break;
                    case 'chk-hideGutter':
                        aceSession.setShowGutter(!$that.prop('checked'));
                        break;
                    case 'chk-showWhitespace':
                        aceSession.setDisplayIndentGuides($that.prop('checked'));
                        break;
                    case 'chk-indentation':
                        aceSession.setShowPrintMargin($that.prop('checked'));
                        break;
                    case 'chk-useTabs':
                        aceSession.setShowPrintMargin($that.prop('checked'));
                        break;
                    case 'chk-wordWrap':
                        aceSession.setShowPrintMargin($that.prop('checked'));
                        break;
                    case 'chk-wrapLimit':
                        aceSession.setShowPrintMargin($that.prop('checked'));
                        break;
                    case 'chk-showMargin':
                        aceSession.setShowPrintMargin($that.prop('checked'));
                        break;
                    case 'chk-lineEndings':
                        aceSession.setShowPrintMargin($that.prop('checked'));
                        break;
                    case 'chk-scrollPastEnd':
                        aceSession.setDisplayIndentGuides($that.prop('checked'));
                        break;
                    case 'chk-trimTrailingWhitespace':
                        aceSession.setShowPrintMargin($that.prop('checked'));
                        break;
                    case 'chk-trimEmptyLines':
                        aceSession.trimTrailingSpace($that.prop('checked'));
                        break;
                }
            }
        });
    });
});