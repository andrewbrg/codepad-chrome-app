var tabID          = 1;
var tabCloseButton = '<span class="fa fa-close text-muted close"></span>';
var tabEditButton  = '<span class="fa fa-pencil text-muted edit"></span>';

function initAceEditor(id) {
    var editor = ace.edit(id);
    editor.setTheme("ace/theme/monokai");

    var JavaScriptMode = ace.require("ace/mode/javascript").Mode;
    editor.session.setMode(new JavaScriptMode());
}

function resetTabs() {
    var tabs = $(".tab-list li:not(:first)");
    var len  = 1;
    $(tabs).each(function () {
        len++;
        $(this).find('a').html(
            '<span>File ' + len + '</span>' +
            tabEditButton + tabCloseButton
        );
    });
    tabID--;
}

var editHandler = function () {
    var t = $(this);
    t.css("visibility", "hidden");
    $(this).prev().attr("contenteditable", "true").focusout(function () {
        $(this).removeAttr("contenteditable").off("focusout");
        t.css("visibility", "visible");
    });
};

$(document).ready(function () {
    $(".add-tab").click(function () {
        tabID++;
        $(".tab-list").append(
            $('<li>' +
                '<a href="#tab' + tabID + '" role="tab" data-toggle="tab">' +
                '<span>File ' + tabID + '</span> ' +
                tabEditButton +
                tabCloseButton +
                '</a>' +
                '</li>'
            )
        );
        $('.tab-content').append(
            $('<div class="tab-pane fade" id="tab' + tabID + '">' +
                '<div id="codepad-editor-' + tabID + '" class="editor"></div>' +
                '</div>'
            )
        );
        initAceEditor('codepad-editor-' + tabID);
        $(".edit").click(editHandler);
    });

    $(".tab-list").on("click", ".close", function () {
        var tabID = $(this).parents("a").attr("href");
        $(this).parents("li").remove();
        $(tabID).remove();

        var tabFirst = $(".tab-list a:first");
        resetTabs();
        tabFirst.tab("show");
    });

    initAceEditor('codepad-editor-' + tabID);
    $(".edit").click(editHandler);
});