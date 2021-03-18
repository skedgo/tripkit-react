(function () {

    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            'use strict';

            if (search instanceof RegExp) {
                throw TypeError('first argument must not be a RegExp');
            }
            if (start === undefined) { start = 0; }
            return this.indexOf(search, start) !== -1;
        };
    }

    function isMe(scriptElem){
        return scriptElem.getAttribute('src') && scriptElem.getAttribute('src').includes("/embed.js");
    }

    function getCurrentScript() {
        if (document.currentScript) {
            return document.currentScript;
        }
        var currentScript = null;
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; ++i) {
            if(isMe(scripts[i])){
                currentScript = scripts[i];
            }
        }
        return currentScript;
    }

    var currentScript = getCurrentScript();
    var embedjsSrc = currentScript.src;
    console.log("embedjsSrc = " + embedjsSrc);

    var deployUrl = embedjsSrc.slice(0, embedjsSrc.indexOf("/embed.js"));

    var mainJsUrl = deployUrl + "/static/js/" + "index.js";
    var mainCssUrl = deployUrl + "/static/css/" + "index.css";
    // var mainJsUrl = deployUrl + "/static/js/" + "bundle.js";
    // var mainCssUrl = null;

    function loadScript(url, callback) {
        // Adding the script tag to the head as suggested before
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    }

    function loadCss(url, callback) {
        // Adding the script tag to the head as suggested before
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = 'actTPStyle';
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.media = 'all';
        link.onreadystatechange = callback;
        link.onload = callback;
        // Fire the loading
        head.appendChild(link);
    }

    loadCss("https://fonts.googleapis.com/css?family=Open+Sans:400,600,700|Source+Sans+Pro");

    var query = embedjsSrc.replace(/^[^\?]+\??/,'');
    // Parse the querystring into arguments and parameters
    var vars = query.split("&");
    var args = {};
    for (var i=0; i<vars.length; i++) {
        var pair = vars[i].split("=");
        // decodeURI doesn't expand "+" to a space.
        args[pair[0]] = decodeURI(pair[1]).replace(/\+/g, ' ');
    }
    var apiKey = args['key'];

    var queryContainer = document.getElementById("tripgo-query");
    if (queryContainer) {
        if (mainCssUrl !== null) {
            loadCss(mainCssUrl);
        }
        loadScript(mainJsUrl, function() {
            var rootDiv = document.createElement('div');
            rootDiv.id = "query-root";
            queryContainer.appendChild(rootDiv);
            renderQueryInputWidget("query-root", apiKey);
        });
    }

    var plannerContainer = document.getElementById("tripgo-planner");
    if (plannerContainer) {
        if (mainCssUrl !== null) {
            loadCss(mainCssUrl);
        }
        loadScript(mainJsUrl, function() {
            renderTripPlanner("tripgo-planner", apiKey);
        });
    }
}());