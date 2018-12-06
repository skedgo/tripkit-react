import * as React from 'react';
import * as ReactDOM from 'react-dom';
import "./polyfills-ie11";
import QueryWidget from './query-widget/QueryWidget';
import Location from "./model/Location";
// import registerServiceWorker from './registerServiceWorker';
import { unregister } from './registerServiceWorker';
import DeviceUtil from "./util/DeviceUtil";
import Util from "./util/Util";
// import * as queryString from "querystring";
import * as queryString from "query-string";
import TripPlanner from "./trip-planner/TripPlanner";
import RoutingQuery, {TimePreference} from "./model/RoutingQuery";
import LatLng from "./model/LatLng";
import DateTimeUtil from "./util/DateTimeUtil";
import TripGoApi from "./api/TripGoApi";
import withRoutingResults from "./api/WithRoutingResults";

const searchStr = window.location.search;
// Put query string manipulation in Util class
const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);

// TODO: switch ACT's key by "" once embedding page sets it (Bug #10423).
function renderQueryInputWidget(containerId: string = "act-react-root", tripgoKey: string = "", tripPlannerUrl?: string) {
    let plannerUrl = tripPlannerUrl;
    if (!plannerUrl && queryMap) {
        plannerUrl = queryMap.plannerUrl;
    }
    if (plannerUrl && queryMap["beta-server"] !== undefined) {
        plannerUrl += (plannerUrl.includes("?") ? "&" : "?") + "beta-server=" + queryMap["beta-server"];
    }
    if (plannerUrl && queryMap["beta-key"] !== undefined) {
        plannerUrl += (plannerUrl.includes("?") ? "&" : "?") + "beta-key=" + queryMap["beta-key"];
    }
    TripGoApi.apiKey = tripgoKey;
    const containerElement = document.getElementById(containerId) as HTMLElement;
    containerElement.className = "app-style";
    ReactDOM.render(
        <QueryWidget plannerUrl={plannerUrl}/>, containerElement
    );
    DeviceUtil.initCss();
}

function renderTripPlanner(containerId: string = "act-react-root", tripgoKey: string = "") {
    let routingQuery: RoutingQuery | undefined;
    if (queryMap && queryMap.flat) {
        routingQuery = RoutingQuery.create(
            Location.create(LatLng.createLatLng(Number(queryMap.flat), Number(queryMap.flng)),
                queryMap.fname, queryMap.fid ? queryMap.fid : "", "", queryMap.fsrc),
            Location.create(LatLng.createLatLng(Number(queryMap.tlat), Number(queryMap.tlng)),
                queryMap.tname, queryMap.tid ? queryMap.tid : "", "", queryMap.tsrc),
            queryMap.type === "0" ? TimePreference.NOW : (queryMap.type === "1" ? TimePreference.LEAVE : TimePreference.ARRIVE),
            queryMap.type === "0" ? DateTimeUtil.getNow() : DateTimeUtil.momentTZTime(queryMap.time * 1000)
        )
    }
    TripGoApi.apiKey = tripgoKey;
    const containerElement = document.getElementById(containerId) as HTMLElement;
    containerElement.className = "app-style";
    const TripPlannerWithApi = withRoutingResults(TripPlanner);
    ReactDOM.render(<TripPlannerWithApi urlQuery={routingQuery}/>, containerElement);
    // ReactDOM.render(<TripPlanner urlQuery={routingQuery}/>, containerElement);
    DeviceUtil.initCss();
}

TripGoApi.isBetaServer = queryMap["beta-server"] !== "false";
// if (queryMap["beta-key"] !== "false") {
//     TripGoApi.apiKey = "032de02a53a155f901e6953bcdbf77ad";
// } else {
//     TripGoApi.apiKey = "790892d5eae024712cfd8616496d7317"
// }

// Render app based on 'app' query param when hitting deploy root
const elementId = "act-react-root";
if (document.getElementById(elementId)) {
    if (queryMap.app) {
        if (queryMap.app === "queryInput") {
            renderQueryInputWidget(elementId, 'd4d074e6d666eb24b27f93985834fe7a');
        } else { // queryMap.app === "tripPlanner"
            renderTripPlanner(elementId, 'd4d074e6d666eb24b27f93985834fe7a');
        }
    } else {    // render trip planner by default
        if (document.getElementById(elementId)) {
            renderTripPlanner(elementId, 'd4d074e6d666eb24b27f93985834fe7a');
        }
    }
}

// TODO: re-enable for production
// registerServiceWorker();
// TODO: to unregister service worker
unregister();

Util.global.renderQueryInputWidget = renderQueryInputWidget;
Util.global.renderTripPlanner = renderTripPlanner;