import React from "react";
import { BrowserRouter as Router, Route} from "react-router-dom";
import QueryWidget from "../query-widget/QueryWidget";

const QueryInput = () => (
    <QueryWidget/>
);

const Embed = () => (
    <iframe
        src="https://tripgo.com"
        scrolling="no"
        width="100%"
        height="100%"
        frameBorder="0"
    />
);

const AppSelector = () => (
    <Router>
        <div>
            <Route
                path="/(|query)"
                component= {QueryInput}
            />
            <Route
                path="/embed"
                component= {Embed}
            />
        </div>
    </Router>
);

export default AppSelector;