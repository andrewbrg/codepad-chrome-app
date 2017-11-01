var SidebarHandler = function () {


    this.init = function () {
        this.loadSidebar();
    };

    this.loadSidebar = function () {
        $('#sidebar').treeview({data: this.getDirectoryTree()});
    };


    this.getDirectoryTree = function () {
        var tree = [
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

        return tree;
    }
};