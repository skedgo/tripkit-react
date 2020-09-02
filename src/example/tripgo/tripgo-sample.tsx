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
import {TKUIMapViewProps} from "../../map/TKUIMapView";


const analyticsConfig = Environment.isProd() ? {
    google: {
        tracker: {
            trackingId: "UA-31384649-1",
            debug: true
        }
    }
} : undefined;

const geocodeEarth = new TKPeliasGeocoder("https://api.geocode.earth/v1", "ge-63f76914953caba8");
geocodeEarth.getOptions().resultsLimit = 5;

const config: TKUIConfig = {
    apiKey: '790892d5eae024712cfd8616496d7317',
    theme: {
        fontFamily: 'ProximaNova, sans-serif'
    },
    // isDarkDefault: true,
    analytics: analyticsConfig,
    i18n: (window as any).tKI18nPromise,
    geocoding: (defaultOptions: TKGeocodingOptions) => ({
        geocoders: {
            ...defaultOptions.geocoders,
            'geocodeEarth': geocodeEarth
        }
    }),
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
            renderIcon: () => <IconReport/>,
            onClick: (state: TKState) => {
                Usersnap.setFeedbackData(state);
                Usersnap.openReportWindow();
            }
        }
    },
    TKUIMapView: {
        props: (props: TKUIMapViewProps) => ({
            tileLayerProps: {
                attribution: "&copy <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
                // url: "http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg",
                url: props.theme.isLight ?
                    "https://api.mapbox.com/styles/v1/mgomezlucero/cjvp9zm9114591cn8cictke9e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA":
                    "https://api.mapbox.com/styles/v1/mgomezlucero/ckbmm6m0w003e1hmy0ksjxflm/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA"
            }
        })
    },
    TKUIRoutingResultsView: {
        props: (props: TKUIResultsViewProps) => ({
            errorActions: (error: TKError, defaultActions: JSX.Element[]) => {
                let errorActions = defaultActions;
                const query = props.query;
                if (TKErrorHelper.hasErrorCode(error, ERROR_ROUTING_NOT_SUPPORTED) ||
                    TKErrorHelper.hasErrorCode(error, ERROR_DESTINATION_OUTSIDE_COVERAGE)) {
                    errorActions = [
                        <RequestSupportAction
                            actionTitle={props.t("Request.support")}
                            formTitle={"Request route"}
                            formMessage={"Please support routing between " + query.from!.address + " and " + query.to!.address + "\n\n" +
                            "From coordinate: " + query.from!.lat + ", " + query.from!.lng + "\n" +
                            "To coordinate: " + query.to!.lat + ", " + query.to!.lng}
                            key={"Request.support"}
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
    },
    TKUIProfileView: {
        props: {
            customSettings: (userProfile: TKUserProfile,
                             onUserProfileChange: (value: TKUserProfile) => void) =>
                <TGUIDevSettings value={userProfile} onChange={onUserProfileChange}/>
        }
    }
};

const userLocationPromise = (window as any).tKUserLocationPromise ?
    (window as any).tKUserLocationPromise
        .then((userCoords: [number, number]) => LatLng.createLatLng(userCoords[0], userCoords[1])) : undefined;

ReactDOM.render(
    <OptionsProvider>
        <OptionsContext.Consumer>
            {(optionsContext: IOptionsContext) =>
                <TKRoot config={{...config, apiKey: getApiKey(optionsContext.userProfile)}}>
                    <TKUITripPlanner userLocationPromise={userLocationPromise}/>
                    <TKStateUrl/>
                </TKRoot>
            }
        </OptionsContext.Consumer>
    </OptionsProvider>, document.getElementById("tripgo-sample-root"));