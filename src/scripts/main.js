chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('src/html/main.html',
        {
            innerBounds: {width: 800, height: 600},
            resizable: true,
            focused: true,
            id: "JSPadMain"
        },
        function (appWindow) {
            appWindow.contentWindow.__MGA__bRestart = false;
        }
    );
});

chrome.app.runtime.onRestarted.addListener(function () {
    chrome.app.window.create('player.html',
        {
            innerBounds: {width: 800, height: 600},
            resizable: true,
            focused: true,
            id: "HTMLPlayer"
        },
        function (appWindow) {
            appWindow.contentWindow.__MGA__bRestart = true;
        }
    );
});

chrome.fileBrowserHandler.onExecute.addListener(function (id, details) {
    if (id === 'open-file') {
        var fileEntries = details.entries;
        for (var i = 0, entry; entry = fileEntries[i]; ++i) {
            entry.file(function (file) {
              
            });
        }
    }
});