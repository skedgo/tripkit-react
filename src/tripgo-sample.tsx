import * as React from 'react';
import * as ReactDOM from 'react-dom';
import DeviceUtil from "./util/DeviceUtil";
import RoutingQuery, {TimePreference} from "./model/RoutingQuery";
import Location from "./model/Location";
import DateTimeUtil from "./util/DateTimeUtil";
import Util from "./util/Util";
import * as queryString from "query-string";
import TripGoApi from "./api/TripGoApi";
import {unregister} from "./registerServiceWorker";
import LatLng from "./model/LatLng";
import TripPlanner from "./trip-planner/TripPlanner";
import RoutingResultsProvider, {RoutingResultsContext} from "./trip-planner/RoutingResultsProvider";
import ITripPlannerProps from "./trip-planner/ITripPlannerProps";
import TripSelectionProvider, {ITripSelectionContext, TripSelectionContext} from "./trip-planner/TripSelectionProvider";
import Options from "./model/Options";

const searchStr = window.location.search;
// Put query string manipulation in Util class
const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);

export function renderTripPlanner(containerId: string = "tripgo-sample-root", tripgoKey: string = "") {
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
    import("./trip-planner/TripPlanner").then((module) => {
        ReactDOM.render(
            <RoutingResultsProvider initQuery={routingQuery} options={new Options()}> // TODO fix
                <TripSelectionProvider>
                    <RoutingResultsContext.Consumer>
                        {(routingResultsContext: ITripPlannerProps) => (
                            <TripSelectionContext.Consumer>
                                {(tripSelectionContext: ITripSelectionContext) =>
                                    <TripPlanner {...routingResultsContext} {...tripSelectionContext}/>}
                            </TripSelectionContext.Consumer>
                        )}
                    </RoutingResultsContext.Consumer>
                </TripSelectionProvider>
            </RoutingResultsProvider>,
            containerElement);
        // ReactDOM.render(<TripPlanner urlQuery={routingQuery}/>, containerElement);
    });
    DeviceUtil.initCss();
}

TripGoApi.isBetaServer = queryMap["beta-server"] !== "false";
// if (queryMap["beta-key"] !== "false") {
//     TripGoApi.apiKey = "032de02a53a155f901e6953bcdbf77ad";
// } else {
//     TripGoApi.apiKey = "790892d5eae024712cfd8616496d7317"
// }

// Render app based on 'app' query param when hitting deploy root
const elementId = "tripgo-sample-root";
if (document.getElementById(elementId)) {
    renderTripPlanner(elementId, '790892d5eae024712cfd8616496d7317');
}

// TODO: re-enable for production
// registerServiceWorker();
// TODO: to unregister service worker
unregister();

Util.global.renderTripPlanner = renderTripPlanner;