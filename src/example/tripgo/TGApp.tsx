import React from 'react';
import { CSSProps, TKUIWithStyle } from "../../jss/StyleHelper";
import { ReactComponent as IconReport } from './images/icon-usersnap.svg';
import Usersnap from "./usersnap/Usersnap";
import TKStateConsumer from "../../config/TKStateConsumer";
import { TKState } from "../../config/TKState";
import { TKUITimetableViewProps } from "../../service/TKUITimetableView";
import { TKUIMapViewProps } from "../../map/TKUIMapView";
import TKStateUrl from "../../state/TKStateUrl";
import TKGeocodingOptions from "../../geocode/TKGeocodingOptions";
import { ReactComponent as TripgoLogo } from './images/logo-tripgo.svg';
import { ReactComponent as TripgoLogoDark } from './images/logo-tripgo-dark.svg';
import Environment from "../../env/Environment";
import { default as TKPeliasGeocoder } from "../../geocode/PeliasGeocoder";
import { TKError } from "../../error/TKError";
import { TKUIConfig } from "../../config/TKUIConfig";
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

interface IProps { }

const TGApp: React.FunctionComponent<IProps> = (props: IProps) => {

    const analyticsConfig = Environment.isProd() ? {
        google: {
            tracker: {
                trackingId: "UA-31384649-1",
                debug: true
            }
        }
    } : undefined;

    const geocodeEarth = new TKPeliasGeocoder({
        server: "https://api.geocode.earth/v1",
        apiKey: "ge-63f76914953caba8",
        resultsLimit: 5
    });

    const hostname = window.location.hostname;
    const config: TKUIConfig = {
        apiKey: '424353266689764a5f15b5dc7e619aa1',
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
                renderIcon: () => <IconReport />,
                onClick: (state: TKState) => {
                    Usersnap.setFeedbackData(state);
                    Usersnap.openReportWindow();
                }
            }
        },
        TKUIMapView: {
            props: (props: TKUIMapViewProps) => {
                const { trip, tripSegment } = props;
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
        TKUITripPlanner: {
            props: (props) => ({
                renderTopRight: props.landscape ?
                    (props.theme.isDark ? () => <TripgoLogoDark /> : () => <TripgoLogo />) : undefined
            })
        },
        TKUISidebar: {
            props: {
                renderLogo: () => <TripgoLogo />,
                appStoreUrl: "https://apps.apple.com/au/app/tripgo/id533630842",
                playStoreUrl: "https://play.google.com/store/apps/details?id=com.buzzhives.android.tripplanner"
            }
        }
    };

    let userLocationPromise = (window as any).tKUserLocationPromise ?
        (window as any).tKUserLocationPromise
            .then((userCoords: [number, number]) => LatLng.createLatLng(userCoords[0], userCoords[1])) : undefined;

    if (window.location.pathname === '/world') {
        window.history.replaceState(null, '', '/');
        userLocationPromise = Promise.reject();
    }

    return (
        <TKRoot config={config}>
            <TKUITripPlanner userLocationPromise={userLocationPromise} />
            <TKStateUrl />
        </TKRoot>
    );
};

export default TGApp;