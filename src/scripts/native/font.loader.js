$(document).ready(function () {
    var xhr_1 = new XMLHttpRequest();
    xhr_1.open("GET", "https://fonts.gstatic.com/s/robotomono/v4/hMqPNLsu_dywMa4C_DEpY44P5ICox8Kq3LLUNMylGO4.woff2", true);
    xhr_1.responseType       = "blob";
    xhr_1.onreadystatechange = function () {
        if (xhr_1.readyState === 4) {
            var myfontblob = window.URL.createObjectURL(xhr_1.response);
            $("<style>").text("@font-face {\
            font-family: 'Roboto Mono';\
            font-style: normal;\
            font-weight: 400;\
            src: '" + myfontblob + "' format('woff2');\
        }").prependTo("head");
        }
    };

    var xhr_2 = new XMLHttpRequest();
    xhr_2.open("GET", "https://fonts.gstatic.com/s/opensans/v14/cJZKeOuBrn4kERxqtaUH3VtXRa8TVwTICgirnJhmVJw.woff2", true);
    xhr_2.responseType       = "blob";
    xhr_2.onreadystatechange = function () {
        if (xhr_2.readyState === 4) {
            var myfontblob = window.URL.createObjectURL(xhr_2.response);
            $("<style>").text("@font-face {\
            font-family: 'Roboto Mono';\
            font-style: normal;\
            font-weight: 400;\
            src: '" + myfontblob + "' format('woff2');\
        }").prependTo("head");
        }
    };

    xhr_1.send();
    xhr_2.send();
});