import * as React from 'react';
import * as ReactDOM from 'react-dom';
import DeviceUtil from "../util/DeviceUtil";
import RoutingQuery, {TimePreference} from "../model/RoutingQuery";
import Location from "../model/Location";
import DateTimeUtil from "../util/DateTimeUtil";
import Util from "../util/Util";
import * as queryString from "query-string";
import TripGoApi from "../api/TripGoApi";
import {unregister} from "../registerServiceWorker";
import LatLng from "../model/LatLng";
import TripPlanner, {TKUITripPlannerConfig} from "../trip-planner/TripPlanner";
import RoutingResultsProvider, {
    IRoutingResultsContext,
    RoutingResultsContext
} from "../trip-planner/RoutingResultsProvider";
// import ITripRowProps from "../trip/ITripRowProps";
import {default as SegmentDescription, SegmentDescriptionProps} from "../trip/SegmentDescription";
import Segment from "../model/trip/Segment";
import OptionsProvider, {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import ServiceResultsProvider, {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import {SegmentDetailProps, default as TripSegmentDetail} from "../trip/TripSegmentDetail";

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

    const config = new TKUITripPlannerConfig();
    // config.resultsViewConfig.renderTrip = <P extends ITripRowProps>(props: P) => {
    //     return (
    //         <div className={props.className}
    //              onClick={props.onClick}
    //              onFocus={props.onFocus}
    //              onKeyDown={props.onKeyDown}
    //         >
    //             {props.value.segments[0].getAction()}
    //         </div>
    //     )
    // };
    config.tripDetailConfig.renderSegmentDetail = <P extends SegmentDetailProps & {key: number}>(props: P) => {
        return (
            <TripSegmentDetail {...props}
                           renderDescr={<Q extends SegmentDescriptionProps>(props1: Q) =>
                               <SegmentDescription {...props1}/>}
                           renderIcon={(iconProps: {value: Segment}) =>
                               <div style={{color: "red"}}>
                                   {iconProps.value.modeIdentifier}
                               </div>}
                           renderTitle={(iconProps: {value: Segment}) =>
                               <div style={{color: "blue"}}>
                                   {iconProps.value.getAction()}
                               </div>}
            />
        )
    };

    import("../trip-planner/TripPlanner").then((module) => {
        ReactDOM.render(
            <OptionsProvider>
                <OptionsContext.Consumer>
                    {(optionsContext: IOptionsContext) => (
                        <RoutingResultsProvider initQuery={routingQuery} options={optionsContext.value}>
                            <ServiceResultsProvider>
                                <RoutingResultsContext.Consumer>
                                    {(routingResultsContext: IRoutingResultsContext) =>
                                        <ServiceResultsContext.Consumer>
                                            {(serviceContext: IServiceResultsContext) =>
                                                <TripPlanner {...routingResultsContext}
                                                             {...serviceContext}
                                                             config={config}
                                                />}
                                        </ServiceResultsContext.Consumer>
                                    }
                                </RoutingResultsContext.Consumer>
                            </ServiceResultsProvider>
                        </RoutingResultsProvider>
                    )}
                </OptionsContext.Consumer>
            </OptionsProvider>,
            containerElement);
    });
    DeviceUtil.initCss();
}

TripGoApi.isBetaServer = queryMap["beta-server"] !== "false";

// Render app based on 'app' query param when hitting deploy root
const elementId = "tripgo-sample-root";
if (document.getElementById(elementId)) {
    renderTripPlanner(elementId, '790892d5eae024712cfd8616496d7317');
}

unregister();

Util.global.renderTripPlanner = renderTripPlanner;