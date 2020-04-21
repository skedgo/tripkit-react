import * as React from "react";
import { TripSort } from "../api/WithRoutingResults";
import RoutingQuery from "../model/RoutingQuery";
import Trip from "../model/trip/Trip";
import TripGroup from "../model/trip/TripGroup";
import Location from "../model/Location";
import Region from "../model/region/Region";
import LatLng from "../model/LatLng";
import TKUserProfile from "../model/options/TKUserProfile";
import RegionInfo from "../model/region/RegionInfo";
import ServiceDeparture from "../model/service/ServiceDeparture";
import Segment from "../model/trip/Segment";
export interface IRoutingResultsContext {
    query: RoutingQuery;
    onQueryChange: (query: RoutingQuery) => void;
    onQueryUpdate: (update: Partial<RoutingQuery>) => void;
    preFrom?: Location;
    preTo?: Location;
    onPreChange?: (from: boolean, location?: Location) => void;
    inputTextFrom: string;
    inputTextTo: string;
    onInputTextChange?: (from: boolean, text: string) => void;
    region?: Region;
    regionInfo?: RegionInfo;
    viewport?: {
        center?: LatLng;
        zoom?: number;
    };
    onViewportChange: (viewport: {
        center?: LatLng;
        zoom?: number;
    }) => void;
    directionsView: boolean;
    onDirectionsView: (directionsView: boolean) => void;
    trips?: Trip[];
    waiting: boolean;
    waitingTripUpdate: boolean;
    tripUpdateError?: Error;
    selected?: Trip;
    onChange: (select?: Trip) => void;
    sort: TripSort;
    onSortChange: (sort: TripSort) => void;
    onReqRealtimeFor: (trip?: Trip) => void;
    onAlternativeChange: (group: TripGroup, alt: Trip) => void;
    onSegmentServiceChange: (segment: Segment, service: ServiceDeparture, callback?: () => void) => void;
}
export declare const RoutingResultsContext: React.Context<IRoutingResultsContext>;
declare class RoutingResultsProvider extends React.Component<{
    initViewport?: {
        center?: LatLng;
        zoom?: number;
    };
    options: TKUserProfile;
    testTrips?: Trip[];
    locale?: string;
}, {}> {
    private ContextWithValue;
    render(): React.ReactNode;
}
export default RoutingResultsProvider;
