import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import QueryWidget from "../query-widget/QueryWidget";
var QueryInput = function () { return (React.createElement(QueryWidget, null)); };
var Embed = function () { return (React.createElement("iframe", { src: "https://tripgo.com", scrolling: "no", width: "100%", height: "100%", frameBorder: "0" })); };
var AppSelector = function () { return (React.createElement(Router, null,
    React.createElement("div", null,
        React.createElement(Route, { path: "/(|query)", component: QueryInput }),
        React.createElement(Route, { path: "/embed", component: Embed })))); };
export default AppSelector;
//# sourceMappingURL=AppSelector.js.map