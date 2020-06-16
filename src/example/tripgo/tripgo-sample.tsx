import React, {MouseEvent} from 'react';
import ReactDOM from 'react-dom';
import {
    TKUITripPlanner,
    TKRoot,
    TKUIConfig,
    TKShareHelper,
    TKUIReportBtnProps,
    LatLng,
    Environment,
    TKPeliasGeocoder, TKError, TKUIResultsViewProps,
    TKUIButtonType, TKUIButton,
}
    from '../../index';
    // from 'tripkit-react';
import {ReactComponent as IconReport} from './images/icon-usersnap.svg';
import Usersnap from "./usersnap/Usersnap";
import RequestSupportAction from "./feedback/RequestSupportAction";
import TKErrorHelper from "../../error/TKErrorHelper";
import {ERROR_ROUTING_NOT_SUPPORTED, ERROR_DESTINATION_OUTSIDE_COVERAGE} from "../../error/TKErrorHelper";
import TKStateConsumer, {TKState} from "../../config/TKStateConsumer";
import {TKUITimetableViewProps} from "../../service/TKUITimetableView";


const analyticsConfig = Environment.isProd() ? {
    google: {
        tracker: {
            trackingId: "UA-31384649-1",
            debug: true
        }
    }
} : undefined;

const peliasGeocoder = new TKPeliasGeocoder("https://api.geocode.earth/v1", "ge-63f76914953caba8");
peliasGeocoder.getOptions().resultsLimit = 5;

const config: TKUIConfig = {
    apiKey: '790892d5eae024712cfd8616496d7317',
    theme: {
        fontFamily: 'ProximaNova, sans-serif'
    },
    analytics: analyticsConfig,
    userLocationPromise: (window as any).tKUserLocationPromise ?
        (window as any).tKUserLocationPromise
            .then((userCoords: [number, number]) => LatLng.createLatLng(userCoords[0], userCoords[1])) : undefined,
    i18nPromise: (window as any).tKI18nPromise,
    geocoding: {
        customGeocoders: [peliasGeocoder]
    },
    TKUIReportBtn: {
        // Good example of element replacement.
        // render: (props: TKUIReportBtnProps) =>
        //     <IconReport
        //         className={classNames(props.className, props.classes.main)}
        //         onClick={() => {
        //             Usersnap.setFeedbackData(props.tKState);
        //             Usersnap.openReportWindow();
        //         }}
        //     />,
        // Other alternative, preserve all features on TKUIReportBtn
        // (viz. copy to clipboard on right click).
        props: {
            renderIcon: () => <IconReport style={{height: '100%', width: '100%'}}/>,
            onClick: (state: TKState) => {
                Usersnap.setFeedbackData(state);
                Usersnap.openReportWindow();
            }
        }
    },
    TKUIMapView: {
        props: {
            tileLayerProps: {
                attribution: "&copy <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
                // url: "http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg",
                url: "https://api.mapbox.com/styles/v1/mgomezlucero/cjvp9zm9114591cn8cictke9e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA"
            }
        }
    },
    TKUIRoutingResultsView: {
        props: (props: TKUIResultsViewProps) => ({
            errorActions: (error: TKError) => {
                let errorActions = props.errorActions(error);
                const query = props.query;
                if (TKErrorHelper.hasErrorCode(error, ERROR_ROUTING_NOT_SUPPORTED) ||
                    TKErrorHelper.hasErrorCode(error, ERROR_DESTINATION_OUTSIDE_COVERAGE)) {
                    errorActions = [
                        <RequestSupportAction
                            key={"Request.support"}
                            actionTitle={props.t("Request.support")}
                            formTitle={"Request route"}
                            formMessage={"Please support routing between " + query.from!.address + " and " + query.to!.address + "\n\n" +
                            "From coordinate: " + query.from!.lat + ", " + query.from!.lng + "\n" +
                            "To coordinate: " + query.to!.lat + ", " + query.to!.lng}
                        />
                    ].concat(errorActions);
                } else {
                    errorActions = [
                        <TKStateConsumer>
                            {(state: TKState) =>
                                <TKUIButton
                                    text={props.t("Report.Problem")}
                                    onClick={() => {
                                        Usersnap.setFeedbackData(state);
                                        Usersnap.openReportWindow();
                                    }}
                                />
                            }
                        </TKStateConsumer>
                    ].concat(errorActions);
                }
                return errorActions;
            }
        })
    },
    TKUITimetableView: {
        props: (props: TKUITimetableViewProps) => ({
            errorActions: (error: TKError) => ([
                <TKStateConsumer key={"Report.Problem"}>
                    {(state: TKState) =>
                        <TKUIButton
                            text={props.t("Report.Problem")}
                            onClick={() => {
                                Usersnap.setFeedbackData(state);
                                Usersnap.openReportWindow();
                            }}
                        />
                    }
                </TKStateConsumer>
            ].concat(props.errorActions ? props.errorActions(error) : []))
        })
    }
};

ReactDOM.render(
    <TKRoot config={config}>
        <TKUITripPlanner/>
    </TKRoot>, document.getElementById("tripgo-sample-root"));