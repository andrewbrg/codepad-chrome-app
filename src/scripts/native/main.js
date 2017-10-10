chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('src/html/main.html',
        {
            innerBounds: {width: 800, height: 600},
            resizable: true,
            focused: true,
            id: "codepad-main"
        },
        function (appWindow) {
            appWindow.contentWindow.__MGA__bRestart = false;
        }
    );
});

chrome.app.runtime.onRestarted.addListener(function () {
    chrome.app.window.create('src/html/main.html',
        {
            innerBounds: {width: 800, height: 600},
            resizable: true,
            focused: true,
            id: "codepad-main"
        },
        function (appWindow) {
            appWindow.contentWindow.__MGA__bRestart = true;
        }
    );
});