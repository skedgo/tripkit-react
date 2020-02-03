import './css/global.css';
import {TKUIConfig as TKUIConfigForExport} from "./config/TKUIConfig";
export {default as TKUITripPlanner} from "./trip-planner/TKUITripPlanner";
export {default as TKUIProvider} from "./config/TKUIProvider";
export type TKUIConfig = TKUIConfigForExport;
export {default as TKShareHelper} from "./share/TKShareHelper";

// This import won't happen on lib clients (except they put a div element called "tripgo-sample-root").
if (document.getElementById("tripgo-sample-root")) {
    import("./example/tripgo-sample");
}