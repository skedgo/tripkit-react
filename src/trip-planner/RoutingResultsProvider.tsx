import * as React from "react";
import withRoutingResults, {TripSort} from "../api/WithRoutingResults";
import RoutingQuery from "../model/RoutingQuery";
import Trip from "../model/trip/Trip";
import TripGroup from "../model/trip/TripGroup";
import Location from "../model/Location";
import Region from "../model/region/Region";
import LatLng from "../model/LatLng";
import TKUserProfile from "../model/options/TKUserProfile";
import MapUtil from "../util/MapUtil";
import RegionInfo from "../model/region/RegionInfo";

export interface IRoutingResultsContext {
    query: RoutingQuery;
    onQueryChange: (query: RoutingQuery) => void;
    onQueryUpdate: (update: Partial<RoutingQuery>) => void;
    preFrom?: Location;
    preTo?: Location;
    onPreChange?: (from: boolean, location?: Location) => void;
    region?: Region;
    regionInfo?: RegionInfo;
    viewport?: {center?: LatLng, zoom?: number};    // Maybe define viewport as required.
    onViewportChange: (viewport: {center?: LatLng, zoom?: number}) => void;
    directionsView: boolean;
    onDirectionsView: (directionsView: boolean) => void;

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
    onQueryUpdate: (update: Partial<RoutingQuery>) => {},
    viewport: {center: MapUtil.worldCoords, zoom: 2},
    onViewportChange: (viewport: {center?: LatLng, zoom?: number}) => {},
    directionsView: false,
    onDirectionsView: (directionsView: boolean) => {},
    waiting: true,
    onChange: (select?: Trip) => {},
    sort: TripSort.OVERALL,
    onSortChange: (sort: TripSort) => {},
    onReqRealtimeFor: (trip?: Trip) => {},
    onAlternativeChange: (group: TripGroup, alt: Trip) => {}
});

class RoutingResultsProvider extends React.Component<{
    initViewport?: {center?: LatLng, zoom?: number},
    options: TKUserProfile,
    testTrips?: Trip[],
    locale?: string}, {}> {
    private ContextWithValue = withRoutingResults((props: IRoutingResultsContext) => {
        props = {...props};
        return <RoutingResultsContext.Provider value={props}>{this.props.children}</RoutingResultsContext.Provider>;
    });

    public render(): React.ReactNode {
        return (
            <this.ContextWithValue initViewport={this.props.initViewport}
                                   options={this.props.options}
                                   locale={this.props.locale}
            />
        );
    }

}

export default RoutingResultsProvider;