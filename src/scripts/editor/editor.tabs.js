var EditorTab = function () {
    this.idx                  = 0;
    this.aceEditors           = [];
    this.currIdx              = null;
    this.lastIdx              = null;
    this.navCloseBtnHtml      = '<span class="fa fa-close text-white close"></span>';
    this.navTabIconHtml       = '<i class="icon"></i>';
    this.newFileDropdownEntry = '<a class="dropdown-item add-tab" href="#"></a>';
    this.defaultFileName      = 'untitled';
    this.defaultFileExt       = 'js';
    this.undefinedFileExt     = 'text';
    this.undefinedFileIcon    = 'icon-html';

    /******************************************************
     *** Public Methods
     ******************************************************/
    this.bootAceEditor = function (idx) {
        idx = (typeof idx === typeof undefined) ? 1 : idx;

        var aceEditor = ace.edit('codepad-editor-' + idx);
        aceEditor.setTheme('../ace/theme/monokai');
        aceEditor.$blockScrolling = Infinity;
        this.aceEditors[idx]      = aceEditor;
        this.setAceEditorTemplate(idx);
        this.setAceEditorMode(idx);
        this.setAceTabIcon(idx);

        return aceEditor;
    };

    this.setAceEditorTemplate = function (idx) {
        var ext       = this._getFileNameExtension(idx);
        var aceEditor = this.aceEditors[idx];
        if (typeof ext !== typeof undefined && aceEditor.getValue() === '') {
            $.get('/src/html/templates/' + ext + '.tpl', function (data) {
                aceEditor.setValue(data);
            });
        }
    };

    this.setAceEditorMode = function (idx) {
        var that = this;
        this._getMode(idx).then(function (data) {
            data = JSON.parse(data);
            that.aceEditors[idx].getSession().setMode('../ace/mode/' + data.mode);
        });
    };

    this.setAceTabIcon = function (idx) {
        var that = this;
        this._getMode(idx).then(function (data) {
            data    = JSON.parse(data);
            var $el = that.getNavElement(idx).find('[role="tab"]').first();
            $el.find('.icon').remove();
            $el.append(that.navTabIconHtml);
            $el.find('.icon').addClass(data.icon);
        });
    };

    this.getAceModes = function () {
        var deferred = $.Deferred();
        $.get('/src/scripts/editor/modes.json').done(function (data) {
            deferred.resolve(data);
        });

        return deferred.promise();
    };

    this.getNavContainer = function () {
        return $(document).find('.tab-list').first();
    };

    this.getContentContainer = function () {
        return $(document).find('.tab-content').first();
    };

    this.getAddFileDdContainer = function () {
        return $(document).find('.add-file-dropdown').first();
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
    this._makeNewTabObj = function (type) {
        this.idx++;

        var obj = {};
        type    = (typeof type === typeof undefined) ? this.defaultFileExt : type;

        obj.idx          = this.idx;
        obj.contentId    = 'tab-' + this.idx;
        obj.codeEditorId = 'codepad-editor-' + this.idx;
        obj.fileName     = this.defaultFileName + '_' + this.idx + '.' + type;
        obj.nav          = $(
            '<li>' +
            '<a href="#' + obj.contentId + '" role="tab" data-toggle="tab" class="ext-' + type + '">' +
            '<span class="filename">' + obj.fileName + '</span>' +
            this.navCloseBtnHtml +
            '</a>' +
            '</li>'
        );
        obj.content      = $(
            '<div class="tab-pane fade" id="' + obj.contentId + '" data-idx="' + this.idx + '">' +
            '<div class="editor" id="' + obj.codeEditorId + '"></div>' +
            '</div>'
        );

        obj.nav.find('.filename').attr('data-idx', this.idx);
        obj.nav.find('.close').attr('data-idx', this.idx);
        return obj;
    };

    this._giveFocus = function (idx) {
        if (this.getNavContainer().children().length === 0) {
            return false;
        }

        var $el = this.getNavElement(idx);
        if (typeof $el === typeof undefined) {
            this.getNavContainer().children().first()
        }

        $el.find('*[role="tab"]').first().tab('show');
        this.lastIdx = this.currIdx;
        this.currIdx = idx;

        return true;
    };

    this._getFileNameExtension = function (idx) {
        var $el   = this.getNavElement(idx);
        var regEx = /(?:\.([^.]+))?$/;

        if (typeof $el !== typeof undefined) {
            var ext = regEx.exec($el.find('.filename').first().html())[1];
            return ext.toLowerCase();
        }

        return this.undefinedFileExt;
    };

    this._getMode = function (idx) {
        var deferred = $.Deferred();
        var that     = this;

        this.getAceModes().then(function (data) {
            data    = JSON.parse(data);
            var ext = that._getFileNameExtension(idx);
            if (typeof ext === typeof undefined) {
                deferred.resolve(JSON.stringify({
                    "icon": that.undefinedFileIcon,
                    "mode": that.undefinedFileExt,
                    "name": "Text"
                }));
            }
            if (data.hasOwnProperty(ext)) {
                deferred.resolve(JSON.stringify(data[ext]));
            }
        });

        return deferred.promise();
    };

    /******************************************************
     *** Event callbacks
     ******************************************************/
    this.onAddNewTab = function (type) {
        var obj = this._makeNewTabObj(type);
        this.getNavContainer().append(obj.nav);
        this.getContentContainer().append(obj.content);
        this.bootAceEditor(obj.idx);
        this._giveFocus(obj.idx);
    };

    this.onEditExistingTabName = function (idx) {

        if (typeof idx === typeof undefined) {
            return false;
        }

        var that      = this;
        var $el       = this.getNavElement(idx);
        var $fileName = $el.find(".filename").first();
        var $siblings = $fileName.siblings().css('visibility', 'hidden');

        $fileName.attr('contenteditable', 'true').focus().one('focusout', function () {
            $(this).removeAttr('contenteditable');
            that.setAceEditorTemplate(idx);
            that.setAceEditorMode(idx);
            that.setAceTabIcon(idx);
            $siblings.css('visibility', 'visible');
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

    var EditorTabInstance = new EditorTab();
    $(document).on('click', '.add-tab', function () {
        var type = $(this).attr('data-type');
        EditorTabInstance.onAddNewTab(type);
    });

    $(document).on('click', '.tab-list .edit', function () {
        EditorTabInstance.onEditExistingTabName($(this).attr('data-idx'));
    });

    $(document).on('dblclick', '.tab-list .filename', function () {
        EditorTabInstance.onEditExistingTabName($(this).attr('data-idx'));
    });

    $(document).on('click', '.tab-list .close', function () {
        EditorTabInstance.onCloseExistingTab($(this).attr('data-idx'));
    });

    EditorTabInstance.getAceModes().done(function (data) {
        data = JSON.parse(data);
        EditorTabInstance.getAddFileDdContainer().html('');
        $.each(data, function (i, v) {
            EditorTabInstance.getAddFileDdContainer().append(
                $(EditorTabInstance.newFileDropdownEntry)
                    .attr('data-type', v.mode)
                    .append($(EditorTabInstance.navTabIconHtml).addClass(v.icon))
                    .append(v.name)
            );
        });
    });

    if (EditorTabInstance.getContentContainer().children().length === 0) {
        EditorTabInstance.onAddNewTab();
    }
});