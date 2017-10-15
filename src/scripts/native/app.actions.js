$(document).ready(function () {

    $(document).on('click', '.action-copy', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            window.EditorTabInstance.getCurrentAceEditor().execCommand('copy');
        }
    });

    $(document).on('click', '.action-paste', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            window.EditorTabInstance.getCurrentAceEditor().execCommand('paste');
        }
    });

    $(document).on('click', '.action-cut', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            window.EditorTabInstance.getCurrentAceEditor().execCommand('cut');
        }
    });
});