$(document).ready(function () {

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Globals and initializations
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let Editors = new EditorsHandler();
    let Modals = new ModalsHandler();
    let IdeSettings = new IdeSettingsHandler();
    let Sidebar = new SidebarHandler();
    let Notifications = new NotificationsHandler();
    let Files = new FilesHandler();

    Notifications.init();
    Files.init(Notifications);
    Editors.init(IdeSettings, Notifications, Files);
    Sidebar.init(Notifications, Editors, Files);
    IdeSettings.init(Editors).then(Editors.startup());


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
        Editors.currentIdx = parseInt($(e.target).attr('data-idx'));
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Modals
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Push the template into the modal before showing it
    $(document).on('show.bs.modal', '.modal', function (e) {

        let $relTgt = $(e.relatedTarget);
        let callback = function () {
        };

        if ($relTgt.hasClass('modal-ide-settings') || $relTgt.hasClass('modal-ide-appearance')) {
            callback = function () {
                IdeSettings.decorateView();
            };
        }

        if ($relTgt.hasClass('modal-content-help')) {
            callback = function () {
                $(document).find('.app-name').html(chrome.runtime.getManifest().name);
                $(document).find('.app-author').html(chrome.runtime.getManifest().author);
                $(document).find('.app-version').html(chrome.runtime.getManifest().version);
            };
        }

        if ($relTgt.hasClass('modal-rename-file')) {
            callback = function () {
                $(document).find('input[name="file-data-idx"]').val($relTgt.attr('data-idx'));
                $(document).find('input[name="file-data-nodeid"]').val($relTgt.attr('data-nodeid'));
                $(document).find('input[name="file-old-filename"]').val($relTgt.attr('data-old-filename'));
                $(document).find('input[name="file-new-filename"]').val($relTgt.attr('data-old-filename'));
            };
        }

        Modals.onShowBs(e.relatedTarget, callback);
    });

    // Remove the template from the modal after closing it
    $(document).on('hide.bs.modal', '.modal', function (e) {
        Modals.onHideBs(e.currentTarget);
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.focus();
        }
    });

    $(document).on('click', '.disable-rate', function (e) {
        let obj = {};
        obj[Notifications.disableRateKey] = true;
        chrome.storage.local.set(obj);
        $(e.currentTarget).closest('.modal').find('[data-dismiss="modal"]').trigger('click');
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Settings
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('input change', '[data-action="ide-setting"]', function () {
        let $this = $(this);
        let $next = $(this).next();

        IdeSettings.persistAndApply(IdeSettings.getKeyValFromEl($this));

        if ($this.hasClass('range-slider-range')) {
            $next.text($this.val());

            let title = $next.attr('title').split(', ');
            title[1] = 'Current: ' + $this.val();
            $next.attr('title', title.join(', '));
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// File Actions
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // New tab
    $(document).on('click', '.action-add-tab', function () {

        let fileType = $(this).attr('data-type');
        if (typeof fileType === typeof undefined || !fileType) {
            fileType = Editors.defaultFileExt;
        }

        Editors.onAddNewTab(fileType);
    });

    // Save file
    $(document).on('click', '.action-save', function () {

        let attr = $(this).attr('data-idx');
        let idx = (typeof attr !== typeof undefined && attr !== false) ? attr : Editors.currentIdx;

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

    // Drop file
    $(document).on('drop', 'body', function (e) {
        Editors.onDropFiles(e);
    });

    // Rename file
    $(document).on('click', '.action-rename-file', function () {
        $.event.trigger({
            type: "_file.rename",
            time: new Date(),
            idx: $(document).find('input[name="file-data-idx"]').first().val(),
            nodeId: $(document).find('input[name="file-data-nodeid"]').first().val(),
            oldFileName: $(document).find('input[name="file-old-filename"]').first().val(),
            newFileName: $(document).find('input[name="file-new-filename"]').first().val()
        });
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
        let callback = function (fileEntry) {
            Files.fileRename(fileEntry, e.oldFileName, e.newFileName).then(function (fileEntry) {
                if (typeof fileEntry !== typeof undefined) {
                    Editors.onRenameFile(e.idx, fileEntry);
                    Sidebar.onRenameFile(e.nodeId, fileEntry);
                } else {
                    Editors.onChangeNameFile(e.idx, e.newFileName);
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
        };

        let fileEntry = Editors.getEditorDataObj(e.idx);
        if (typeof fileEntry === typeof undefined && typeof e.nodeId !== typeof undefined) {
            Sidebar.onNodeClick(e.nodeId).then(function (idx, fileEntry) {
                e.idx = idx;
                callback(fileEntry);
            });
        } else {
            callback(fileEntry);
        }
    });

    // Change tab name
    $(document).on('_file.changename', function (e) {
        Editors.onChangeNameFile(e.idx, e.tabName);
        Sidebar.onChangeNameFile(e.idx, e.nodeId, e.tabName);
    });

    // User opens file from outside app
    chrome.app.runtime.onLaunched.addListener(function (launchData) {
        Editors.handleLaunchData(launchData.items);
    });


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Edit Actions
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Perform search on current active editor
    $(document).on('click', '.action-search', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('find');
        }
    });

    // Perform undo on current active editor
    $(document).on('click', '.action-undo', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.undo();
        }
    });

    // Perform redo on current active editor
    $(document).on('click', '.action-redo', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.redo();
        }
    });

    // Perform cut on current active editor
    $(document).on('click', '.action-cut', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('cut');
        }
    });

    // Perform copy on current active editor
    $(document).on('click', '.action-copy', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('copy');
        }
    });

    // Perform paste to current active editor
    $(document).on('click', '.action-paste', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined && Editors.aceClipboard.length > 0) {
            aceEditor.execCommand('paste', Editors.aceClipboard);
        }
    });

    // Perform select all
    $(document).on('click', '.action-select-all', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('selectall');
        }
    });

    // Perform fold all current active editor
    $(document).on('click', '.action-fold-all', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.focus();
            aceEditor.getSession().foldAll();
        }
    });

    // Perform unfold all current active editor
    $(document).on('click', '.action-unfold-all', function () {
        let aceEditor = Editors.getCurrentEditor();
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
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('__minimize');
        }
    });

    // Perform maximize
    $(document).on('click', '.action-maximize', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('__maximize');
        }
    });

    // Perform fullscreen
    $(document).on('click', '.action-fullscreen', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('__fullscreen');
        }
    });

    // Perform font increase
    $(document).on('click', '.action-font-increase', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            aceEditor.execCommand('__fontIncrease');
        }
    });

    // Perform font decrease
    $(document).on('click', '.action-font-decrease', function () {
        let aceEditor = Editors.getCurrentEditor();
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
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            Editors.onToggleReadOnly(Editors.currentIdx);
        }
    });

    // Toggle read only mode on all tabs
    $(document).on('click', '.action-toggle-readonly-all', function () {
        let aceEditor = Editors.getCurrentEditor();
        if (typeof aceEditor !== typeof undefined) {
            Editors.onToggleReadOnly();
        }
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Sidebar
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    let $aside = $('aside');

    // Enable resizable sidebar
    $aside.resizable({
        ghost: true,
        minWidth: $aside.css('min-width'),
        handles: 'e, w',
        stop: function () {
            $(window).trigger('resize');
        }
    });

    // Sidebar toggle
    $aside.on('shown.bs.collapse', function () {
        $(window).trigger('resize');
    });
    $aside.on('hide.bs.collapse', function () {
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