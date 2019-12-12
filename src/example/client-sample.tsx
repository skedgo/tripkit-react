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
import Segment from "../model/trip/Segment";
import {default as TKUIButton, TKUIButtonType} from "../buttons/TKUIButton";
import {ReactComponent as IconLike} from "../images/badges/ic-badge-like.svg";
import {TKUITripOverviewViewProps, TKUITripOverviewViewStyle} from "../trip/TKUITripOverviewView";
import {TKUIWithClasses} from "../jss/StyleHelper";
import {Subtract} from 'utility-types';

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


    const config: TKUIConfig = {
        // theme: {
        //     colorPrimary: 'rgba(2, 66, 172)',
        //     colorPrimaryOpacity: (opacity: number) => 'rgba(2, 66, 172, ' + opacity + ')'
        // },
        // TKUIRoutingResultsView: {
        //     styles: (theme: TKUITheme) => ({
        //         main: (defaultStyle) => ({
        //             ...defaultStyle,
        //             background: '#f4f7fe'
        //         }),
        //         row: {
        //             margin: '15px',
        //             '&:hover': {
        //                 backgroundColor: 'lightgray'
        //             }
        //         }
        //     })
        // },
        // TKUITripRow: {
        //     render: (props: TKUITripRowProps) =>
        //         <div className={props.className}
        //              onClick={props.onClick}
        //              onFocus={props.onFocus}
        //              onKeyDown={props.onKeyDown}
        //              onDoubleClick={props.onDetailClick}
        //         >
        //             {props.value.segments.map((segment: Segment, i: number) => segment.getAction() + " ")}
        //         </div>
        // },
        // TKUITripOverviewView: {
        //     props: (props: TKUITripOverviewViewProps) => ({
        //         actions: (trip: Trip) =>
        //             props.actions!(trip).concat([
        //                 <TKUIButton
        //                     text={"Like"}
        //                     icon={<IconLike/>}
        //                     type={TKUIButtonType.PRIMARY_VERTICAL}
        //                     style={{minWidth: '90px'}}
        //                 />
        //             ])
        //     })
        // }
    };

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