// These two imports mean ~50kb in the bundle size.
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
// This polyfill means extra ~50kb in the bundle size (see https://github.com/formatjs/date-time-format-timezone#browserified-file-size).
// import 'date-time-format-timezone/build/browserified/date-time-format-timezone-golden-zones-no-locale-min';
// This polyfill means extra ~320kb in the bundle size (see https://github.com/formatjs/date-time-format-timezone#browserified-file-size).
import 'date-time-format-timezone';
// This import is to avoid the following runtime error:
// Uncaught TypeError: Reflect.metadata is not a function
// However this error still happens when including module declaration on package.json, so remove it for now.
// Also tried importing it from TKStateProvider, in case the reason is that when client uses tripkit-react in esm
// format it optimizes compilation and doesn't include an import on index.tsx, but it doesn't work.
// Maybe try including it on polyfills.ts (see https://stackoverflow.com/a/53791071)
// TODO: Fix this to distribute library as esm.
import "reflect-metadata";
import {TKUIConfig as TKUIConfigForExport} from "./config/TKUIConfig";
import {TKUITheme as TKUIThemeForExport} from "./jss/TKUITheme";
import {IRoutingResultsContext as IRoutingResultsContextForExport} from "./trip-planner/RoutingResultsProvider";
import {TKState as TKUIStateForExport} from "./config/TKState";
import {TKUIReportBtnProps as TKUIReportBtnPropsForExport} from "./feedback/TKUIReportBtn";
import {TKUIRoutingResultsViewProps as TKUIRoutingResultsViewPropsForExport} from "./trip/TKUIRoutingResultsView";
import {TKUIMapViewProps as TKUIMapViewPropsForExport} from "./map/TKUIMapView"
import {TKUIWithStyle as TKUIWithStyleForExport, TKUIWithClasses as TKUIWithClassesForExport} from "./jss/StyleHelper";
import {default as TKGeocodingOptionsForExport} from "./geocode/TKGeocodingOptions";
import {TKUISlideUpPosition} from "./card/TKUISlideUp";
import {SelectOption} from "./buttons/TKUISelect";
export {default as TKUITripPlanner} from "./trip-planner/TKUITripPlanner";
export {default as TKStateProvider} from "./config/TKStateProvider";
export {default as TKStateConsumer} from "./config/TKStateConsumer";
export {default as TKStateController} from "./config/TKStateController";
export type TKUIConfig = TKUIConfigForExport;
export {default as TKShareHelper} from "./share/TKShareHelper";
export {default as TKUIQueryLocationBox} from "./query/TKUIQueryLocationBox";
export {default as TKUIRoutingQueryInput} from "./query/TKUIRoutingQueryInput";
export {default as TKUILocationSearch} from "./query/TKUILocationSearch";
export {default as TKUILocationBox} from "./location_box/TKUILocationBox";
export {default as RegionsData} from "./data/RegionsData";
export {default as TKRegionsData} from "./data/RegionsData";
export {default as TKRegionResults} from "./model/region/RegionResults";
export {default as TKSegment} from "./model/trip/Segment";
export {default as TKUIProfileView} from "./options/TKUIProfileView";
export {default as TKUITooltip} from "./card/TKUITooltip";
export {default as TKUITransportSwitchesView} from "./options/TKUITransportSwitchesView";
export {default as TKUIButton} from "./buttons/TKUIButton";
export {TKUIButtonType} from "./buttons/TKUIButton";
export {default as genStylesJSS} from "./css/GenStyle.css";
export {genClassNames} from "./css/GenStyle.css";
export {default as LatLng} from "./model/LatLng";
export {default as TKLocation} from "./model/Location";
export {default as Region} from "./model/region/Region";
export {default as RoutingQuery} from "./model/RoutingQuery";
export {default as TKUserProfile} from "./model/options/TKUserProfile";
export {RoutingResultsContext} from "./trip-planner/RoutingResultsProvider";
export type IRoutingResultsContext = IRoutingResultsContextForExport;
export {default as TKRoot} from "./config/TKRoot";
export type TKState = TKUIStateForExport;
export {default as TKUtil} from "./util/Util";
export {default as TKUIResponsiveUtil} from "./util/TKUIResponsiveUtil";
export type TKUIReportBtnProps = TKUIReportBtnPropsForExport;
export type TKUITheme = TKUIThemeForExport;
export {default as DeviceUtil} from "./util/DeviceUtil";
export {default as TKUIConstants} from "./util/Constants";
export {tKUIColors} from "./jss/TKUITheme";
export {feedbackTextFromState} from "./feedback/TKUIReportBtn";
export {default as Environment} from "./env/Environment";
export {Env} from "./env/Environment";
export {default as TKGATracker} from "./analytics/GATracker";
export {default as TKPeliasGeocoder} from "./geocode/PeliasGeocoder";
export {default as TKUICard, CardPresentation} from "./card/TKUICard";
export {TKUISlideUpPosition} from "./card/TKUISlideUp";
export {TKError} from "./error/TKError";
export type TKUIRoutingResultsViewProps = TKUIRoutingResultsViewPropsForExport;
export {default as TKFeatures} from "./env/Features";
export {default as TKUIMapView} from "./map/TKUIMapView";
export type TKUIMapViewProps = TKUIMapViewPropsForExport;
export {tKRequestCurrentLocation} from "./util/GeolocationUtil";
export {default as TKStateUrl} from "./state/TKStateUrl";
export type TKGeocodingOptions = TKGeocodingOptionsForExport;
export {resetStyles} from "./css/ResetStyle.css"
export {default as TripGoApi} from "./api/TripGoApi";
export {default as LocalStorageItem} from "./data/LocalStorageItem";
export {default as TKUISettingSection} from "./options/TKUISettingSection";
export {default as TKUISettingLink} from "./options/TKUISettingLink";
export type TKUIWithStyle<ST, CP> = TKUIWithStyleForExport<ST, CP>;
export {OptionsContext} from "./options/OptionsProvider"
export {connect} from "./config/TKConfigHelper";
export {withStyles, overrideClass, mergeStyleOverrides} from "./jss/StyleHelper";
export type TKUIWithClasses<STYLE, PROPS> = TKUIWithClassesForExport<STYLE, PROPS>;
export {default as genStyles} from "./css/GenStyle.css";
export {colorWithOpacity, white, black} from "./jss/TKUITheme";
export {TKUIViewportUtil} from "./util/TKUIResponsiveUtil";
export {default as TKNetworkUtil} from "./util/NetworkUtil";
export {default as TKUIRow} from "./options/TKUIRow";
export {default as TKAccountProvider} from "./account/TKAccountProvider";
export {default as TKUIAccountBtn} from "./account/TKUIAccountBtn";
export {default as TKUISignInFromSettings} from "./account/TKUISignInFromSettings";
export {default as TKUIUserAccountSetting} from "./account/TKUIUserAccountSetting";
export {default as TKDefaultGeocoderNames} from "./geocode/TKDefaultGeocoderNames";
export {TKStyleOverride} from "./config/TKConfigHelper";
export {default as WaiAriaUtil} from "./util/WaiAriaUtil";
export {components as reactSelectComponents} from "react-select";
export {default as TKUISelect} from "./buttons/TKUISelect";
export {default as TKUIProfileSelect} from "./buttons/TKUIProfileSelect";
export type TKSelectOption = SelectOption;
// This import won't happen on lib clients (except they put a div element called "tripgo-sample-root").
// if (document.getElementById("tripgo-sample-root")) {
    /* eslint-disable import/first */
    // import("./example/tripgo/tripgo-sample");
//     import("./example/chym/index");
//     import("./example/client-sample");
// }
import 'react-confirm-alert/src/react-confirm-alert.css';
