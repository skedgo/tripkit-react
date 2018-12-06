import Trip from "../model/trip/Trip";
import RoutingQuery from "../model/RoutingQuery";

interface ITripPlannerProps {
    query: RoutingQuery;
    onQueryChange: (query: RoutingQuery) => void;
    trips: Trip[] | null;
    waiting: boolean;
}

export default ITripPlannerProps;
export {ITripPlannerProps};