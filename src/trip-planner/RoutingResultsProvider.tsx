import * as React from "react";
import withRoutingResults, {IWithRoutingResultsProps} from "../api/WithRoutingResults";
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
import {TKUIMapViewClass} from "../map/TKUIMapView";
import {TripSort} from "../model/trip/TripSort";

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
    getRegionInfoP: () => (Promise<RegionInfo> | undefined);
    viewport?: {center?: LatLng, zoom?: number};    // Maybe define viewport as required.
    setViewport: (center: LatLng, zoom: number) => void;
    /**
     * To be called by map so the global state keeps track of the current viewport, and sets regions accordingly.
     * Also optionally the map can behave as controlled by viewport prop (above).
     */
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
    refreshSelectedTrip: () => Promise<boolean>;
    onAlternativeChange: (group: TripGroup, alt: Trip) => void;
    onSegmentServiceChange: (segment: Segment, service: ServiceDeparture, callback?: (segmentReplacement: Segment) => void) => void;

    // This is general, not routing specific.
    waitingStateLoad: boolean;
    stateLoadError?: Error;
    onWaitingStateLoad: (waiting: boolean, error?: Error) => void;
    map?: TKUIMapViewClass;
    setMap: (ref: TKUIMapViewClass) => void;
    mapAsync: Promise<TKUIMapViewClass>;
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
    refreshSelectedTrip: () => Promise.resolve(false),
    onAlternativeChange: (group: TripGroup, alt: Trip) => {},
    onSegmentServiceChange: (segment: Segment, service: ServiceDeparture, callback?: (segmentReplacement: Segment) => void) => {},
    inputTextFrom: "",
    inputTextTo:  "",
    getRegionInfoP: () => undefined,
    onInputTextChange: (from: boolean, text: string) => {},
    waitingStateLoad: false,
    onWaitingStateLoad: (waiting: boolean, error?: Error) => {},
    setMap: (ref: TKUIMapViewClass) => {},
    mapAsync: new Promise<TKUIMapViewClass>(() => {}),
    setViewport: (center: LatLng, zoom: number) => {}
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