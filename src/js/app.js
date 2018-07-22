(function () {

    var runtime = function (appWindow, launchData, isRestart) {
        appWindow.contentWindow.launchData = launchData;
        appWindow.contentWindow.__MGA__bRestart = isRestart
    };

    chrome.app.runtime.onLaunched.addListener(function (launchData) {
        chrome.app.window.create('src/html/app.html', {
                innerBounds: {width: 1024, height: 768},
                resizable: true,
                focused: true,
                frame: {
                    color: "#343a40"
                },
                id: "codepad-main"
            },
            function (appWindow) {
                runtime(appWindow, launchData, false);
            }
        );
    });

    chrome.app.runtime.onRestarted.addListener(function (launchData) {
        chrome.app.window.create('src/html/app.html', {
                innerBounds: {width: 1024, height: 768},
                resizable: true,
                focused: true,
                frame: {
                    color: "#343a40"
                },
                id: "codepad-main"
            },
            function (appWindow) {
                runtime(appWindow, launchData, true);
            }
        );
    });
})();