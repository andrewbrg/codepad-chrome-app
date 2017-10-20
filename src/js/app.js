(function () {

    var runtime = function (appWindow, isRestart) {
        appWindow.contentWindow.__MGA__bRestart = isRestart;
    };

    chrome.app.runtime.onLaunched.addListener(function () {
        chrome.app.window.create('src/html/app.html',
            {
                innerBounds: {width: 1024, height: 768},
                resizable: true,
                focused: true,
                id: "codepad-main"
            },
            function (appWindow) {
                runtime(appWindow, true);
            }
        );
    });

    chrome.app.runtime.onRestarted.addListener(function () {
        chrome.app.window.create('src/html/app.html',
            {
                innerBounds: {width: 1024, height: 768},
                resizable: true,
                focused: true,
                id: "codepad-main"
            },
            function (appWindow) {
                runtime(appWindow, false);
            }
        );
    });
})();

$(document).ready(function () {

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Globals
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var Editors = new EditorsHandler();
    var Modals  = new ModalsHandler();
    var Fonts   = new FontsHandler();

    Editors.init();
    Fonts.load(['Roboto Mono', 'Open Sans']);

    var $header                  = $('header');
    var $editorsContentContainer = Editors.getTabsContentContainer();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Editors
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Edit tab name
    $(document).on('click', '.tab-list .edit', function () {
        Editors.onEditTabName($(this).attr('data-idx'));
    });
    $(document).on('dblclick', '.tab-list .filename', function () {
        Editors.onEditTabName($(this).attr('data-idx'));
    });

    // Close tab
    $(document).on('click', '.tab-list .close', function () {
        Editors.onCloseTab($(this).attr('data-idx'));
    });

    // Handle resize of window (keep editor under navigation)
    $(window).on('resize', function () {
        $editorsContentContainer.css('top', Math.ceil($header.height()) + 'px');
    }).resize();

    // Maintain correct record of the current and previous idx
    $(document).on('shown.bs.tab', '*[data-toggle="tab"]', function (e) {
        Editors.previousIdx = parseInt($(e.relatedTarget).attr('data-idx'));
        Editors.currentIdx  = parseInt($(e.target).attr('data-idx'));
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Modals
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Push the template into the modal before showing it
    $(document).on('show.bs.modal', '.modal', function (e) {
        Modals.onShowBs(e.relatedTarget, function () {
            $(document).find('[data-toggle="ide-setting"]').each(function (i, v) {

                var $v = $(v);
                if (typeof $v.attr('data-option') === undefined) {
                    return false;
                }

                var val = Editors.settingHandler.get($v.attr('data-option'));

                if (typeof $this.attr('type') !== undefined && $this.attr('type') === 'checkbox') {
                    $v.prop('checked', val);
                }
                else {
                    $v.val(val);
                }

            });
        });
    });

    // Remove the template from the modal after closing it
    $(document).on('hide.bs.modal', '.modal', function (e) {
        Modals.onHideBs(e.currentTarget);
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Settings
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('change', '[data-toggle="ide-setting"]', function () {

        var $this = $(this);

        var key = $this.attr('data-option');
        var val = typeof $this.attr('type') !== undefined && $this.attr('type') === 'checkbox'
            ? $this.prop('checked')
            : $this.val();

        Editors.applySetting(key, val);
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Actions
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Add new tab (editor)
    $(document).on('click', '.action-add-tab', function () {
        Editors.onAddNewTab($(this).attr('data-type'));
    });

    // Perform copy on current active editor
    $(document).on('click', '.action-copy', function () {
        var ace = Editors.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.execCommand('copy');
        }
    });

    // Perform paste to current active editor
    $(document).on('click', '.action-paste', function () {
        var ace = Editors.getCurrentAceEditor();
        if (typeof ace !== typeof undefined && Editors.aceClipboard.length > 0) {
            ace.execCommand('paste', Editors.aceClipboard);
        }
    });

    // Perform cut on current active editor
    $(document).on('click', '.action-cut', function () {
        var ace = Editors.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.execCommand('cut');
        }
    });

    // Perform search on current active editor
    $(document).on('click', '.action-search', function () {
        var ace = Editors.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.execCommand('find');
        }
    });

    // Perform undo on current active editor
    $(document).on('click', '.action-undo', function () {
        var ace = Editors.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.undo();
        }
    });

    // Perform redo on current active editor
    $(document).on('click', '.action-redo', function () {
        var ace = Editors.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.redo();
        }
    });

    // Perform fold all current active editor
    $(document).on('click', '.action-fold-all', function () {
        var ace = Editors.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.execCommand('foldAll');
        }
    });

    // Perform unfold all current active editor
    $(document).on('click', '.action-unfold-all', function () {
        var ace = Editors.getCurrentAceEditor();
        if (typeof ace !== typeof undefined) {
            ace.execCommand('unFoldAll');
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

});
