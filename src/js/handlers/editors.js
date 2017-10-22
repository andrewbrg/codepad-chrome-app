var EditorsHandler = function () {

    this.idx                  = 0;
    this.currentIdx           = null;
    this.previousIdx          = null;
    this.aceEditors           = [];
    this.aceClipboard         = '';
    this.navCloseBtnHtml      = '<i class="fa fa-fw fa-close text-white action-close-tab"></i>';
    this.navDirtyBtnHtml      = '<i class="fa fa-fw fa-circle-o dirty-tab action-close-tab"></i>';
    this.navTabIconHtml       = '<i class="filetype-icon icon"></i>';
    this.navFilenameHtml      = '<span class="filename"></span>';
    this.newFileDropdownEntry = '<a class="dropdown-item action-add-tab" href="#"></a>';
    this.defaultFileName      = 'untitled';
    this.defaultFileExt       = 'js';
    this.defaultFont          = 'Roboto Mono';
    this.undefinedFileExt     = 'text';
    this.undefinedFileIcon    = 'icon-html';


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private Helper
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this._notify = function (type, title, message) {
        $.notify(
            {
                title: '<strong>' + title + '</strong>',
                message: message
            },
            {
                type: type,
                placement: {
                    from: "bottom",
                    align: "right"
                },
                offset: 10
            }
        );
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private Ace
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this._bootAceEditor = function (idx, filePath, editorContent) {

        if (typeof idx === typeof undefined) {
            return false;
        }

        idx = parseInt(idx);

        var aceEditor = ace.edit('codepad-editor-' + idx);

        // Configure Ace
        aceEditor.$blockScrolling = Infinity;
        aceEditor.setTheme('ace/theme/monokai');
        aceEditor.setOptions({
            fontFamily: this.defaultFont,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            enableBasicAutocompletion: true
        });

        // Add status bar
        var StatusBar = ace.require("ace/ext/statusbar").StatusBar;
        var statusBar = new StatusBar(aceEditor, document.getElementById('status-bar-' + idx));

        // Initialise
        this.aceEditors.push({"idx": idx, "ace": aceEditor, "statusBar": statusBar, "filePath": filePath});
        this.setEditorContent(idx, editorContent);
        this.setAceEditorMode(idx);
        this._populateNavTabIcon(idx);
        this._populateStatusBar(idx);

        // Build custom commands
        this._bindAceCustomCommands(idx, aceEditor);

        // Build custom events
        this._bindAceCustomEvents(idx, aceEditor);
    };

    this._bindAceCustomCommands = function (idx, aceEditor) {

        var that = this;

        aceEditor.commands.addCommand({
            name: '_save',
            bindKey: {win: 'ctrl-s', mac: 'ctrl-s'},
            exec: function () {
                that._markNavTabClean(idx);
            }
        });
        aceEditor.commands.addCommand({
            name: '__open',
            bindKey: {win: 'ctrl-o', mac: 'ctrl-o'},
            exec: function () {
                that.onOpenFile();
            }
        });
    };

    this._bindAceCustomEvents = function (idx, aceEditor) {

        var that = this;

        // Detect changes in content
        aceEditor.on('change', function () {
            that._markNavTabDirty(idx);
        });

        // Maintain a centralised clipboard
        aceEditor.on('copy', function (e) {
            that.aceClipboard = e;
        });
        aceEditor.on('cut', function () {
            that.aceClipboard = aceEditor.getSelectedText();
        });
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private tabs
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this._getNewTabObject = function (fileExt, fileName) {

        this.idx++;

        var obj          = {};
        obj.idx          = this.idx;
        obj.contentId    = 'tab-' + this.idx;
        obj.codeEditorId = 'codepad-editor-' + this.idx;
        obj.statusBarId  = 'status-bar-' + this.idx;
        obj.fileName     = fileName + '.' + fileExt;

        obj.nav = $(
            '<li>' +
            '<a href="#' + obj.contentId + '" role="tab" data-idx="' + this.idx + '" data-toggle="tab">' +
            this.navFilenameHtml +
            this.navCloseBtnHtml +
            '</a>' +
            '</li>'
        );

        obj.nav.find('.filename').attr('data-idx', this.idx).html(obj.fileName);
        obj.nav.find('.action-close-tab').attr('data-idx', this.idx);

        obj.content = $(
            '<div class="tab-pane fade" id="' + obj.contentId + '" data-idx="' + this.idx + '">' +
            '<div class="editor" id="' + obj.codeEditorId + '"></div>' +
            '<div class="ace-status-bar text-white bg-dark" id="' + obj.statusBarId + '"></div>' +
            '</div>'
        );

        return obj;
    };

    this._giveTabFocus = function (idx) {

        idx              = parseInt(idx);
        this.previousIdx = parseInt(this.currentIdx);

        if (this.getNumTabs() === 0) {
            this.currentIdx = null;
            return false;
        }

        var $el = (typeof this.getTabNavElAtIdx(idx) === typeof undefined)
            ? this.getTabsNavContainer().children().first()
            : this.getTabNavElAtIdx(idx);

        $el.find('*[data-toggle="tab"]').first().tab('show');
        this.currentIdx = parseInt(idx);

        return true;
    };

    this._getTabFileExtension = function (idx) {

        idx       = parseInt(idx);
        var $el   = this.getTabNavElAtIdx(idx);
        var regEx = /(?:\.([^.]+))?$/;

        if (typeof $el !== typeof undefined) {
            var ext = regEx.exec($el.find('.filename').first().html())[1];
            return ext.toLowerCase();
        }

        return this.undefinedFileExt;
    };

    this._getTabMode = function (idx) {

        var that     = this;
        var deferred = $.Deferred();
        idx          = parseInt(idx);

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

    this._populateAddTabDropDown = function () {

        var that = this;

        this.getAllAceEditorModes().done(function (data) {
            data = JSON.parse(data);
            that.getAddTabDropDownContainer().html('');
            $.each(data, function (i, v) {
                that.getAddTabDropDownContainer().append(
                    $(that.newFileDropdownEntry)
                        .attr('data-type', i)
                        .append($(that.navTabIconHtml).addClass(v.icon))
                        .append(v.name)
                );
            });
        });
    };

    this._populateNavTabIcon = function (idx) {

        var that = this;

        idx = parseInt(idx);
        this._getTabMode(idx).then(function (data) {
            data    = JSON.parse(data);
            var $el = that.getTabNavElAtIdx(idx).find('*[data-toggle="tab"]').first();
            $el.find('.filetype-icon').remove();
            $el.append(that.navTabIconHtml);
            $el.find('.filetype-icon').addClass(data.icon);
        });
    };

    this._populateStatusBar = function (idx) {

        idx = parseInt(idx);

        var editor     = this.getAceEditorAtIdx(idx);
        var $statusBar = this.getStatusBarContentElAtIdx(idx);

        var ro        = editor.getOption('readOnly');
        var isRo      = typeof ro === typeof undefined ? false : ro;
        var lockClass = isRo ? 'fa-lock' : 'fa-unlock';

        $statusBar.find('.ace_status-info').remove();
        $statusBar.append(
            '<div class="ace_status-info">' +
            '<span><a href="#" class="action-toggle-readonly"><i class="fa ' + lockClass + ' "></i></a></span>' +
            '<span>' + editor.getOption('mode').split('/').pop() + '</span>' +
            '<span>' + editor.getOption('newLineMode') + '</span>' +
            '</div>'
        );
    };

    this._markNavTabDirty = function (idx) {

        idx     = parseInt(idx);
        var $el = this.getTabNavElAtIdx(idx).find('*[data-toggle="tab"]').first();

        $el.addClass('is-dirty').find('.dirty-tab').remove();
        $el.append(
            $(this.navDirtyBtnHtml).attr('data-idx', idx)
        );
    };

    this._markNavTabClean = function (idx) {

        idx     = parseInt(idx);
        var $el = this.getTabNavElAtIdx(idx).find('*[data-toggle="tab"]').first();

        $el.removeClass('is-dirty').find('.dirty-tab').remove();
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Ace
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.init = function () {

        this._populateAddTabDropDown();
    };

    this.setAceEditorTemplate = function (idx) {

        idx           = parseInt(idx);
        var ext       = this._getTabFileExtension(idx);
        var aceEditor = this.getAceEditorAtIdx(idx);

        if (typeof ext !== typeof undefined && aceEditor.getValue() === '') {
            try {
                $.get('/src/html/templates/' + ext + '.tpl', function (data) {
                    aceEditor.setValue(data);
                    aceEditor.clearSelection();
                });
            }
            catch (e) {
            }
        }
    };

    this.setEditorContent = function (idx, content) {

        idx           = parseInt(idx);
        var aceEditor = this.getAceEditorAtIdx(idx);

        if (typeof content === typeof undefined) {
            this.setAceEditorTemplate(idx);
            return;
        }

        aceEditor.setValue(content);
        aceEditor.clearSelection();
    };

    this.setAceEditorMode = function (idx) {

        var that = this;
        idx      = parseInt(idx);

        this._getTabMode(idx).then(function (data) {
            that.getAceEditorAtIdx(idx).setOption('mode', 'ace/mode/' + JSON.parse(data).mode);
            that._populateStatusBar(idx);
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

        var ace = undefined;
        idx     = parseInt(idx);

        this.aceEditors.forEach(function (el) {
            if (el.idx === idx) {
                ace = el.ace;

                return false;
            }
        });

        return ace;
    };

    this.getAllAceEditors = function () {
        return this.aceEditors;
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public tabs
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.getTabsNavContainer = function () {
        return $(document).find('.tab-list').first();
    };

    this.getTabsContentContainer = function () {
        return $(document).find('.tab-content').first();
    };


    this.getTabNavElAtIdx = function (idx) {

        if (typeof idx === typeof undefined) {
            return undefined;
        }
        return this.getTabsNavContainer().find('*[data-idx="' + idx + '"]').first().closest('li');
    };

    this.getTabContentElAtIdx = function (idx) {

        if (typeof idx === typeof undefined) {
            return undefined;
        }
        return this.getTabsContentContainer().find('.tab-pane[data-idx="' + idx + '"]').first();
    };

    this.getStatusBarContentElAtIdx = function (idx) {

        var $tabContent = this.getTabContentElAtIdx(idx);
        if (typeof $tabContent === typeof undefined) {
            return undefined;
        }

        return $tabContent.find('.ace-status-bar').first();
    };

    this.getNumTabs = function () {
        return parseInt(this.getTabsNavContainer().children().length);
    };

    this.getAddTabDropDownContainer = function () {
        return $(document).find('.add-tab-dropdown').first();
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public Event Callbacks
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.onAddNewTab = function (fileExt, fileName, filePath, fileContent) {

        fileExt = (typeof fileExt === typeof undefined)
            ? this.defaultFileExt
            : fileExt;

        fileName = (typeof fileName === typeof undefined)
            ? this.defaultFileName + '_' + (this.idx + 1)
            : fileName;

        filePath = (typeof filePath === typeof undefined)
            ? '/' + fileName + '.' + fileExt
            : filePath;

        var obj = this._getNewTabObject(fileExt, fileName);
        this.getTabsNavContainer().append(obj.nav);
        this.getTabsContentContainer().append(obj.content);
        this._bootAceEditor(obj.idx, filePath, fileContent);
        this._giveTabFocus(obj.idx);

        $(window).trigger('_ace.new', [obj.idx]).trigger('resize');
        return true;
    };

    this.onEditTabName = function (idx) {

        if (typeof idx === typeof undefined) {
            return false;
        }

        var that      = this;
        idx           = parseInt(idx);
        var $el       = this.getTabNavElAtIdx(idx);
        var $fileName = $el.find('.filename').first();
        var $siblings = $fileName.siblings().css('visibility', 'hidden');

        $fileName.attr('contenteditable', 'true').focus().one('focusout', function () {
            $(this).removeAttr('contenteditable');
            that.setAceEditorTemplate(idx);
            that.setAceEditorMode(idx);
            $siblings.css('visibility', 'visible');
        });

        $(window).trigger('resize');
    };

    this.onCloseTab = function (idx) {

        if (typeof idx === typeof undefined) {
            return false;
        }

        idx = parseInt(idx);
        this.getTabNavElAtIdx(idx).remove();
        this.getTabContentElAtIdx(idx).remove();
        this._giveTabFocus(this.previousIdx);

        $(window).trigger('resize');

        return true;
    };

    this.onOpenFile = function () {

        var that = this;

        chrome.fileSystem.chooseEntry({type: 'openFile'}, function (entry) {

            if (chrome.runtime.lastError) {
                that._notify('danger', 'File error', 'Whoops... ' + chrome.runtime.lastError.message);
                return false;
            }

            entry.file(function (file) {
                var reader   = new FileReader();
                var fileExt  = entry.name.split('.').pop();
                var fileName = entry.name.split('.').reverse().pop();

                reader.readAsText(file);
                reader.onerror = function (msg) {
                    that._notify('danger', 'Read Error', 'Whoops... ' + msg);
                };
                reader.onload  = function (e) {
                    that.onAddNewTab(fileExt, fileName, entry.path, e.target.result);
                };
            });
        });
    };

    this.onToggleReadOnly = function (idx) {

        var that = this;
        if (typeof idx === typeof undefined) {
            $.each(this.getAllAceEditors(), function (i, v) {
                that.onToggleReadOnly(v.idx);
            });
        }

        var aceEditor  = this.getAceEditorAtIdx(idx);
        var isReadOnly = !aceEditor.getOption('readOnly');

        aceEditor.setOption('readOnly', isReadOnly);

        if (isReadOnly) {
            this.getTabContentElAtIdx(idx).find('.action-toggle-readonly .fa').removeClass('fa-unlock').addClass('fa-lock');
        }
        else {
            this.getTabContentElAtIdx(idx).find('.action-toggle-readonly .fa').removeClass('fa-lock').addClass('fa-unlock');
        }
    };

};