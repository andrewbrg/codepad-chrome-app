var SidebarHandler = function () {

    this.Notifications = null;

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private Sidebar
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this._loadDirTree = function (dirTreeJson) {

        if (dirTreeJson.length > 0) {
            var $sidebar = this.getSidebar();

            if ($sidebar.hasOwnProperty('treeview')) {
                $sidebar.treeview('remove', function () {
                    $sidebar.treeview({data: dirTreeJson});
                });
            }
            else {
                $sidebar.treeview({data: dirTreeJson});
            }

            $sidebar.collapse('show');
            $sidebar.on('shown.bs.collapse', function () {
                $(window).trigger('resize');
            });
        }
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Sidebar
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.init = function (notifications) {
        this.Notifications = notifications;

        this.getSidebar().resizable({
            ghost: true,
            helper: "ui-resizable-helper"
        });
    };

    this.getSidebar = function () {
        return $(document).find('#sidebar').first();
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Event Handlers
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////
    // File System Related
    ///////////////////////////////////
    this.onOpenDir = function () {

        var that = this;

        chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function (entry) {

            if (chrome.runtime.lastError) {
                that.Notifications.notify('danger', '', chrome.runtime.lastError.message);
                return false;
            }

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
                            icon: "fa fa-fw fa-folder-o",
                            selectable: false
                        };
                        if (results.length > 0) {
                            results   = results.sort(sortFn);
                            obj.nodes = results;
                        }
                        callback(obj);
                    }

                    entries.forEach(function (entry) {
                        if (entry.isDirectory) {
                            buildDirTree(entry, function (res) {
                                var obj = {
                                    text: entry.name,
                                    path: entry.fullPath,
                                    typeFile: 0,
                                    icon: "fa fa-fw fa-folder-o",
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
                            results.push({
                                text: entry.name,
                                path: entry.fullPath,
                                typeFile: 1,
                                icon: "fa fa-fw fa-file-text-o",
                                selectable: true
                            });
                            results = results.sort(sortFn);
                            if (!--pending) {
                                callback(results);
                            }
                        }
                    });
                });
            };

            buildDirTree(entry, function (result) {
                that._loadDirTree(result);
            });
        });
    };
};