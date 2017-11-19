var runtime = function (appWindow, isRestart) {
    appWindow.contentWindow.__MGA__bRestart = isRestart;
};

chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('src/html/app.html',
        {
            innerBounds: {width: 1024, height: 768},
            resizable: true,
            focused: true,
            frame: {
                color: "#343a40"
            },
            id: "codepad-main"
        },
        function (appWindow) {
            runtime(appWindow, false);
        }
    );
});

chrome.app.runtime.onRestarted.addListener(function () {
    chrome.app.window.create('src/html/app.html',
        {
            innerBounds: {width: 1024, height: 768},
            resizable: true,
            focused: true,
            frame: {
                color: "#343a40"
            },
            id: "codepad-main"
        },
        function (appWindow) {
            runtime(appWindow, true);
        }
    );
});