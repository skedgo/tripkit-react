import Trip from "../model/trip/Trip";
import RoutingQuery from "../model/RoutingQuery";
import TripGroup from "../model/trip/TripGroup";
import {TKUITripPlannerConfig} from "./TripPlanner";

interface ITripPlannerProps {
    query: RoutingQuery;
    onQueryChange: (query: RoutingQuery) => void;
    trips?: Trip[];
    waiting: boolean;
    onReqRealtimeFor: (trip?: Trip) => void;
    onAlternativeChange: (group: TripGroup, alt: Trip) => void;
    config: TKUITripPlannerConfig;
}

export default ITripPlannerProps;
export {ITripPlannerProps};