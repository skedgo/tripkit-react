var Constants = /** @class */ (function () {
    function Constants() {
    }
    Constants.isMe = function (scriptElem) {
        return scriptElem.getAttribute('src') && scriptElem.getAttribute('src').endsWith("/embed.js");
    };
    Constants.getCurrentScript = function () {
        if (document.currentScript) {
            return document.currentScript;
        }
        var currentScript = null;
        var scripts = Array.prototype.slice.call(document.getElementsByTagName("script"));
        for (var _i = 0, scripts_1 = scripts; _i < scripts_1.length; _i++) {
            var script = scripts_1[_i];
            if (Constants.isMe(script)) {
                currentScript = script;
            }
        }
        return currentScript;
    };
    Constants.initialize = function () {
        var currentScript = Constants.getCurrentScript();
        var embedjsSrc = currentScript ? currentScript.src : "https://act.tripgo.com/static/js";
        Constants.DEPLOY_URL = embedjsSrc.indexOf("/embed.js") !== -1 ? embedjsSrc.slice(0, embedjsSrc.indexOf("/embed.js")) :
            embedjsSrc.slice(0, embedjsSrc.indexOf("/static/js"));
        console.log("Constants.DEPLOY_URL = " + Constants.DEPLOY_URL);
    };
    Constants.absUrl = function (path) {
        return this.DEPLOY_URL + path;
    };
    return Constants;
}());
Constants.initialize();
export default Constants;
//# sourceMappingURL=Constants.js.map