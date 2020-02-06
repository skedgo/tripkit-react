import './css/global.css';
import {TKUIConfig as TKUIConfigForExport} from "./config/TKUIConfig";
import {IRoutingResultsContext as IRoutingResultsContextForExport} from "./trip-planner/RoutingResultsProvider";
import {TKUIState as TKUIStateForExport} from "./config/TKUI";
export {default as TKUITripPlanner} from "./trip-planner/TKUITripPlanner";
export {default as TKUIProvider} from "./config/TKUIProvider";
export type TKUIConfig = TKUIConfigForExport;
export {default as TKShareHelper} from "./share/TKShareHelper";
export {default as TKUIRoutingQueryInput} from "./query/TKUIRoutingQueryInput";
export {default as RegionsData} from "./data/RegionsData";
export {default as TKUIProfileView} from "./options/TKUIProfileView";
export {default as TKUITooltip} from "./card/TKUITooltip";
export {default as TKUITransportOptionsView} from "./options/TKUITransportOptionsView";
export {default as TKUIButton} from "./buttons/TKUIButton";
export {TKUIButtonType} from "./buttons/TKUIButton";
export {default as genStylesJSS} from "./css/GenStyle.css";
export {default as genStyles} from "./css/general.module.css";
export {default as LatLng} from "./model/LatLng";
export {default as RoutingQuery} from "./model/RoutingQuery";
export {default as TKUserProfile} from "./model/options/TKUserProfile";
export {RoutingResultsContext} from "./trip-planner/RoutingResultsProvider";
export type IRoutingResultsContext = IRoutingResultsContextForExport;
export {default as TKUI} from "./config/TKUI";
export type TKUIState = TKUIStateForExport;


// This import won't happen on lib clients (except they put a div element called "tripgo-sample-root").
if (document.getElementById("tripgo-sample-root")) {
    import("./example/tripgo-sample");
    // import("./example/client-chym-web/client-chym-web");
}