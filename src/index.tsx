import './css/global.css';
import iconFeedback from "./images/ic-feedback.svg";
export {default as RegionsData} from "./data/RegionsData";
export {default as TripGoApi} from "./api/TripGoApi";
export {default as TKUIRoutingQueryInput} from "./query/TKUIRoutingQueryInput";
export {default as DeviceUtil} from "./util/DeviceUtil";
export {default as Util} from "./util/Util";
export {default as Constants} from "./util/Constants";
export {default as DateTimeUtil} from "./util/DateTimeUtil";
export {default as WaiAriaUtil} from "./util/WaiAriaUtil";
export {default as MapUtil} from "./util/MapUtil";
export {default as TransportUtil} from "./trip/TransportUtil";
export {default as LatLng} from "./model/LatLng";
export {default as BBox} from "./model/BBox";
export {default as Location} from "./model/Location";
export {default as StopLocation} from "./model/StopLocation";
export {default as ServiceStopLocation} from "./model/ServiceStopLocation";
export {default as RoutingQuery, TimePreference} from "./model/RoutingQuery";
export {default as withRoutingResults} from "./api/WithRoutingResults";
export {default as LeafletMap} from "./map/LeafletMap";
// export {IProps as FavouriteRowProps} from "./favourite/FavouriteRow";
// Next is a possible workaround for prev export not working. See if it's necessary,
// or if it's enough with the export on FavouriteRow.tsx.
export {default as FavouriteBtn} from "./favourite/FavouriteBtn";
export {default as FavouriteTrip} from "./model/favourite/FavouriteTrip";
export {default as TKUIResultsView} from "./trip/TKUIResultsView";
// export {default as TKUITripRow} from "./trip/TKUITripRow";
// export {default as ITripRowProps, TRIP_ALT_PICKED_EVENT} from "./trip/ITripRowProps";
// export {SegmentDescriptionProps} from "./trip/SegmentDescription";
// export {default as TripDetail} from "./trip/TripDetail";
// export {TKUITripTime as TripRowTime} from "./trip/TripRowTime";
export {default as TripRowTrack} from "./trip/TripRowTrack";
export {default as TripAltBtn} from "./trip/TripAltBtn";
export {default as Segment} from "./model/trip/Segment";
export {default as Trip} from "./model/trip/Trip";
export {default as TripGroup} from "./model/trip/TripGroup";
export {default as ServiceShape} from "./model/trip/ServiceShape";
export {default as Street} from "./model/trip/Street";
// export {TKUIProfileView as OptionsView} from "./options/OptionsView";
export {default as Options} from "./model/Options";
export {default as OptionsData} from "./data/OptionsData";
export {default as FavouritesData} from "./data/FavouritesData";
export {default as Region} from "./model/region/Region";
export {default as GATracker} from "./analytics/GATracker";
export {default as PlannedTripsTracker} from "./analytics/PlannedTripsTracker";
// export {default as ITripPlannerProps} from "./trip-planner/ITripPlannerProps";
// export {TrackTransportProps} from "./trip/TrackTransport";
export {iconFeedback};
export {default as StopsData} from "./data/StopsData";
export {default as NetworkUtil} from "./util/NetworkUtil";
export {default as LocationUtil} from "./util/LocationUtil";
// export {default as SegmentDetail, SegmentDetailProps} from "./trip/TripSegmentDetail";
// export {default as IGeocoder} from "./geocode/IGeocoder";
export {default as MultiGeocoder} from "./geocode/MultiGeocoder";
export {default as MultiGeocoderOptions} from "./geocode/MultiGeocoderOptions";
export {default as PeliasGeocoder} from "./geocode/PeliasGeocoder";
export {default as SkedgoGeocoder} from "./geocode/SkedgoGeocoder";
export {default as StaticGeocoder} from "./geocode/StaticGeocoder";
export {Marker} from "react-leaflet";
// Export the following so tripkit-react client can import them from tripkit-react instead of react-leaflet
// to avoid transitive dependency issue.
// export {TileLayer, AttributionControl, PolylineProps} from "react-leaflet";
export {default as Control} from "react-leaflet-control";
// export {IProps as SegmentPinIconProps} from "./map/TransportPinIcon";
// export {IProps as SegmentPopupProps} from "./map/SegmentPopup";
// export {IProps as ServiceStopPopupProps} from "./map/ServiceStopPopup";
// export {IServiceStopProps as ServiceStopProps} from "./map/ShapesPolyline";
export {default as Environment} from "./env/Environment";
export {default as Features} from "./env/Features";
export {default as ModeIdentifier} from "./model/region/ModeIdentifier";
export {default as ModeInfo} from "./model/trip/ModeInfo";


// TODO: This is temporary until we separate the sample (tripgo-sample.tsx) from the tripkit-react library.
if (document.getElementById("tripgo-sample-root")) {
    // import("./tripgo-sample");
    import("./example/client-sample");
}