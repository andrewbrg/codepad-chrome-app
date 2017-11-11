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
                runtime(appWindow, false);
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
                runtime(appWindow, true);
            }
        );
    });
})();


if (typeof $ !== typeof undefined) {


    $(document).ready(function () {

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// Globals and initializations
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        var Editors       = new EditorsHandler();
        var Modals        = new ModalsHandler();
        var IdeSettings   = new IdeSettingsHandler();
        var Sidebar       = new SidebarHandler();
        var Notifications = new NotificationsHandler();
        var Files         = new FilesHandler();

        Files.init(Notifications);
        Editors.init(IdeSettings, Notifications, Files);
        Sidebar.init(Notifications, Editors, Files);
        IdeSettings.init(Editors);

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// Editors
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Rename tab
        $(document).on('dblclick', '.action-edit-tab', function () {
            Editors.onEditTabName($(this).attr('data-idx'));
        });

        // Maintain correct record of the current and previous idx
        $(document).on('shown.bs.tab', '*[data-toggle="tab"]', function (e) {
            Editors.previousIdx = parseInt($(e.relatedTarget).attr('data-idx'));
            Editors.currentIdx  = parseInt($(e.target).attr('data-idx'));
        });

        // Handle resize of window
        var $header               = $('header');
        var $aside                = $('aside');
        var $sidebar              = Sidebar.getSidebar();
        var $sidebarMenu          = $sidebar.find('.sidebar-menu');
        var $tabsContentContainer = Editors.getTabsContentContainer();
        var statusBarHeight       = $tabsContentContainer.find('.ace-status-bar').first().height();

        $(window).on('resize', function () {

            var sBarHeight        = Math.ceil(statusBarHeight).toString();
            var headerHeight      = Math.ceil($header.height()).toString();
            var sidebarMenuHeight = Math.ceil($sidebarMenu.height()).toString();
            var asideHeight       = $(window).height() - (parseInt(headerHeight) + parseInt(sBarHeight));

            $tabsContentContainer.css({
                'padding-top': headerHeight + 'px',
                'padding-bottom': sBarHeight + 'px'
            });

            $aside.css({
                'margin-top': headerHeight + 'px',
                'height': asideHeight.toString() + 'px'
            });

            $sidebar.css({
                'margin-top': sidebarMenuHeight + 'px',
                'height': (asideHeight - parseInt(sidebarMenuHeight)).toString() + 'px'
            });
        }).resize();

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// Modals
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Push the template into the modal before showing it
        $(document).on('show.bs.modal', '.modal', function (e) {

            var $el      = $(e.relatedTarget);
            var callback = function () {
            };

            if ($el.hasClass('modal-ide-settings') || $el.hasClass('modal-ide-appearance')) {
                callback = function () {
                    IdeSettings.decorateView();
                };
            }

            if ($el.hasClass('modal-content-help')) {
                callback = function () {
                    $(document).find('.app-name').html(chrome.runtime.getManifest().name);
                    $(document).find('.app-author').html(chrome.runtime.getManifest().author);
                    $(document).find('.app-version').html(chrome.runtime.getManifest().version);
                };
            }

            Modals.onShowBs(e.relatedTarget, callback);
        });

        // Remove the template from the modal after closing it
        $(document).on('hide.bs.modal', '.modal', function (e) {
            Modals.onHideBs(e.currentTarget);
            var aceEditor = Editors.getCurrentEditor();
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

            var fileType = $(this).attr('data-type');
            if (typeof fileType !== typeof undefined && fileType !== false) {
                fileType = Editors.defaultFileExt;
            }

            Editors.onAddNewTab(fileType);
        });

        // Save file
        $(document).on('click', '.action-save', function () {

            var attr = $(this).attr('data-idx');
            var idx  = (typeof attr !== typeof undefined && attr !== false) ? attr : Editors.currentIdx;

            Editors.onSaveFile(idx);
        });

        // Save all files
        $(document).on('click', '.action-save-all', function () {
            Editors.onSaveAllFiles();
        });

        // Close tab
        $(document).on('click', '.action-close-tab', function () {
            Editors.onCloseTab($(this).attr('data-idx'));
        });

        // Open file
        $(document).on('click', '.action-file-open', function () {
            Editors.onOpenFile();
        });

        // Open project
        $(document).on('click', '.action-project-open', function () {
            Sidebar.onOpenProject();
        });

        // Close application
        $(document).on('click', '.action-exit', function () {
            chrome.app.window.current().close();
        });

        // Rename file
        $(document).on('_file.rename', function (e) {

            console.info('Event', '_file.rename');
            Files.fileRename(Editors.getEditorFileEntry(e.idx), e.oldFileName, e.newFileName).then(function (fileEntry) {
                if (typeof fileEntry !== typeof undefined) {
                    Editors.onRenameFile(e.idx, fileEntry);
                    Sidebar.onRenameFile(e.nodeId, fileEntry);
                }
            }).fail(function () {
                $.event.trigger({
                    type: '_file.changename',
                    time: new Date(),
                    idx: e.idx,
                    nodeId: e.nodeId,
                    tabName: e.oldFileName
                });
            });
        });

        // Change tab name
        $(document).on('_file.changename', function (e) {
            console.info('Event', '_file.changename');
            Editors.onChangeNameFile(e.idx, e.tabName);
            Sidebar.onChangeNameFile(e.idx, e.nodeId, e.tabName);
        });


        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// Edit Actions
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Perform search on current active editor
        $(document).on('click', '.action-search', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.execCommand('find');
            }
        });

        // Perform undo on current active editor
        $(document).on('click', '.action-undo', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.undo();
            }
        });

        // Perform redo on current active editor
        $(document).on('click', '.action-redo', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.redo();
            }
        });

        // Perform cut on current active editor
        $(document).on('click', '.action-cut', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.execCommand('cut');
            }
        });

        // Perform copy on current active editor
        $(document).on('click', '.action-copy', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.execCommand('copy');
            }
        });

        // Perform paste to current active editor
        $(document).on('click', '.action-paste', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined && Editors.aceClipboard.length > 0) {
                aceEditor.execCommand('paste', Editors.aceClipboard);
            }
        });

        // Perform select all
        $(document).on('click', '.action-select-all', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.execCommand('selectall');
            }
        });

        // Perform fold all current active editor
        $(document).on('click', '.action-fold-all', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.focus();
                aceEditor.getSession().foldAll();
            }
        });

        // Perform unfold all current active editor
        $(document).on('click', '.action-unfold-all', function () {
            var aceEditor = Editors.getCurrentEditor();
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
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.execCommand('__minimize');
            }
        });

        // Perform maximize
        $(document).on('click', '.action-maximize', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.execCommand('__maximize');
            }
        });

        // Perform fullscreen
        $(document).on('click', '.action-fullscreen', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.execCommand('__fullscreen');
            }
        });

        // Perform font increase
        $(document).on('click', '.action-font-increase', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.execCommand('__fontIncrease');
            }
        });

        // Perform font decrease
        $(document).on('click', '.action-font-decrease', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                aceEditor.execCommand('__fontDecrease');
            }
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// Status Bar
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Toggle read only mode on current active tab
        $(document).on('click', '.action-toggle-readonly', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                Editors.onToggleReadOnly(Editors.currentIdx);
            }
        });

        // Toggle read only mode on all tabs
        $(document).on('click', '.action-toggle-readonly-all', function () {
            var aceEditor = Editors.getCurrentEditor();
            if (typeof aceEditor !== typeof undefined) {
                Editors.onToggleReadOnly();
            }
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// Sidebar
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Enable resizable sidebar
        $aside.resizable({
            ghost: true,
            minWidth: $aside.css('min-width'),
            stop: function () {
                $(window).trigger('resize');
            }
        });

        // Sidebar toggle
        $aside.on('shown.bs.collapse', function () {
            var $el = $(document).find('[data-toggle="collapse"][data-target="aside"]');
            $el.removeClass('btn-outline-secondary').addClass('btn-outline-primary');
            $(window).trigger('resize');
        });
        $aside.on('hide.bs.collapse', function () {
            var $el = $(document).find('[data-toggle="collapse"][data-target="aside"]');
            $el.removeClass('btn-outline-primary').addClass('btn-outline-secondary');
            $(window).trigger('resize');
        });


        // Sidebar show
        $(document).on('click', '.action-sidebar-show', function () {
            Sidebar.showSidebar();
        });

        // Sidebar hide
        $(document).on('click', '.action-sidebar-hide', function () {
            Sidebar.hideSidebar();
        });

        // Sidebar nodes expand
        $(document).on('click', '.action-sidebar-expand', function () {
            Sidebar.expandNodes();
        });

        // Sidebar nodes compress
        $(document).on('click', '.action-sidebar-compress', function () {
            Sidebar.compressNodes();
        });

        // Sidebar nodes clicked
        $(document).on('click', '.node-sidebar', function () {
            Sidebar.onNodeClick($(this).attr('data-nodeid'));
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    });
}