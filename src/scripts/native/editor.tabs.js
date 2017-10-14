var EditorTab;
EditorTab = function () {

    this.idx             = 0;
    this.currIdx         = null;
    this.lastIdx         = null;
    this.newTabNameTxt   = 'Untitled';
    this.navCloseBtnHtml = '<span class="fa fa-close text-white close"></span>';
    this.navEditBtnHtml  = '<span class="fa fa-pencil text-white edit pull-right"></span>';

    /******************************************************
     *** Public Methods
     ******************************************************/
    this.bootAceEditor = function (idx, editorMode) {
        idx        = (typeof idx === typeof undefined) ? 1 : idx;
        editorMode = (typeof editorMode === typeof undefined) ? 'javascript' : editorMode;

        var aceEditor = ace.edit('codepad-editor-' + idx);
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

    this.getNavElement = function (idx) {
        if (typeof idx === typeof undefined) {
            return undefined;
        }

        return this.getNavContainer().find('*[data-idx="' + idx + '"]').first().closest('li');
    };

    this.getContentElement = function (idx) {
        if (typeof idx === typeof undefined) {
            return undefined;
        }

        return this.getContentContainer().find('.tab-pane[data-idx="' + idx + '"]').first();
    };

    /******************************************************
     *** Private Methods
     ******************************************************/
    this._makeNewTabObj = function () {
        this.idx++;

        var obj          = {};
        obj.idx          = this.idx;
        obj.contentId    = 'tab-' + this.idx;
        obj.codeEditorId = 'codepad-editor-' + this.idx;
        obj.nav          = $(
            '<li>' +
            '<a href="#' + obj.contentId + '" role="tab" data-toggle="tab">' +
            '<span class="filename">' + this.newTabNameTxt + ' ' + this.idx + '</span>' +
            this.navEditBtnHtml +
            this.navCloseBtnHtml +
            '</a>' +
            '</li>'
        );
        obj.content      = $(
            '<div class="tab-pane fade" id="' + obj.contentId + '" data-idx="' + this.idx + '">' +
            '<div class="editor" id="' + obj.codeEditorId + '"></div>' +
            '</div>'
        );

        obj.nav.find('.edit').attr('data-idx', this.idx);
        obj.nav.find('.close').attr('data-idx', this.idx);
        return obj;
    };

    this._giveFocus = function (idx) {
        var $el = this.getNavElement(idx);
        if (typeof $el === typeof undefined) {
            return false;
        }

        $el.find('*[role="tab"]').first().tab('show');
        this.lastIdx = this.currIdx;
        this.currIdx = idx;

        return true;
    };

    /******************************************************
     *** Event callbacks
     ******************************************************/
    this.onAddNewTab = function () {
        var obj = this._makeNewTabObj();
        this.getNavContainer().append(obj.nav);
        this.getContentContainer().append(obj.content);
        this.bootAceEditor(obj.idx);

        this._giveFocus(obj.idx);
    };

    this.onEditExistingTabName = function (idx) {
        var $el       = this.getNavElement(idx);
        var $filename = $el.find(".filename").first();
        var $children = $filename.siblings().css('visibility', 'hidden');

        $filename.attr('contenteditable', 'true').focus().one('focusout', function () {
            $(this).removeAttr('contenteditable');
            $children.css('visibility', 'visible');
        });
    };

    this.onCloseExistingTab = function (idx) {

        if (typeof idx === typeof undefined) {
            return false;
        }

        this.getNavElement(idx).remove();
        this.getContentElement(idx).remove();
        this._giveFocus(this.lastIdx);

        return true;
    };
};

$(document).ready(function () {

    var EditorTabInst = new EditorTab();
    $(document).on('click', '.add-tab', function () {
        EditorTabInst.onAddNewTab();
    });

    $(document).on('click', '.tab-list .edit', function () {
        EditorTabInst.onEditExistingTabName($(this).attr('data-idx'));
    });

    $(document).on('click', '.tab-list .close', function () {
        EditorTabInst.onCloseExistingTab($(this).attr('data-idx'));
    });

    if (EditorTabInst.getContentContainer().children().length === 0) {
        EditorTabInst.onAddNewTab();
    }
});