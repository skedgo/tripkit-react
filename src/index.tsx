import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './css/global.css';
import './css/device.css';
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
    renderTripPlanner(elementId, 'd4d074e6d666eb24b27f93985834fe7a');
}

// TODO: re-enable for production
// registerServiceWorker();
// TODO: to unregister service worker
unregister();

Util.global.renderTripPlanner = renderTripPlanner;

export {default as RegionsData} from "./data/RegionsData";
export {default as TripGoApi} from "./api/TripGoApi";
export {default as QueryInput} from "./query/QueryInput";
export {default as DeviceUtil} from "./util/DeviceUtil";
export {default as Util} from "./util/Util";
export {default as Constants} from "./util/Constants";
export {default as DateTimeUtil} from "./util/DateTimeUtil";
export {default as WaiAriaUtil} from "./util/WaiAriaUtil";
export {default as MapUtil} from "./util/MapUtil";
export {default as TransportUtil} from "./trip/TransportUtil";
export {default as LatLng} from "./model/LatLng";
export {default as BBox} from "./model/BBox";
export {default as Location} from "./model/Location";
export {default as StopLocation} from "./model/StopLocation";
export {default as RoutingQuery, TimePreference} from "./model/RoutingQuery";
export {default as withRoutingResults} from "./api/WithRoutingResults";
export {default as MboxMap, default as LeafletMap} from "./map/MboxMap";
export {default as FavouriteList} from "./favourite/FavouriteList";
export {default as FavouriteBtn} from "./favourite/FavouriteBtn";
export {default as FavouriteTrip} from "./model/FavouriteTrip";
export {default as TripsView} from "./trip/TripsView";
export {default as TripRow, TripRowProps} from "./trip/TripRow";
export {SegmentDescriptionProps} from "./trip/SegmentDescription";
export {default as TripDetail} from "./trip/TripDetail";
export {default as TripRowTime} from "./trip/TripRowTime";
export {default as TripRowTrack} from "./trip/TripRowTrack";
export {default as TripAltBtn} from "./trip/TripAltBtn";
export {default as Segment} from "./model/trip/Segment";
export {default as Trip} from "./model/trip/Trip";
export {default as TripGroup} from "./model/trip/TripGroup";
export {default as OptionsView} from "./options/OptionsView";
export {default as Options} from "./model/Options";
export {default as OptionsData} from "./data/OptionsData";
export {default as FavouritesData} from "./data/FavouritesData";
export {default as Region} from "./model/region/Region";
export {default as GATracker} from "./analytics/GATracker";
export {default as PlannedTripsTracker} from "./analytics/PlannedTripsTracker";
export {default as ITripPlannerProps} from "./trip-planner/ITripPlannerProps";
export {TrackTransportProps} from "./trip/TrackTransport";
import iconFeedback from "./images/ic-feedback.svg";
export {iconFeedback};
export {default as StopsData} from "./data/StopsData";
export {default as NetworkUtil} from "./util/NetworkUtil";
export {default as SegmentDetail, SegmentDetailProps} from "./trip/TripSegmentDetail";
