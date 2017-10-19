var FontsHandler = function () {

    this.load = function (fonts) {

        var xhrUrl;
        var xhrs = [];

        if ($.isArray(fonts) === false) {
            var _fonts = [];
            _fonts.push(fonts);
            fonts = _fonts;
        }

        fonts.forEach(function (font) {

            var idx = xhrs.length;
            xhrs.push(new XMLHttpRequest());

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

            xhrs[idx].open("GET", xhrUrl, true);
            xhrs[idx].responseType       = "blob";
            xhrs[idx].onreadystatechange = function () {
                if (xhrs[idx].readyState === 4) {
                    $('head').find('.' + font.replace(/ /g, '')).remove();
                    $('<style>').text("@font-face {\
                        font-family: '" + font + "';\
                        font-style: normal;\
                        font-weight: 400;\
                        src: '" + window.URL.createObjectURL(xhrs[idx].response) + "' format('woff2');\
                    }").addClass(font.replace(/ /g, '')).prependTo('head');
                }
            };
            xhrs[idx].send();
        });

        return this;
    }
};