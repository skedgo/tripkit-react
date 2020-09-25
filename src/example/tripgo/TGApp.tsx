import React, {MouseEvent, useState, useEffect} from 'react';
import {CSSProps, TKUIWithStyle} from "../../jss/StyleHelper";
import {
    TKUITripPlanner,
    TKRoot,
    TKUIConfig,
    LatLng,
    Environment,
    TKPeliasGeocoder, TKError, TKUIResultsViewProps,
    TKUIButton}
    from '../../index';
// from 'tripkit-react';
import {ReactComponent as IconReport} from './images/icon-usersnap.svg';
import Usersnap from "./usersnap/Usersnap";
import RequestSupportAction from "./feedback/RequestSupportAction";
import TKErrorHelper from "../../error/TKErrorHelper";
import {ERROR_ROUTING_NOT_SUPPORTED, ERROR_DESTINATION_OUTSIDE_COVERAGE} from "../../error/TKErrorHelper";
import TKStateConsumer from "../../config/TKStateConsumer";
import {TKState} from "../../config/TKState";
import {TKUITimetableViewProps} from "../../service/TKUITimetableView";
import {TKUIMapViewProps} from "../../map/TKUIMapView";
import TKStateUrl from "../../state/TKStateUrl";
import TKGeocodingOptions from "../../geocode/TKGeocodingOptions";
import TKUserProfile from "../../model/options/TKUserProfile";
import TKUISettingLink from "../../options/TKUISettingLink";
import {IOptionsContext, default as OptionsProvider, OptionsContext} from "../../options/OptionsProvider";
import {getApiKey, default as TGUIDevSettingsView, getServer} from "./options/TGUIDevSettingsView";
import TKUISettingSection from "../../options/TKUISettingSection";
import RegionsData from "../../data/RegionsData";
import OptionsData from "../../data/OptionsData";
import appleStoreLogo from "images/logo/apple-store-logo.png";
import playStoreLogo from "images/logo/play-store-logo.png";
import {loadTripState} from "./options/TGUILoadTripsView";
import {resetStyles} from "../../css/ResetStyle.css";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {

}

export interface IStyle {
    main: CSSProps<IProps>;
}

interface IProps {}

export type TGAppProps = IProps;
export type TGAppStyle = IStyle;

