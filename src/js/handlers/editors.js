var EditorsHandler = function () {
    this.idx                  = 0;
    this.currentIdx           = null;
    this.previousIdx          = null;
    this.aceEditors           = [];
    this.aceClipboard         = '';
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

    this.init = function () {

        this._populateAddTabDropDown();
        if (this.getNumTabs() === 0) {
            this.onAddNewTab();
        }
    };

    this.bootAceEditor = function (idx) {

        if (typeof idx === typeof undefined) {
            return false;
        }

        idx           = parseInt(idx);
        var that      = this;
        var aceEditor = ace.edit('codepad-editor-' + idx);

        aceEditor.setTheme('ace/theme/monokai');
        aceEditor.setOptions({
            enableSnippets: true,
            enableLiveAutocompletion: true,
            enableBasicAutocompletion: true
        });
        aceEditor.$blockScrolling = 'Infinity';

        // Custom commands
        aceEditor.commands.addCommand({
            name: '_save',
            bindKey: {win: 'Ctrl-s', mac: 'ctrl-s'},
            exec: function () {
            }
        });

        // Maintain a centralised clipboard
        aceEditor.on('copy', function (e) {
            that.aceClipboard = e;
        });
        aceEditor.on('cut', function () {
            that.aceClipboard = aceEditor.getSelectedText();
        });

        this.aceEditors.push({"idx": idx, "ace": aceEditor});
        this.setAceEditorTemplate(idx);
        this.setAceEditorMode(idx);
        this._populateNavTabIcon(idx);
    };


    this.setAceEditorTemplate = function (idx) {

        idx           = parseInt(idx);
        var ext       = this._getTabFileExtension(idx);
        var aceEditor = this.getAceEditorAtIdx(idx);

        if (typeof ext !== typeof undefined && aceEditor.getValue() === '') {
            $.get('/src/html/templates/' + ext + '.tpl', function (data) {
                aceEditor.setValue(data);
                aceEditor.clearSelection();
            });
        }
    };

    this.setAceEditorMode = function (idx) {

        var that = this;
        idx      = parseInt(idx);

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

    this.getNumTabs = function () {
        return parseInt(this.getTabsNavContainer().children().length);
    };

    this.getAddTabDropDownContainer = function () {
        return $(document).find('.add-tab-dropdown').first();
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// PRIVATE Related to Tabs
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this._getNewTabObject = function (fileExt) {

        this.idx++;

        var obj = {};
        fileExt = (typeof fileExt === typeof undefined)
            ? this.defaultFileExt
            : fileExt;

        obj.idx          = this.idx;
        obj.contentId    = 'tab-' + this.idx;
        obj.codeEditorId = 'codepad-editor-' + this.idx;
        obj.fileName     = this.defaultFileName + '_' + this.idx + '.' + fileExt;

        obj.nav = $(
            '<li>' +
            '<a href="#' + obj.contentId + '" role="tab" data-idx="' + this.idx + '" data-toggle="tab">' +
            '<span class="filename">' + obj.fileName + '</span>' +
            this.navCloseBtnHtml +
            '</a>' +
            '</li>'
        );

        obj.content = $(
            '<div class="tab-pane fade" id="' + obj.contentId + '" data-idx="' + this.idx + '">' +
            '<div class="editor" id="' + obj.codeEditorId + '"></div>' +
            '</div>'
        );

        obj.nav.find('.filename').attr('data-idx', this.idx);
        obj.nav.find('.close').attr('data-idx', this.idx);
        return obj;
    };

    this._giveTabFocus = function (idx) {

        idx              = parseInt(idx);
        this.previousIdx = parseInt(this.currentIdx);

        if (this.getNumTabs() === 0) {
            this.currentIdx = null;
            return false;
        }

        var $el = (typeof this.getTabNavElement(idx) === typeof undefined)
            ? this.getTabsNavContainer().children().first()
            : this.getTabNavElement(idx);

        $el.find('*[data-toggle="tab"]').first().tab('show');
        this.currentIdx = parseInt(idx);

        return true;
    };

    this._getTabFileExtension = function (idx) {

        idx       = parseInt(idx);
        var $el   = this.getTabNavElement(idx);
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
            var $el = that.getTabNavElement(idx).find('*[data-toggle="tab"]').first();
            $el.find('.icon').remove();
            $el.append(that.navTabIconHtml);
            $el.find('.icon').addClass(data.icon);
        });
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

        $(window).trigger('resize');

        return true;
    };

    this.onEditTabName = function (idx) {

        if (typeof idx === typeof undefined) {
            return false;
        }

        var that      = this;
        idx           = parseInt(idx);
        var $el       = this.getTabNavElement(idx);
        var $fileName = $el.find('.filename').first();
        var $siblings = $fileName.siblings().css('visibility', 'hidden');

        $fileName.attr('contenteditable', 'true').focus().one('focusout', function () {
            $(this).removeAttr('contenteditable');
            that.setAceEditorTemplate(idx);
            that.setAceEditorMode(idx);
            that._populateNavTabIcon(idx);
            $siblings.css('visibility', 'visible');
        });

        $(window).trigger('resize');
    };

    this.onCloseTab = function (idx) {

        if (typeof idx === typeof undefined) {
            return false;
        }

        idx = parseInt(idx);
        this.getTabNavElement(idx).remove();
        this.getTabContentElement(idx).remove();
        this._giveTabFocus(this.previousIdx);

        $(window).trigger('resize');

        return true;
    };
};