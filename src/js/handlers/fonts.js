var FontsHandler = function () {

    this.loadFont = function (font) {

        var xhrUrl;
        var xhr = new XMLHttpRequest();

        switch (font) {
            case 'Open Sans':
                xhrUrl = "https://fonts.gstatic.com/s/opensans/v14/cJZKeOuBrn4kERxqtaUH3VtXRa8TVwTICgirnJhmVJw.woff2";
                break;
            case 'Roboto Mono':
                xhrUrl = "https://fonts.gstatic.com/s/robotomono/v4/hMqPNLsu_dywMa4C_DEpY44P5ICox8Kq3LLUNMylGO4.woff2";
                break;
        }

        if (typeof xhrUrl === typeof undefined) {
            return this;
        }

        xhr.open("GET", xhrUrl, true);
        xhr.responseType       = "blob";
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                $('head').find('.' + font.replace(/ /g, '')).remove();
                $('<style>').text("@font-face {\
                    font-family: '" + font + "';\
                    font-style: normal;\
                    font-weight: 400;\
                    src: '" + window.URL.createObjectURL(xhr.response) + "' format('woff2');\
                }").addClass(font.replace(/ /g, '')).prependTo('head');
            }
        };
        xhr.send();

        return this;
    }
};