(function () {

    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(search, this_len) {
            if (this_len === undefined || this_len > this.length) {
                this_len = this.length;
            }
            return this.substring(this_len - search.length, this_len) === search;
        };
    }

    function isMe(scriptElem){
        return scriptElem.getAttribute('src').endsWith("/embed.js");
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
    var embedjsSrc = currentScript ? currentScript.src : "https://act.tripgo.com/embed.js";
    console.log("embedjsSrc = " + embedjsSrc);

    var deployUrl = embedjsSrc.slice(0, embedjsSrc.indexOf("/embed.js"));

    var mainJsUrl = deployUrl + "/static/js/" + "main.%MAIN_JS_HASH%.js";
    var mainCssUrl = deployUrl + "/static/css/" + "main.%MAIN_CSS_HASH%.css";
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

    loadScript("https://cdn.polyfill.io/v2/polyfill.min.js?features=default,Array.prototype.find,Array.prototype.findIndex");
    loadScript("https://fonts.googleapis.com/css?family=Open+Sans:400,600,700|Source+Sans+Pro");

    var containerArray = document.getElementsByClassName("tripgo-query");
    if (containerArray.length > 0) {
        var container = containerArray[0];
        var tripgoKey = container.getAttribute("data-tripgo-key");
        var tripgoPlannerUrl = container.getAttribute("data-tripgo-planner-url");
        // var src = deployUrl + "?app=queryInput"
        //     + (tripgoKey ? "&key=" + tripgoKey : "")
        //     + (tripgoPlannerUrl ? "&plannerUrl=" + tripgoPlannerUrl : "");
        // var iframe = createIframe({
        //     src: src,
        //     width: "100%",
        //     height: "100%",
        //     style: "min-height: 600px"
        // });
        // containerArray[0].appendChild(iframe);
        if (mainCssUrl !== null) {
            loadCss(mainCssUrl);
        }
        loadScript(mainJsUrl, function() {
            var rootDiv = document.createElement('div');
            rootDiv.id = "query-root";
            container.appendChild(rootDiv);
            renderQueryInputWidget("query-root", tripgoKey != null ? tripgoKey : undefined, tripgoPlannerUrl);
        });
    }
    containerArray = document.getElementsByClassName("tripgo-journeyplanner");
    if (containerArray.length > 0) {
        container = containerArray[0];
        tripgoKey = container.getAttribute("data-tripgo-key");
        // src = deployUrl + "?app=tripPlanner"
        //     + (tripgoKey ? "&key=" + tripgoKey : "")
        //     + "&" + document.location.search.replace("?", "");
        // iframe = createIframe({
        //     src: src,
        //     width: "100%",
        //     height: "100%",
        //     style: "min-height: 600px"
        // });
        // containerArray[0].appendChild(iframe);
        if (mainCssUrl !== null) {
            loadCss(mainCssUrl);
        }
        // loadCss("https://api.mapbox.com/mapbox.js/v3.1.1/mapbox.css");
        loadScript(mainJsUrl, function() {
            var rootDiv = document.createElement('div');
            rootDiv.id = "trip-planner-root";
            // rootDiv.className = "app-style";
            container.appendChild(rootDiv);
            renderTripPlanner("trip-planner-root", tripgoKey != null ? tripgoKey : undefined);
        });
    }
}());