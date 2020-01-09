// import './css/global.css';
// import iconFeedback from "./images/ic-feedback.svg";
export {default as TKUITripPlanner} from "./trip-planner/TKUITripPlanner";
export {default as TKUIProvider} from "./config/TKUIProvider";
export {default as TripGoApi} from "./api/TripGoApi";

// TODO: This is temporary until we separate the sample (tripgo-sample.tsx) from the tripkit-react library.
if (document.getElementById("tripgo-sample-root")) {
    // import("./tripgo-sample");
    import("./example/client-sample");
}