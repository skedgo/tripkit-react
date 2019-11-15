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
import {ThemeProvider, JssProvider, createGenerateClassName, StyleCreator, Styles, CSSProperties} from 'react-jss'
import {TKUITheme} from "../jss/TKUITheme";
import TKUITripPlanner from "../trip-planner/TKUITripPlanner";
import {TKUIConfig} from "../config/TKUIConfig";
import {TKUITripRowProps} from "../trip/TKUITripRow";
import TKUIProvider from "../config/TKUIProvider";
import Trip from "../model/trip/Trip";

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

    // const tkUICardDefStyle = tKUICardDefaultStyle as StyleCreator<keyof ITKUICardStyle, TKUITheme, ITKUICardProps>;
    // TKUICardConfig.instance.styles = (theme: TKUITheme) => ({
    //     main: {
    //         color: theme.colorPrimary
    //     },
    //     header: {
    //         ...tkUICardDefStyle(theme).header,
    //         backgroundColor: 'lightgreen'
    //     }
    // });
    // TKUICardConfig.instance.styles = emptyValues(tKUICardDefaultStyle);

    // TKUIResultsViewConfig.instance.renderTrip = <P extends ITripRowProps>(props: P) => {
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
    // TKUIResultsViewConfig.instance.styles = Util.iAssign(tKUIResultsDefaultStyle,
    //     {
    //         main: {
    //             ...tKUIResultsDefaultStyle.main,
    //             backgroundColor: 'lightblue'
    //         },
    //     });
    // TKUITripDetailConfig.instance.renderSegmentDetail = <P extends SegmentDetailProps & {key: number}>(props: P) => {
    //     return (
    //         <TripSegmentDetail {...props}
    //                        renderDescr={<Q extends SegmentDescriptionProps>(props1: Q) =>
    //                            <SegmentDescription {...props1}/>}
    //                        renderIcon={(iconProps: {value: Segment}) =>
    //                            <div style={{color: "orange"}}>
    //                                {iconProps.value.modeIdentifier}
    //                            </div>}
    //                        renderTitle={(iconProps: {value: Segment}) =>
    //                            <div style={{color: "blue"}}>
    //                                {iconProps.value.getAction()}
    //                            </div>}
    //         />
    //     )
    // };


    const config: TKUIConfig = {
        theme: {
            colorPrimary: 'brown'
        },
        TKUITripRow: {
            // render: (props: TKUITripRowProps) =>
            //     <div className={props.className}
            //          onClick={props.onClick}
            //          onFocus={props.onFocus}
            //          onKeyDown={props.onKeyDown}
            //     >
            //         {props.value.segments[0].getAction()}
            //     </div>,
            styles: (theme: TKUITheme) => {
                return ({
                    main: (defaultStyle: CSSProperties<TKUITripRowProps>) => ({
                        ...defaultStyle,
                        background: 'red'
                    }),
                    badge: (defaultStyle: CSSProperties<TKUITripRowProps>) => ({
                        ...defaultStyle,
                        color: 'yellow',
                        '& svg': {
                            width: '24px',
                            height: '24px',
                            marginRight: '10px',
                        }
                    }),
                    info: {
                        color: 'blue',
                    }
                })}
        },
        TKUITripOverviewView: {
            styles: (theme: TKUITheme) => ({
                main: {

                }
            }),
            // configProps: {
            //     actions: (trip: Trip) => [
            //         {
            //             render: () => <div>Action</div>,
            //             handler: () => {return false}
            //         }
            //     ]
            // },
            configProps: (defaultProps) => ({
                actions: (trip: Trip) =>
                    defaultProps.actions!(trip).concat(
                        [
                            {
                                render: () => <div>Action</div>,
                                handler: () => {return false}
                            }
                        ])
            })
        }
    };

    const testTripsJson = require("../test/tripsWithRTVehicle.json");
    // const testTrips = Util.deserialize(testTripsJson, RoutingResults).groups;
    const testTrips = undefined;

    ReactDOM.render(
        <TKUIProvider config={config} initQuery={routingQuery}>
            <TKUITripPlanner/>
        </TKUIProvider>,
        containerElement);
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