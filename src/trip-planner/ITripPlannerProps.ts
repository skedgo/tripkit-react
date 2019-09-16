import Trip from "../model/trip/Trip";
import RoutingQuery from "../model/RoutingQuery";
import TripGroup from "../model/trip/TripGroup";
import {TKUITripPlannerConfig} from "./TripPlanner";
import LatLng from "../model/LatLng";

interface ITripPlannerProps {
    query: RoutingQuery;
    onQueryChange: (query: RoutingQuery) => void;
    onViewportChange: (viewport: {center?: LatLng, zoom?: number}) => void;
    trips?: Trip[];
    selected?: Trip;
    onChange: (select?: Trip) => void;
    waiting: boolean;
    onReqRealtimeFor: (trip?: Trip) => void;
    onAlternativeChange: (group: TripGroup, alt: Trip) => void;
    config: TKUITripPlannerConfig;
}

export default ITripPlannerProps;