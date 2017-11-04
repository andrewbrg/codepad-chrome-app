var SidebarHandler = function () {

    this.Notifications = null;

    this.dirTree         = null;
    this.dirSeperator    = '/';
    this.dirTreeEntryTpl = {text: '', nodes: []};

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private Sidebar
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Sidebar
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.init = function (notifications) {

        this.Notifications = notifications;
        
        this.getSidebar().treeview({data: this.getDirectoryTree()});
        this.getSidebar().resizable({
            ghost: true,
            helper: "ui-resizable-helper"
        });
    };

    this.getSidebar = function () {
        return $(document).find('#sidebar').first();
    };


    this.getDirectoryTree = function () {

        if (typeof this.dirTree !== typeof undefined && this.dirTree !== null) {
            return this.dirTree;
        }

        this.dirTree = [
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

        return this.dirTree;
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

            var makeObj = function (name) {
                var obj = that.dirTreeEntryTpl;
                return obj.name = name;
            };

            var parsePath = function (path) {

                var toTraverse = that.dirTree;
                var pathParts  = path.split('/');

                pathParts.forEach(function (name) {

                    var found = false;
                    toTraverse.forEach(function (dirTreeEntry) {
                        if (dirTreeEntry.name === name) {
                            dirTreeEntry.nodes.push(makeObj(name));
                            toTraverse = dirTreeEntry.nodes;
                            found      = true;
                        }
                    });

                    if (!found) {
                        that.dirTree.push(makeObj(name));
                    }
                });
            };

            var traverseDir = function (entry, path) {

                path = path || '';

                // noinspection JSUnresolvedVariable
                if (entry.isFile) {
                    parsePath((path + entry.name));
                    return false;
                }

                if (entry.isDirectory) {

                    parsePath((path + entry.name));

                    var dirReader = entry.createReader();
                    dirReader.readEntries(function (entries) {
                        for (var i = 0; i < entries.length; i++) {
                            traverseDir(entries[i], path + entry.name + "/")
                        }
                    });
                }
            };

            traverseDir(entry);

            console.log(that.dirTree);
        });
    };
};