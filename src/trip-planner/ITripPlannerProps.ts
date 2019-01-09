import Trip from "../model/trip/Trip";
import RoutingQuery from "../model/RoutingQuery";
import TripGroup from "../model/trip/TripGroup";

interface ITripPlannerProps {
    query: RoutingQuery;
    onQueryChange: (query: RoutingQuery) => void;
    trips: Trip[] | null;
    waiting: boolean;
    onReqRealtimeFor: (trip?: Trip) => void;
    onAlternativeChange: (group: TripGroup, alt: Trip) => void;
}

export default ITripPlannerProps;
export {ITripPlannerProps};