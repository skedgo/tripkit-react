import * as React from "react";
import withRoutingResults, {IWithRoutingResultsProps, TripSort} from "../api/WithRoutingResults";
import RoutingQuery from "../model/RoutingQuery";
import Trip from "../model/trip/Trip";
import TripGroup from "../model/trip/TripGroup";
import Location from "../model/Location";
import Region from "../model/region/Region";
import LatLng from "../model/LatLng";
import MapUtil from "../util/MapUtil";
import RegionInfo from "../model/region/RegionInfo";
import ServiceDeparture from "../model/service/ServiceDeparture";
import Segment from "../model/trip/Segment";
import {TKError} from "../error/TKError";

// TODO: Documentation -> follow scheme of ServiceResultsProvider and TKUITimetableView
export interface IRoutingResultsContext {
    /** @ctype */
    query: RoutingQuery;
    /** @ctype */
    onQueryChange: (query: RoutingQuery) => void;
    onQueryUpdate: (update: Partial<RoutingQuery>) => void;
    onTripJsonUrl: (tripJsonUrl: string) => Promise<Trip[] | undefined>;
    preFrom?: Location;
    preTo?: Location;
    onPreChange?: (from: boolean, location?: Location) => void;
    inputTextFrom: string,
    inputTextTo: string,
    onInputTextChange?: (from: boolean, text: string) => void,
    region?: Region;
    regionInfo?: RegionInfo;
    viewport?: {center?: LatLng, zoom?: number};    // Maybe define viewport as required.
    onViewportChange: (viewport: {center?: LatLng, zoom?: number}) => void;
    directionsView: boolean;
    onDirectionsView: (directionsView: boolean) => void;

    trips?: Trip[];
    waiting: boolean;
    routingError?: TKError;
    waitingTripUpdate: boolean;
    tripUpdateError?: TKError;
    selectedTrip?: Trip;
    onChange: (select?: Trip) => void;
    selectedTripSegment?: Segment;
    setSelectedTripSegment: (segment?: Segment) => void;
    tripDetailsView: boolean;
    onTripDetailsView: (tripDetailsView: boolean) => void;
    sort: TripSort;
    onSortChange: (sort: TripSort) => void;
    onReqRealtimeFor: (trip?: Trip) => void;
    onAlternativeChange: (group: TripGroup, alt: Trip) => void;
    onSegmentServiceChange: (segment: Segment, service: ServiceDeparture, callback?: () => void) => void;

    // This is general, not routing specific.
    waitingStateLoad: boolean;
    stateLoadError?: Error;
    onWaitingStateLoad: (waiting: boolean, error?: Error) => void;
}

export const RoutingResultsContext = React.createContext<IRoutingResultsContext>({
    query: RoutingQuery.create(),
    onQueryChange: (query: RoutingQuery) => {},
    onQueryUpdate: (update: Partial<RoutingQuery>) => {},
    onTripJsonUrl: (tripJsonUrl: string) => Promise.resolve(undefined),
    viewport: {center: MapUtil.worldCoords, zoom: 2},
    onViewportChange: (viewport: {center?: LatLng, zoom?: number}) => {},
    directionsView: false,
    onDirectionsView: (directionsView: boolean) => {},
    waiting: true,
    waitingTripUpdate: false,
    onChange: (select?: Trip) => {},
    setSelectedTripSegment: (segment?: Segment) => {},
    tripDetailsView: false,
    onTripDetailsView: (tripDetailsView: boolean) => {},
    sort: TripSort.OVERALL,
    onSortChange: (sort: TripSort) => {},
    onReqRealtimeFor: (trip?: Trip) => {},
    onAlternativeChange: (group: TripGroup, alt: Trip) => {},
    onSegmentServiceChange: (segment: Segment, service: ServiceDeparture, callback?: () => void) => {},
    inputTextFrom: "",
    inputTextTo:  "",
    onInputTextChange: (from: boolean, text: string) => {},
    waitingStateLoad: false,
    onWaitingStateLoad: (waiting: boolean, error?: Error) => {}
});

class RoutingResultsProvider extends React.Component<IWithRoutingResultsProps, {}> {
    private ContextWithValue = withRoutingResults((props: IRoutingResultsContext) => {
        props = {...props};
        return <RoutingResultsContext.Provider value={props}>{this.props.children}</RoutingResultsContext.Provider>;
    });

    public render(): React.ReactNode {
        return (
            <this.ContextWithValue {...this.props}/>
        );
    }

}

export default RoutingResultsProvider;