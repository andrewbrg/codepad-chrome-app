//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Global runtime
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    /// Globals and initializations
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var Editors     = new EditorsHandler();
    var Modals      = new ModalsHandler();
    var IdeSettings = new IdeSettingsHandler();

    Editors.init(IdeSettings);
    IdeSettings.init(Editors);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Editors
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Edit tab name
    $(document).on('click', '.action-edit-tab', function () {
        Editors.onEditTabName($(this).attr('data-idx'));
    });

    // Maintain correct record of the current and previous idx
    $(document).on('shown.bs.tab', '*[data-toggle="tab"]', function (e) {
        Editors.previousIdx = parseInt($(e.relatedTarget).attr('data-idx'));
        Editors.currentIdx  = parseInt($(e.target).attr('data-idx'));
    });

    // Handle resize of window
    var $header               = $('header');
    var $sidebar              = $('#sidebar');
    var $tabsContentContainer = Editors.getTabsContentContainer();
    var statusBarHeight       = $tabsContentContainer.find('.ace-status-bar').first().height();

    $(window).on('resize', function () {

        var top    = Math.ceil($header.height()).toString();
        var bottom = Math.ceil(statusBarHeight).toString();

        $tabsContentContainer.css({
            'padding-top': top + 'px',
            'padding-bottom': bottom + 'px'
        });

        $sidebar.css({
            'margin-top': top + 'px',
            'height': ($(window).height() - (parseInt(top) + parseInt(bottom))).toString() + 'px'
        });
    }).resize();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Modals
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Push the template into the modal before showing it
    $(document).on('show.bs.modal', '.modal', function (e) {
        Modals.onShowBs(e.relatedTarget, function () {
            IdeSettings.decorateView();
        });
    });

    // Remove the template from the modal after closing it
    $(document).on('hide.bs.modal', '.modal', function (e) {
        Modals.onHideBs(e.currentTarget);
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.focus();
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Settings
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('input change', '[data-action="ide-setting"]', function () {
        IdeSettings.persistAndApply(IdeSettings.getKeyValFromEl($(this)));
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// File Actions
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // New tab
    $(document).on('click', '.action-add-tab', function () {
        Editors.onAddNewTab($(this).attr('data-type'));
    });

    // Save tab
    $(document).on('click', '.action-save-tab', function () {
        Editors.onSaveFile($(this).attr('data-idx'));
    });

    // Close tab
    $(document).on('click', '.action-close-tab', function () {
        Editors.onCloseTab($(this).attr('data-idx'));
    });

    // Open file
    $(document).on('click', '.action-file-open', function () {
        Editors.onOpenFile();
    });

    // Close application
    $(document).on('click', '.action-exit', function () {
        chrome.app.window.current().close();
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Edit Actions
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Perform search on current active editor
    $(document).on('click', '.action-search', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('find');
        }
    });

    // Perform undo on current active editor
    $(document).on('click', '.action-undo', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.undo();
        }
    });

    // Perform redo on current active editor
    $(document).on('click', '.action-redo', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.redo();
        }
    });

    // Perform cut on current active editor
    $(document).on('click', '.action-cut', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('cut');
        }
    });

    // Perform copy on current active editor
    $(document).on('click', '.action-copy', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('copy');
        }
    });

    // Perform paste to current active editor
    $(document).on('click', '.action-paste', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined && Editors.aceClipboard.length > 0) {
            aceEditor.execCommand('paste', Editors.aceClipboard);
        }
    });

    // Perform select all
    $(document).on('click', '.action-select-all', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('selectall');
        }
    });

    // Perform fold all current active editor
    $(document).on('click', '.action-fold-all', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.focus();
            aceEditor.getSession().foldAll();
        }
    });

    // Perform unfold all current active editor
    $(document).on('click', '.action-unfold-all', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.focus();
            aceEditor.getSession().unfold();
        }
    });


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// View Actions
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Perform minimize
    $(document).on('click', '.action-minimize', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('__minimize');
        }
    });

    // Perform maximize
    $(document).on('click', '.action-maximize', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('__maximize');
        }
    });

    // Perform fullscreen
    $(document).on('click', '.action-fullscreen', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('__fullscreen');
        }
    });

    // Perform font increase
    $(document).on('click', '.action-font-increase', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('__fontIncrease');
        }
    });

    // Perform font decrease
    $(document).on('click', '.action-font-decrease', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('__fontDecrease');
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Status Bar Actions
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Toggle read only mode on current active tab
    $(document).on('click', '.action-toggle-readonly', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            Editors.onToggleReadOnly(Editors.currentIdx);
        }
    });

    // Toggle read only mode on all tabs
    $(document).on('click', '.action-toggle-readonly-all', function () {
        var aceEditor = Editors.getCurrentAceEditor();
        if (typeof aceEditor !== typeof undefined) {
            Editors.onToggleReadOnly();
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Sidebar actions
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $sidebar.resizable({
        ghost: true,
        helper: "ui-resizable-helper"
    });

    // Sidebar open
    $(document).on('click', '.action-sidebar-open', function () {

    });

});