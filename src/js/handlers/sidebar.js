var SidebarHandler = function () {

    this.Notifications = null;

    this.dirTree = [];

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private Sidebar
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this._loadDirTree = function () {

        var that = this;

        if (this.dirTree.length > 0) {
            var $sidebar = this.getSidebar();

            if ($sidebar.hasOwnProperty('treeview')) {
                $sidebar.treeview('remove', function () {
                    $sidebar.treeview({data: that.dirTree});
                });
            }
            else {
                $sidebar.treeview({data: this.dirTree});
            }
        }
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Sidebar
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.init = function (notifications) {

        this.Notifications = notifications;

        this._loadDirTree();
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

        var that     = this;
        this.dirTree = [];

        chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function (entry) {

            if (chrome.runtime.lastError) {
                this._notify('danger', '', chrome.runtime.lastError.message);
                return false;
            }

            var buildDirTree = function (entry, callback) {

                var results = [];
                entry.createReader().readEntries(function (entries) {

                    var pending = entries.length;
                    if (!pending) {
                        return callback({
                            text: entry.name,
                            icon: "fa fa-fw fa-folder-o",
                            selectable: false,
                            nodes: results
                        });
                    }

                    entries.forEach(function (entry) {
                        if (entry.isDirectory) {
                            buildDirTree(entry, function (res) {
                                results.push({
                                    text: entry.name,
                                    icon: "fa fa-fw fa-folder-o",
                                    selectable: false,
                                    nodes: res
                                });
                                if (!--pending) {
                                    callback(results);
                                }
                            });
                        }
                        else {
                            results.push({
                                text: entry.name,
                                icon: "fa fa-fw fa-file-o",
                                selectable: true
                            });
                            if (!--pending) {
                                callback(results);
                            }
                        }
                    });
                });
            };

            buildDirTree(entry, function (result) {
                that.dirTree = result;
                that._loadDirTree();
            });
        });
    };
};