const TGApp: React.SFC<IProps> = (props: IProps) => {

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

    const hostname = window.location.hostname;
    const devSettings = hostname.includes("tripkit.") || hostname.includes("localhost");

    const [showDevSettings, setShowDevSettings] = useState<boolean>(false);
    const [showLoadTrips, setShowLoadTrips] = useState<boolean>(false);
    const devSettingsView = showDevSettings &&
        <TGUIDevSettingsView
            showLoadTrips={showLoadTrips}
            setShowLoadTrips={setShowLoadTrips}
            onRequestClose={() => {
                setShowDevSettings(false);
            }}
        />;

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
                // tileLayerProps: {
                //     attribution: "&copy <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
                //     // url: "http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg",
                //     url: props.theme.isLight ?
                //         "https://api.mapbox.com/styles/v1/mgomezlucero/cjvp9zm9114591cn8cictke9e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA" :
                //         "https://api.mapbox.com/styles/v1/mgomezlucero/ckbmm6m0w003e1hmy0ksjxflm/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA",
                // },
                mapboxGlLayerProps: {
                    accessToken: "pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA",
                    style: props.theme.isLight ?
                        "mapbox://styles/mgomezlucero/cjvp9zm9114591cn8cictke9e" :
                        "mapbox://styles/mgomezlucero/ckbmm6m0w003e1hmy0ksjxflm",
                    attribution: "&copy <a href='http://osm.org/copyright' tabindex='-1'>OpenStreetMap</a> contributors"
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
            props: devSettings ? {
                customSettings: (userProfile: TKUserProfile,
                                 onUserProfileChange: (value: TKUserProfile) => void,
                                 onRequestClose?: () => void) =>
                    <TKUISettingSection>
                        <TKUISettingLink text={"Beta Testing"} onClick={() => setShowDevSettings(true)}/>
                    </TKUISettingSection>

            } : undefined
        },
        TKUISidebar: {
            props: {
                nativeAppLinks: () => {
                    const storeBtnStyle = {
                        ...resetStyles.button,
                        height: '48px',
                        width: '144px',
                        cursor: 'pointer'
                    };
                    return (
                        <React.Fragment>
                            <button onClick={() => window.open( 'https://apps.apple.com/au/app/tripgo/id533630842', '_blank')}
                                    style={storeBtnStyle}
                                    aria-label="Download on the App Store"
                                    role="link"
                            >
                                <img src={appleStoreLogo} key={'appleStoreLogo'} style={{width: '100%', height: '100%'}}/>
                            </button>,
                            <button onClick={() => window.open('https://play.google.com/store/apps/details?id=com.buzzhives.android.tripplanner', '_blank')}
                                    style={storeBtnStyle}
                                    aria-label="Download on Google Play"
                                    role="link"
                            >
                                <img src={playStoreLogo} key={'playStoreLogo'} style={{width: '100%', height: '100%'}}/>
                            </button>
                        </React.Fragment>
                    )
                }
            }
        },
        onInitState: (tKState: TKState) => {
            RegionsData.instance.requireRegions().catch(error => {
                const userProfile = OptionsData.instance.get();
                if (error.message.includes("Invalid API key")) {
                    const invalidDevKey = userProfile.customData && userProfile.customData.apiKey;
                    if (invalidDevKey) {
                        if (window.confirm("Invalid API key: " + invalidDevKey + ". Will reset to production key and reload.")) {
                            delete userProfile.customData.apiKey;
                            OptionsData.instance.save(userProfile);
                            window.location.reload();
                        }
                    }
                } else {
                    const invalidServer = userProfile.customData && userProfile.customData.server;
                    if (invalidServer) {
                        if (window.confirm("There was a problem loading regions from server: " + invalidServer + ". Will reset to production and reload.")) {
                            delete userProfile.customData.server;
                            OptionsData.instance.save(userProfile);
                            window.location.reload();
                        }
                    }
                }
                throw error;
            });
            document.addEventListener("keydown", (zEvent) => {
                if (zEvent.shiftKey && zEvent.metaKey && zEvent.key === "v") {
                    navigator.clipboard.readText && navigator.clipboard.readText().then(t => {
                        loadTripState(t, tKState);
                        console.log("Compute trips for: " + t);
                    }).catch((e) => console.log(e));
                    zEvent.preventDefault();
                }
            });
        }
    };

    const userLocationPromise = (window as any).tKUserLocationPromise ?
        (window as any).tKUserLocationPromise
            .then((userCoords: [number, number]) => LatLng.createLatLng(userCoords[0], userCoords[1])) : undefined;

    useEffect(() => {
        const keyEventListener = (zEvent) => {
            if (zEvent.shiftKey && zEvent.metaKey && (zEvent.key === "d" || zEvent.key === "s")) {
                setShowDevSettings(true);
                zEvent.preventDefault();
            } else if (zEvent.shiftKey && zEvent.metaKey && (zEvent.key === "p" || zEvent.key === "t")) {
                setShowLoadTrips(true);
                setShowDevSettings(true);
                zEvent.preventDefault();
            }
        };
        document.addEventListener("keydown", keyEventListener);
        return () => {
            document.removeEventListener("keydown", keyEventListener);
        };
    });

    return (
        <OptionsProvider>
            <OptionsContext.Consumer>
                {(optionsContext: IOptionsContext) =>
                    <TKRoot config={{...config, apiKey: getApiKey(optionsContext.userProfile), server: getServer(optionsContext.userProfile)}}>
                        <TKUITripPlanner userLocationPromise={userLocationPromise}/>
                        <TKStateUrl/>
                        {devSettingsView}
                    </TKRoot>
                }
            </OptionsContext.Consumer>
        </OptionsProvider>
    );
};

export default TGApp;