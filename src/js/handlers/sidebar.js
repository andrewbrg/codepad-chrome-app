var SidebarHandler = function () {

    this.Notifications = undefined;
    this.Editors       = undefined;

    this.dirEntry     = null;
    this.treeViewInit = false;

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private Sidebar
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this._decorateSidebar = function (dirTreeJson, title) {

        if (dirTreeJson.length === 0) {
            return false;
        }

        var $sidebar = this.getSidebar();

        if (this.treeViewInit) {
            $sidebar.treeview('remove');
        }

        $sidebar.treeview({data: dirTreeJson, silent: false});
        this.treeViewInit = true;
        this._setSidebarTopMenu(title);
        this.compressNodes();
        this.show();
    };

    this._setSidebarTopMenu = function (title) {

        this.getAside().find('.sidebar-menu-title').html(title);
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Sidebar
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.init = function (notifications, editors) {

        this.Notifications = notifications;
        this.Editors       = editors;

        var that     = this;
        var $sidebar = this.getSidebar();


        $(document).on('click', '.node-sidebar', function () {

            var $this = $(this);

            var node = $sidebar.treeview('getNode', $this.attr('data-nodeid'));
            if (node.typeFile === 1) {
                that.dirEntry.getFile(node.path, {}, function (fileEntry) {
                    that.Editors._fileOpen(fileEntry);
                });
            }
        });
    };

    this.getSidebar = function () {
        return $(document).find('.sidebar').first();
    };

    this.getAside = function () {
        return $(document).find('aside').first();
    };

    this.show = function () {
        this.getAside().collapse('show');
    };

    this.hide = function () {
        this.getAside().collapse('hide');
    };

    this.expandNodes = function () {

        var $sidebar = this.getSidebar();

        if (this.treeViewInit) {
            $sidebar.treeview('expandAll');
        }
    };

    this.compressNodes = function () {

        var $sidebar = this.getSidebar();

        if (this.treeViewInit) {
            $sidebar.treeview('collapseAll');
        }
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Event Handlers
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////
    // File System Related
    ///////////////////////////////////
    this.onOpenProject = function () {

        var that  = this;
        var modes = [];

        chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function (dirEntry) {

            if (chrome.runtime.lastError) {
                that.Notifications.notify('danger', '', chrome.runtime.lastError.message);
                return false;
            }

            that.dirEntry = dirEntry;

            var sortFn = function (a, b) {
                if (a.typeFile !== b.typeFile) {
                    return a.typeFile > b.typeFile;
                }
                return a.text > b.text;
            };

            var buildDirTree = function (entry, callback) {

                var results = [];
                entry.createReader().readEntries(function (entries) {

                    var pending = entries.length;

                    if (!pending) {

                        var obj = {
                            text: entry.name,
                            path: entry.fullPath,
                            typeFile: 0,
                            icon: 'fa fa-fw fa-folder',
                            selectable: false
                        };

                        if (results.length > 0) {
                            results   = results.sort(sortFn);
                            obj.nodes = results;
                        }

                        callback(obj);
                    }

                    entries.forEach(function (item) {
                        if (item.isDirectory) {

                            buildDirTree(item, function (res) {
                                var obj = {
                                    text: item.name,
                                    path: item.fullPath,
                                    typeFile: 0,
                                    icon: 'fa fa-fw fa-folder',
                                    selectable: false
                                };

                                if (res.length > 0) {
                                    res       = res.sort(sortFn);
                                    obj.nodes = res;
                                }

                                results.push(obj);
                                results = results.sort(sortFn);

                                if (!--pending) {
                                    callback(results);
                                }
                            });
                        }
                        else {

                            var ext = that.Editors._fileExtFromFileEntry(item);

                            results.push({
                                text: item.name,
                                path: item.fullPath,
                                typeFile: 1,
                                icon: (modes.hasOwnProperty(ext)) ? modes[ext].icon : 'fa fa-fw fa-file fa-sidebar',
                                selectable: false
                            });

                            results = results.sort(sortFn);

                            if (!--pending) {
                                callback(results);
                            }
                        }
                    });
                });
            };

            that.Editors.getAllEditorModes().then(function (data) {
                modes = JSON.parse(data);
                buildDirTree(dirEntry, function (result) {
                    that._decorateSidebar(result, dirEntry.name);
                });
            });
        });
    };
};