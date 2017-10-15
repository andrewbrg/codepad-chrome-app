var EditorTab = function () {
    this.idx                  = 0;
    this.currentIdx           = null;
    this.previousIdx          = null;
    this.aceEditors           = [];
    this.navCloseBtnHtml      = '<span class="fa fa-close text-white close"></span>';
    this.navTabIconHtml       = '<i class="icon"></i>';
    this.newFileDropdownEntry = '<a class="dropdown-item action-add-tab" href="#"></a>';
    this.defaultFileName      = 'untitled';
    this.defaultFileExt       = 'js';
    this.undefinedFileExt     = 'text';
    this.undefinedFileIcon    = 'icon-html';


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// PUBLIC Related to Ace Editor
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.bootAceEditor = function (idx) {

        if (typeof idx === typeof undefined) {
            return;
        }

        var aceEditor = ace.edit('codepad-editor-' + idx);
        aceEditor.setTheme('../ace/theme/monokai');
        aceEditor.$blockScrolling = Infinity;
        aceEditor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true
        });
        aceEditor.__idx = idx;
        this.aceEditors.push(aceEditor);
        this.setAceEditorTemplate(idx);
        this.setAceEditorMode(idx);
        this.setNavTabIcon(idx);
    };

    this.setAceEditorTemplate = function (idx) {
        var ext       = this._getTabFileExtension(idx);
        var aceEditor = this.getAceEditorAtIdx(idx);
        if (typeof ext !== typeof undefined && aceEditor.getValue() === '') {
            $.get('/src/html/templates/' + ext + '.tpl', function (data) {
                aceEditor.setValue(data);
            });
        }
    };

    this.setAceEditorMode = function (idx) {
        var that = this;
        this._getTabMode(idx).then(function (data) {
            data = JSON.parse(data);
            that.getAceEditorAtIdx(idx).getSession().setMode('../ace/mode/' + data.mode);
        });
    };

    this.getAllAceEditorModes = function () {
        var deferred = $.Deferred();
        $.get('/src/settings/ace.modes.json').done(function (data) {
            deferred.resolve(data);
        });

        return deferred.promise();
    };

    this.getCurrentAceEditor = function () {
        return this.getAceEditorAtIdx(this.currentIdx);
    };

    this.getAceEditorAtIdx = function (idx) {
        var el = undefined;
        this.aceEditors.forEach(function (_el) {
            if (_el.__idx === idx) {
                el = _el;
            }
        });
        return el;
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// PUBLIC Related to Tabs
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.getTabsNavContainer = function () {
        return $(document).find('.tab-list').first();
    };

    this.getTabsContentContainer = function () {
        return $(document).find('.tab-content').first();
    };

    this.getTabNavElement = function (idx) {
        if (typeof idx === typeof undefined) {
            return undefined;
        }

        return this.getTabsNavContainer().find('*[data-idx="' + idx + '"]').first().closest('li');
    };

    this.getTabContentElement = function (idx) {
        if (typeof idx === typeof undefined) {
            return undefined;
        }

        return this.getTabsContentContainer().find('.tab-pane[data-idx="' + idx + '"]').first();
    };

    this.getAddTabDropDownContainer = function () {
        return $(document).find('.add-tab-dropdown').first();
    };

    this.setNavTabIcon = function (idx) {
        var that = this;
        this._getTabMode(idx).then(function (data) {
            data    = JSON.parse(data);
            var $el = that.getTabNavElement(idx).find('[role="tab"]').first();
            $el.find('.icon').remove();
            $el.append(that.navTabIconHtml);
            $el.find('.icon').addClass(data.icon);
        });
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// PRIVATE Related to Tabs
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this._getNewTabObject = function (fileExt) {
        this.idx++;

        var obj = {};
        fileExt = (typeof fileExt === typeof undefined) ? this.defaultFileExt : fileExt;

        obj.idx          = this.idx;
        obj.contentId    = 'tab-' + this.idx;
        obj.codeEditorId = 'codepad-editor-' + this.idx;
        obj.fileName     = this.defaultFileName + '_' + this.idx + '.' + fileExt;
        obj.nav          = $(
            '<li>' +
            '<a href="#' + obj.contentId + '" role="tab" data-toggle="tab" class="ext-' + fileExt + '">' +
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

    this._giveTabFocus = function (idx) {
        this.previousIdx = this.currentIdx;
        if (this.getTabsNavContainer().children().length === 0) {
            this.currentIdx = null;
            return false;
        }

        var $el = this.getTabNavElement(idx);
        if (typeof $el === typeof undefined) {
            this.getTabsNavContainer().children().first();
        }

        $el.find('*[role="tab"]').first().tab('show');
        this.currentIdx = idx;

        return true;
    };

    this._getTabFileExtension = function (idx) {
        var $el   = this.getTabNavElement(idx);
        var regEx = /(?:\.([^.]+))?$/;

        if (typeof $el !== typeof undefined) {
            var ext = regEx.exec($el.find('.filename').first().html())[1];
            return ext.toLowerCase();
        }

        return this.undefinedFileExt;
    };

    this._getTabMode = function (idx) {
        var deferred = $.Deferred();
        var that     = this;

        this.getAllAceEditorModes().then(function (data) {
            data    = JSON.parse(data);
            var ext = that._getTabFileExtension(idx);
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

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Event Callbacks related to Tabs
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.onAddNewTab = function (type) {
        var obj = this._getNewTabObject(type);
        this.getTabsNavContainer().append(obj.nav);
        this.getTabsContentContainer().append(obj.content);
        this.bootAceEditor(obj.idx);
        this._giveTabFocus(obj.idx);
    };

    this.onEditTabName = function (idx) {
        if (typeof idx === typeof undefined) {
            return false;
        }

        var that      = this;
        var $el       = this.getTabNavElement(idx);
        var $fileName = $el.find('.filename').first();
        var $siblings = $fileName.siblings().css('visibility', 'hidden');

        $fileName.attr('contenteditable', 'true').focus().one('focusout', function () {
            $(this).removeAttr('contenteditable');
            that.setAceEditorTemplate(idx);
            that.setAceEditorMode(idx);
            that.setNavTabIcon(idx);
            $siblings.css('visibility', 'visible');
        });
    };

    this.onCloseTab = function (idx) {
        if (typeof idx === typeof undefined) {
            return false;
        }

        this.getTabNavElement(idx).remove();
        this.getTabContentElement(idx).remove();
        this._giveTabFocus(this.previousIdx);

        return true;
    };
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Initialisation
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function () {

    window.EditorTabInstance = new EditorTab();
    var $contentContainer    = EditorTabInstance.getTabsContentContainer();

    $(document).on('click', '.action-add-tab', function () {
        var type = $(this).attr('data-type');
        EditorTabInstance.onAddNewTab(type);
    });

    $(document).on('click', '.tab-list .edit', function () {
        EditorTabInstance.onEditTabName($(this).attr('data-idx'));
    });

    $(document).on('dblclick', '.tab-list .filename', function () {
        EditorTabInstance.onEditTabName($(this).attr('data-idx'));
    });

    $(document).on('click', '.tab-list .close', function () {
        EditorTabInstance.onCloseTab($(this).attr('data-idx'));
    });

    EditorTabInstance.getAllAceEditorModes().done(function (data) {
        data = JSON.parse(data);
        EditorTabInstance.getAddTabDropDownContainer().html('');
        $.each(data, function (i, v) {
            EditorTabInstance.getAddTabDropDownContainer().append(
                $(EditorTabInstance.newFileDropdownEntry)
                    .attr('data-type', i)
                    .append($(EditorTabInstance.navTabIconHtml).addClass(v.icon))
                    .append(v.name)
            );
        });
    });

    if (EditorTabInstance.getTabsContentContainer().children().length === 0) {
        EditorTabInstance.onAddNewTab();
    }

    var $header = $('header');
    $(window).on('resize', function () {
        $contentContainer.css('top', Math.ceil($header.height()) + 'px');
    }).resize();
});