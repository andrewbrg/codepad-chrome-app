var SidebarHandler = function () {

    this.Notifications = null;

    this.directoryTree = null;

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Sidebar
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.init = function (notifications) {

        this.Notifications = notifications;

        this.getSidebar().resizable({
            ghost: true,
            helper: "ui-resizable-helper"
        });
        this.getSidebar().treeview({data: this.getDirectoryTree()});
    };

    this.getSidebar = function () {
        return $(document).find('#sidebar').first();
    };


    this.getDirectoryTree = function () {

        if (typeof this.directoryTree !== typeof undefined && this.directoryTree !== null) {
            return this.directoryTree;
        }

        this.directoryTree = [
            {
                text: "Parent 1",
                icon: "fa fa-fw fa-folder-o",
                selectedIcon: "fa fa-fw fa-folder-open-o",
                selectable: false,
                nodes: [
                    {
                        text: "Child 1",
                        nodes: [
                            {
                                text: "Grandchild 1"
                            },
                            {
                                text: "Grandchild 2"
                            }
                        ]
                    },
                    {
                        text: "Child 2"
                    }
                ]
            },
            {
                text: "Parent 2"
            },
            {
                text: "Parent 3"
            },
            {
                text: "Parent 4"
            },
            {
                text: "Parent 5"
            }
        ];

        return this.directoryTree;
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Event Handlers
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////
    // File System Related
    ///////////////////////////////////
    this.onOpenDir = function () {
        chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function (dirEntry) {

            if (chrome.runtime.lastError) {
                this._notify('danger', '', chrome.runtime.lastError.message);
                return false;
            }

            if (dirEntry !== false && dirEntry.isDirectory) {
                var dirReader = dirEntry.createReader();
                var entries   = [];

                var readEntries = function () {
                    dirReader.readEntries(function (results) {
                        if (results.length) {
                            results.forEach(function (item) {
                                console.log(item);
                                entries = entries.concat(item);
                            });
                            readEntries();
                        }
                    }, errorHandler);
                };

                readEntries();
            }
        });
    };
};