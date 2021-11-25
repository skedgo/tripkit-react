import React, {useState, useEffect} from 'react';
import {CSSProps, TKUIWithStyle} from "../../jss/StyleHelper";
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
import TKUISettingLink from "../../options/TKUISettingLink";
import {IOptionsContext, default as OptionsProvider, OptionsContext} from "../../options/OptionsProvider";
import {getApiKey, default as TGUIDevSettingsView, getServer, isTfGMReferrer} from "./options/TGUIDevSettingsView";
import TKUISettingSection from "../../options/TKUISettingSection";
import RegionsData from "../../data/RegionsData";
import OptionsData from "../../data/OptionsData";
import {loadTripState} from "./options/TGUILoadTripsView";
import {ReactComponent as TripgoLogo} from './images/logo-tripgo.svg';
import {ReactComponent as TripgoLogoDark} from './images/logo-tripgo-dark.svg';
import Environment from "../../env/Environment";
import {default as TKPeliasGeocoder} from "../../geocode/PeliasGeocoder";
import {TKUIRoutingResultsViewProps} from "../../trip/TKUIRoutingResultsView";
import {TKError} from "../../error/TKError";
import {TKUIConfig} from "../../config/TKUIConfig";
import TKUIButton from "../../buttons/TKUIButton";
import LatLng from "../../model/LatLng";
import TKRoot from "../../config/TKRoot";
import TKUITripPlanner from "../../trip-planner/TKUITripPlanner";
// import {
//     TKUITripPlanner,
//     TKRoot,
//     TKUIConfig,
//     LatLng,
//     Environment,
//     TKPeliasGeocoder, TKError, TKUIRoutingResultsViewProps,
//     TKUIButton}
//     from '../../index';
// from 'tripkit-react';

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
}

export interface IStyle {
    main: CSSProps<IProps>;
}

interface IProps {}

const TGApp: React.SFC<IProps> = (props: IProps) => {

    const analyticsConfig = Environment.isProd() ? {
        google: {
            tracker: {
                trackingId: "UA-31384649-1",
                debug: true
            }
        }
    } : undefined;

    const geocodeEarth = new TKPeliasGeocoder("https://api.geocode.earth/v1", "ge-63f76914953caba8", isTfGMReferrer());
    geocodeEarth.getOptions().resultsLimit = 5;

    const hostname = window.location.hostname;
    const devSettings = hostname.includes("tripkit.") || hostname.includes("beta.") || hostname.includes("localhost");

    const [showDevSettings, setShowDevSettings] = useState<boolean>(false);
    const [showLoadTrips, setShowLoadTrips] = useState<boolean>(false);
    const devSettingsView = showDevSettings &&
        <TGUIDevSettingsView
            showLoadTrips={showLoadTrips}
            setShowLoadTrips={setShowLoadTrips}
            onRequestClose={() => setShowDevSettings(false)}
        />;
    const config: TKUIConfig = {
        apiKey: '790892d5eae024712cfd8616496d7317',
        theme: {
            fontFamily: 'ProximaNova, sans-serif'
        },
        // isDarkDefault: true,
        // analytics: analyticsConfig,
        i18n: (window as any).tKI18nPromise,
        geocoding: (defaultOptions: TKGeocodingOptions) => ({
            geocoders: {
                ...defaultOptions.geocoders,
                'geocodeEarth': geocodeEarth
            },
            ...isTfGMReferrer() && {restrictToCoverageBounds: true}
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
            props: (props: TKUIMapViewProps) => {
                const {trip, tripSegment} = props;
                const mapTiles = tripSegment ? tripSegment.mapTiles : trip?.mainSegment?.mapTiles;
                return (mapTiles ?
                    {
                        tileLayerProps: {
                            attribution: mapTiles.sources
                                .map(source => `<a href=${source.provider.website} tabindex='-1'>${source.provider.name}</a>`)
                                .join(" | "),
                            url: mapTiles.urlTemplates[0],
                            // url: "https://b.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
                            // url: "http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg",
                            // url: props.theme.isLight ?
                            //     "https://api.mapbox.com/styles/v1/mgomezlucero/cjvp9zm9114591cn8cictke9e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA" :
                            //     "https://api.mapbox.com/styles/v1/mgomezlucero/ckbmm6m0w003e1hmy0ksjxflm/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA",
                        }
                    } :
                    {
                        mapboxGlLayerProps: {
                            accessToken: "pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA",
                            style: props.theme.isLight ?
                                "mapbox://styles/mgomezlucero/ckjliu0460xxh1aqgzzb2bb34" :
                                "mapbox://styles/mgomezlucero/ckbmm6m0w003e1hmy0ksjxflm",
                            attribution: "<a href='http://osm.org/copyright' tabindex='-1'>OpenStreetMap</a>"
                        }
                    }
                );
            }
        },
        TKUIRoutingResultsView: {
            props: (props: TKUIRoutingResultsViewProps) => ({
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
                customSettings: () =>
                    <TKUISettingSection>
                        <TKUISettingLink text={"Beta Testing"} onClick={() => setShowDevSettings(true)}/>
                    </TKUISettingSection>

            } : undefined
        },
        TKUITripPlanner: {
            props: (props) => ({
                renderTopRight: props.landscape ?
                    (props.theme.isDark ? () => <TripgoLogoDark/> : () => <TripgoLogo/>) : undefined
            })
        },
        TKUISidebar: {
            props: {
                renderLogo: () => <TripgoLogo/>,
                appStoreUrl: "https://apps.apple.com/au/app/tripgo/id533630842",
                playStoreUrl: "https://play.google.com/store/apps/details?id=com.buzzhives.android.tripplanner"
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
            document.addEventListener("keydown", (zEvent: any) => {
                if (zEvent.shiftKey && zEvent.metaKey && zEvent.key === "v") {
                    navigator.clipboard && navigator.clipboard.readText && navigator.clipboard.readText().then(t => {
                        loadTripState(t, tKState);
                    }).catch((e) => console.log(e));
                    zEvent.preventDefault();
                }
            });
        }
    };

    let userLocationPromise = (window as any).tKUserLocationPromise ?
        (window as any).tKUserLocationPromise
            .then((userCoords: [number, number]) => LatLng.createLatLng(userCoords[0], userCoords[1])) : undefined;

    if (window.location.pathname === '/world') {
        window.history.replaceState(null, '', '/');
        userLocationPromise = Promise.reject();
    }

    useEffect(() => {
        const keyEventListener = (zEvent: any) => {
            if (zEvent.shiftKey && zEvent.metaKey && (zEvent.key === "d" || zEvent.key === "s")) {
                setShowDevSettings(true);
                zEvent.preventDefault();
            } else if (zEvent.shiftKey && zEvent.metaKey && (zEvent.key === "p" || zEvent.key === "t" || zEvent.key === "l")) {
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

    // Obs: OptionsProvider used here and inside TKRoot keep their values at sync due to OptionsProvider subscribing to
    // OptionsData changes (See OptionsProvider:36). Try to avoid this so can remove that subscription.
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