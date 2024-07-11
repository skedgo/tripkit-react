import * as React from "react";
import withRoutingResults, { IWithRoutingResultsProps } from "../api/WithRoutingResults";
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
import { TKError } from "../error/TKError";
import { TKUIMapViewClass } from "../map/TKUIMapView";
import { TripSort } from "../model/trip/TripSort";
import ModeLocation from "../model/location/ModeLocation";
import RoutingResults from "../model/trip/RoutingResults";
import { MultiPolygon } from "geojson";
import { TKAccountContext } from "../account/TKAccountContext";

// TODO: Documentation -> follow scheme of ServiceResultsProvider and TKUITimetableView
export interface IRoutingResultsContext {
    /** @ctype */
    query: RoutingQuery;
    /** @ctype */
    onQueryChange: (query: RoutingQuery) => void;
    onQueryUpdate: (update: Partial<RoutingQuery>) => void;
    onTripJsonUrl: (tripJsonUrl: string | RoutingResults) => Promise<Trip[] | undefined>;
    preFrom?: Location;
    preTo?: Location;
    onPreChange?: (from: boolean, location?: Location) => void;
    inputTextFrom: string,
    inputTextTo: string,
    onInputTextChange?: (from: boolean, text: string) => void,
    region?: Region;
    coverageGeoJson?: MultiPolygon;
    getRegionInfoP: () => (Promise<RegionInfo> | undefined);
    viewport?: { center?: LatLng, zoom?: number };    // Maybe define viewport as required.
    setViewport: (center: LatLng, zoom: number) => void;
    /**
     * To be called by map so the global state keeps track of the current viewport, and sets regions accordingly.
     * Also optionally the map can behave as controlled by viewport prop (above).
     */
    onViewportChange: (viewport: { center?: LatLng, zoom?: number }) => void;
    /**
     * States if the environment is in _directions mode_, which implies that it automatically compute trips for
     * current query whenever from and to become specified (and refresh trips when from or to change).
     * @ctype
     * @default false
     */
    computeTripsForQuery: boolean;
    onComputeTripsForQuery: (computeTripsForQuery: boolean) => void;

    trips?: Trip[];
    waiting: boolean;
    routingError?: TKError;
    waitingTripUpdate: boolean;
    tripUpdateError?: TKError;
    selectedTrip?: Trip;
    onSelectedTripChange: (select?: Trip) => void;
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
    onSegmentCollectChange: (segment: Segment, location: ModeLocation) => Promise<Trip | undefined>;
    onSegmentCollectBookingChange: (segment: Segment, location: ModeLocation, data: { bookingStart?: string, bookingEnd?: string, vehicleId?: string }) => Promise<Trip | undefined>;

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
    onQueryChange: (query: RoutingQuery) => { },
    onQueryUpdate: (update: Partial<RoutingQuery>) => { },
    onTripJsonUrl: (tripJsonUrl: string | RoutingResults) => Promise.resolve(undefined),
    viewport: { center: MapUtil.worldCoords, zoom: 2 },
    onViewportChange: (viewport: { center?: LatLng, zoom?: number }) => { },
    computeTripsForQuery: false,
    onComputeTripsForQuery: (computeTripsForQuery: boolean) => { },
    waiting: true,
    waitingTripUpdate: false,
    onSelectedTripChange: (select?: Trip) => { },
    setSelectedTripSegment: (segment?: Segment) => { },
    tripDetailsView: false,
    onTripDetailsView: (tripDetailsView: boolean) => { },
    sort: TripSort.OVERALL,
    onSortChange: (sort: TripSort) => { },
    onReqRealtimeFor: (trip?: Trip) => { },
    refreshSelectedTrip: () => Promise.resolve(false),
    onAlternativeChange: (group: TripGroup, alt: Trip) => { },
    onSegmentServiceChange: (segment: Segment, service: ServiceDeparture, callback?: (segmentReplacement: Segment) => void) => { },
    onSegmentCollectChange: (segment: Segment, location: ModeLocation) => Promise.resolve(undefined),
    onSegmentCollectBookingChange: (segment: Segment, location: ModeLocation, data: { bookingStart?: string, bookingEnd?: string, vehicleId?: string }) => Promise.resolve(undefined),
    inputTextFrom: "",
    inputTextTo: "",
    getRegionInfoP: () => undefined,
    onInputTextChange: (from: boolean, text: string) => { },
    waitingStateLoad: false,
    onWaitingStateLoad: (waiting: boolean, error?: Error) => { },
    setMap: (ref: TKUIMapViewClass) => { },
    mapAsync: new Promise<TKUIMapViewClass>(() => { }),
    setViewport: (center: LatLng, zoom: number) => { }
});

const ContextWithValue = withRoutingResults((props: IRoutingResultsContext & { children: React.ReactNode }) => {
    const { children, ...contextProps } = props;
    return <RoutingResultsContext.Provider value={contextProps}>{children}</RoutingResultsContext.Provider>;
});

const RoutingResultsProvider: React.FunctionComponent<IWithRoutingResultsProps> = (props) => {
    const { finishInitLoadingPromise } = React.useContext(TKAccountContext)
    return (
        <ContextWithValue {...props} finishInitLoadingPromise={finishInitLoadingPromise} />
    );
}

export default RoutingResultsProvider;