$(document).ready(function () {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://fonts.gstatic.com/s/robotomono/v4/hMqPNLsu_dywMa4C_DEpY44P5ICox8Kq3LLUNMylGO4.woff2", true);
    xhr.responseType = "blob";
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            var myfontblob = window.URL.createObjectURL(xhr.response);
            $("<style>").text("@font-face {\
            font-family: 'Roboto Mono';\
            font-style: normal;\
            font-weight: 400;\
            src: '" + myfontblob + "' format('woff2');\
        }").prependTo("head");
        }
    };
    xhr.send();
});