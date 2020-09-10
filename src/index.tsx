import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
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
import {TKState as TKUIStateForExport} from "./config/TKStateConsumer";
import {TKUIReportBtnProps as TKUIReportBtnPropsForExport} from "./feedback/TKUIReportBtn";
import {TKUIResultsViewProps as TKUIResultsViewPropsForExport} from "./trip/TKUIResultsView";
export {default as TKUITripPlanner} from "./trip-planner/TKUITripPlanner";
export {default as TKStateProvider} from "./config/TKStateProvider";
export {default as TKStateController} from "./config/TKStateController";
export type TKUIConfig = TKUIConfigForExport;
export {default as TKShareHelper} from "./share/TKShareHelper";
export {default as TKUIRoutingQueryInput} from "./query/TKUIRoutingQueryInput";
export {default as TKUILocationSearch} from "./query/TKUILocationSearch";
export {default as TKUILocationBox} from "./location_box/TKUILocationBox";
export {default as RegionsData} from "./data/RegionsData";
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
export {default as TKGATracker} from "./analytics/GATracker";
export {default as TKPeliasGeocoder} from "./geocode/PeliasGeocoder";
export {default as TKUICard} from "./card/TKUICard";
export {TKError} from "./error/TKError";
export type TKUIResultsViewProps = TKUIResultsViewPropsForExport;
export {default as TKFeatures} from "./env/Features";
export {default as TKUIMapView} from "./map/TKUIMapView";
export {tKRequestCurrentLocation} from "./util/GeolocationUtil";

// This import won't happen on lib clients (except they put a div element called "tripgo-sample-root").
// if (document.getElementById("tripgo-sample-root")) {
//     import("./example/tripgo/tripgo-sample");
//     import("./example/chym/index");
//     import("./example/client-sample");
// }