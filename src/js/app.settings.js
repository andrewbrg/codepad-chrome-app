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

                case 'sel-selectionStyle':
                    ace.setOption('selectionStyle', value);
                    break;

                case 'sel-cursorStyle':
                    ace.setOption('cursorStyle', value);
                    break;

                case 'chk-highlightActiveLine':
                    ace.setOption('highlightActiveLine', checked);
                    break;

                case 'chk-showGutter':
                    ace.setOption('showGutter', checked);
                    break;

                case 'chk-showInvisibles':
                    ace.setOption('showInvisibles', checked);
                    break;

                case 'chk-displayIndentGuides':
                    ace.setOption('displayIndentGuides', checked);
                    break;

                case 'chk-tabSize':
                    ace.setOption('tabSize', value);
                    break;

                case 'chk-useSoftTabs':
                    ace.setOption('tabSize', checked);
                    break;

                case 'chk-wrapBehavioursEnabled':
                    ace.setOption('wrapBehavioursEnabled', checked);
                    break;

                case 'chk-wrap':
                    ace.setOption('wrap', value);
                    break;

                case 'chk-showShowPrintMargin':
                    ace.setOption('showPrintMargin', checked);
                    break;
                    
                case 'chk-lineEndings':
                    ace.setShowPrintMargin(checked);
                    break;
                case 'chk-scrollPastEnd':
                    ace.setOption('scrollPastEnd', checked);
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