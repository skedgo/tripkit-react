import * as React from "react";
import withRoutingResults, {TripSort} from "../api/WithRoutingResults";
import RoutingQuery from "../model/RoutingQuery";
import Trip from "../model/trip/Trip";
import TripGroup from "../model/trip/TripGroup";
import Options from "../model/Options";
import Location from "../model/Location";
import Region from "../model/region/Region";
import LatLng from "../model/LatLng";

export interface IRoutingResultsContext {
    // TODO: Create a TKQueryProvider that encapsulates this part of the state (next five props), and that are passed to
    // TKRoutingResultsProvider as props (similar to OptionsView). So TKRoutingResultsProvider is a consumer of TKQueryProvider.
    // Just pass the query to TKRoutingResultsProvider, not the onQueryChange.
    query: RoutingQuery;
    onQueryChange: (query: RoutingQuery) => void;
    preFrom?: Location;
    preTo?: Location;
    onPreChange?: (from: boolean, location?: Location) => void;
    region?: Region;
    viewport?: {center?: LatLng, zoom?: number};    // Maybe define viewport as required.
    onViewportChange: (viewport: {center?: LatLng, zoom?: number}) => void;

    trips?: Trip[];
    waiting: boolean;
    selected?: Trip;
    onChange: (select?: Trip) => void;
    sort: TripSort;
    onSortChange: (sort: TripSort) => void;
    onReqRealtimeFor: (trip?: Trip) => void;
    onAlternativeChange: (group: TripGroup, alt: Trip) => void;
}

export const RoutingResultsContext = React.createContext<IRoutingResultsContext>({
    query: RoutingQuery.create(),
    onQueryChange: (query: RoutingQuery) => {},
    viewport: {center: LatLng.createLatLng(-33.8674899,151.2048442), zoom: 13},
    onViewportChange: (viewport: {center?: LatLng, zoom?: number}) => {},
    waiting: true,
    onChange: (select?: Trip) => {},
    sort: TripSort.OVERALL,
    onSortChange: (sort: TripSort) => {},
    onReqRealtimeFor: (trip?: Trip) => {},
    onAlternativeChange: (group: TripGroup, alt: Trip) => {}
});

class RoutingResultsProvider extends React.Component<{initQuery?: RoutingQuery, options: Options, testTrips?: Trip[]}, {}> {
    private ContextWithValue = withRoutingResults((props: IRoutingResultsContext) => {
        props = {...props,
            // trips: this.props.testTrips
        };
        return <RoutingResultsContext.Provider value={props}>{this.props.children}</RoutingResultsContext.Provider>;
    });

    public render(): React.ReactNode {
        return (
            <this.ContextWithValue urlQuery={this.props.initQuery} options={this.props.options}/>
        );
    }

}

export default RoutingResultsProvider;