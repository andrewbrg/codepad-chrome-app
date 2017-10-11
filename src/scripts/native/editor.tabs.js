var EditorTab;
EditorTab = function () {

    this.tabIndex        = 1;
    this.newTabNameTxt   = 'Untitled';
    this.navCloseBtnHtml = '<span class="fa fa-close text-white close"></span>';
    this.navEditBtnHtml  = '<span class="fa fa-pencil text-white edit"></span>';

    /******************************************************
     *** Public Methods
     ******************************************************/
    this.bootAceEditor = function (tabIndex, editorMode) {
        tabIndex   = (typeof tabIndex === typeof undefined) ? 1 : tabIndex;
        editorMode = (typeof editorMode === typeof undefined) ? 'javascript' : editorMode;

        var aceEditor = ace.edit('codepad-editor-' + tabIndex);
        var aceMode   = ace.require('ace/mode/' + editorMode).Mode;
        aceEditor.setTheme("ace/theme/monokai");
        aceEditor.session.setMode(new aceMode());

        return aceEditor;
    };

    this.getNavContainer = function () {
        return $(document).find('.tab-list').first();
    };

    this.getContentContainer = function () {
        return $(document).find('.tab-content').first();
    };

    this.getNavElement = function (tabIndex) {
        if (typeof tabIndex === typeof undefined) {
            return false;
        }

        return this.getNavContainer().find('*[data-tab-index="' + tabIndex + '"]').first().closest('li');
    };

    this.getContentElement = function (tabIndex) {
        if (typeof tabIndex === typeof undefined) {
            return false;
        }

        return this.getContentContainer().find('.tab-pane[data-tab-index="' + tabIndex + '"]').first();
    };

    /******************************************************
     *** Private Methods
     ******************************************************/
    this._makeNewTabObj = function () {
        this.tabIndex++;

        var obj          = {};
        obj.tabIndex     = this.tabIndex;
        obj.contentId    = 'tab-' + this.tabIndex;
        obj.codeEditorId = 'codepad-editor-' + this.tabIndex;
        obj.nav          = $(
            '<li>' +
            '<a href="#' + obj.contentId + '" role="tab" data-toggle="tab">' +
            '<span class="filename">' + this.newTabNameTxt + ' ' + this.tabIndex + '</span>' +
            this.navEditBtnHtml +
            this.navCloseBtnHtml +
            '</a>' +
            '</li>'
        );
        obj.content      = $(
            '<div class="tab-pane fade" id="' + obj.contentId + '" data-tab-index="' + this.tabIndex + '">' +
            '<div class="editor" id="' + obj.codeEditorId + '"></div>' +
            '</div>'
        );

        obj.nav.find('.edit').attr('data-tab-index', this.tabIndex);
        obj.nav.find('.close').attr('data-tab-index', this.tabIndex);
        return obj;
    };

    /******************************************************
     *** Event callbacks
     ******************************************************/
    this.onAddNewTab = function () {
        var obj = this._makeNewTabObj();
        this.getNavContainer().append(obj.nav);
        this.getContentContainer().append(obj.content);
        this.bootAceEditor(obj.tabIndex);
        this.getNavElement(obj.tabIndex).tab('show');
    };

    this.onEditExistingTabName = function (tabIndex) {
        var $el = this.getNavElement(tabIndex);

        var $filename = $el.find(".filename").first();
        var $children = $filename.siblings().hide();


        $filename.attr('contenteditable', 'true').one('focusout', function () {
            $(this).removeAttr('contenteditable');
            $children.show();
        });
    };

    this.onCloseExistingTab = function (tabIndex) {

        if (typeof tabIndex === typeof undefined) {
            return false;
        }

        this.getNavElement(tabIndex).remove();
        this.getContentElement(tabIndex).remove();
        this.getNavElement(1).find('a').first().tab('show');

        return true;
    };
};

$(document).ready(function () {

    var EditorTabInst = new EditorTab();
    $(document).on('click', '.add-tab', function () {
        EditorTabInst.onAddNewTab();
    });

    $(document).on('click', '.tab-list .edit', function () {
        EditorTabInst.onEditExistingTabName($(this).attr('data-tab-index'));
    });

    $(document).on('click', '.tab-list .close', function () {
        EditorTabInst.onCloseExistingTab($(this).attr('data-tab-index'));
    });

    if (EditorTabInst.getContentContainer().children().length === 0) {
        EditorTabInst.onAddNewTab();
    }
});