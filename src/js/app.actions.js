//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Initialisation actions performed by application
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {

    // Add new tab (editor)
    $(document).on('click', '.action-add-tab', function () {
        window.EditorTabInstance.onAddNewTab($(this).attr('data-type'));
    });

    // Perform copy on current active editor
    $(document).on('click', '.action-copy', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.execCommand('copy');
        }
    });

    // Perform paste to current active editor
    $(document).on('click', '.action-paste', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined && window.EditorTabInstance.aceClipboard.length > 0) {
            ace.execCommand('paste', window.EditorTabInstance.aceClipboard);
        }
    });

    // Perform cut on current active editor
    $(document).on('click', '.action-cut', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.execCommand('cut');
        }
    });

    // Perform search on current active editor
    $(document).on('click', '.action-search', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.execCommand('find');
        }
    });

    // Perform undo on current active editor
    $(document).on('click', '.action-undo', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.undo();
        }
    });

    // Perform redo on current active editor
    $(document).on('click', '.action-redo', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.redo();
        }
    });

    // Perform fold all current active editor
    $(document).on('click', '.action-fold-all', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.execCommand('foldAll');
        }
    });

    // Perform unfold all current active editor
    $(document).on('click', '.action-unfold-all', function () {
        var ace = window.EditorTabInstance.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.execCommand('unFoldAll');
        }
    });
});