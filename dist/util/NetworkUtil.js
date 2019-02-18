import Util from "./Util";
var MethodType;
(function (MethodType) {
    MethodType["GET"] = "GET";
    MethodType["POST"] = "POST";
    MethodType["PUT"] = "PUT";
    MethodType["DELETE"] = "DELETE";
})(MethodType || (MethodType = {}));
var NetworkUtil = /** @class */ (function () {
    function NetworkUtil() {
    }
    NetworkUtil.status = function (response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response);
        }
        else {
            return Promise.reject(new Error(response.statusText));
        }
    };
    NetworkUtil.json = function (response) {
        if (response.status === 204) { // No content (so, no response.json()).
            return Promise.resolve({});
        }
        return response.json();
    };
    NetworkUtil.jsonCallback = function (response) {
        return NetworkUtil.status(response)
            .then(NetworkUtil.json);
    };
    /**
     * Dynamically imports jquery, and then gets the script dynamically
     */
    NetworkUtil.getScript = function (url) {
        if (Util.global.$) {
            return Util.global.$.getScript(url);
        }
        return import('../jslib/JQuery').then(function (value) { return Util.global.$.getScript(url); });
    };
    NetworkUtil.getStylesheet = function (url) {
        if (Util.global.$) {
            return NetworkUtil.getStylesheetJQ(url);
        }
        return import('../jslib/JQuery').then(function (value) { return NetworkUtil.getStylesheetJQ(url); });
    };
    NetworkUtil.loadCss = function (url, callback) {
        // Adding the script tag to the head as suggested before
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = 'actTPStyle';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.media = 'all';
        link.onreadystatechange = callback;
        link.onload = callback;
        // Fire the loading
        head.appendChild(link);
    };
    NetworkUtil.makeCancelable = function (promise) {
        var hasCanceled = false;
        var wrappedPromise = new Promise(function (resolve, reject) {
            promise.then(function (val) { return hasCanceled ? reject({ isCanceled: true }) : resolve(val); }, function (error) { return hasCanceled ? reject({ isCanceled: true }) : reject(error); });
        });
        return {
            promise: wrappedPromise,
            cancel: function () {
                hasCanceled = true;
            },
        };
    };
    ;
    NetworkUtil.MethodType = MethodType;
    NetworkUtil.getStylesheetJQ = function (href) {
        var $d = $.Deferred();
        var $link = $('<link/>', {
            rel: 'stylesheet',
            type: 'text/css',
            href: href
        }).appendTo('head');
        $d.resolve($link);
        return $d.promise();
    };
    return NetworkUtil;
}());
// Exports to gwt
Util.global.getScript = NetworkUtil.getScript;
Util.global.getStylesheet = NetworkUtil.getStylesheet;
export default NetworkUtil;
//# sourceMappingURL=NetworkUtil.js.map