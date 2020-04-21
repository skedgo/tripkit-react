import React from "react";
import TripGroup from "../model/trip/TripGroup";
import Trip from "../model/trip/Trip";
import { IRoutingResultsContext as RResultsConsumerProps } from "../trip-planner/RoutingResultsProvider";
import RoutingQuery from "../model/RoutingQuery";
import Location from "../model/Location";
import Region from "../model/region/Region";
import LatLng from "../model/LatLng";
import TKUserProfile from "../model/options/TKUserProfile";
import RegionInfo from "../model/region/RegionInfo";
import ServiceDeparture from "../model/service/ServiceDeparture";
import Segment from "../model/trip/Segment";
interface IWithRoutingResultsProps {
    initViewport?: {
        center?: LatLng;
        zoom?: number;
    };
    options: TKUserProfile;
    computeModeSets?: (query: RoutingQuery, options: TKUserProfile) => string[][];
    locale?: string;
}
interface IWithRoutingResultsState {
    query: RoutingQuery;
    preFrom?: Location;
    preTo?: Location;
    inputTextFrom: string;
    inputTextTo: string;
    viewport?: {
        center?: LatLng;
        zoom?: number;
    };
    region?: Region;
    regionInfo?: RegionInfo;
    directionsView: boolean;
    trips?: Trip[];
    selected?: Trip;
    sort: TripSort;
    waiting: boolean;
    waitingTripUpdate: boolean;
    tripUpdateError?: Error;
}
export declare enum TripSort {
    OVERALL = "Preferred",
    TIME = "Arrival",
    DURATION = "Duration",
    PRICE = "Price",
    CARBON = "Greener"
}
declare function withRoutingResults<P extends RResultsConsumerProps>(Consumer: any): {
    new (props: Pick<P, import("utility-types").SetDifference<keyof P, "region" | "waiting" | "onSegmentServiceChange" | "selected" | "query" | "onChange" | "onQueryChange" | "onQueryUpdate" | "preFrom" | "preTo" | "onPreChange" | "inputTextFrom" | "inputTextTo" | "onInputTextChange" | "regionInfo" | "viewport" | "onViewportChange" | "directionsView" | "onDirectionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort" | "onSortChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps): {
        realtimeInterval: any;
        sortTrips(trips: Trip[], sort: TripSort): Trip[];
        onQueryChange(query: RoutingQuery): void;
        onQueryUpdate(update: Partial<RoutingQuery>): void;
        onChange(select?: Trip | undefined): void;
        onSortChange(sort: TripSort): void;
        onViewportChange(viewport: {
            center?: LatLng | undefined;
            zoom?: number | undefined;
        }): void;
        onDirectionsView(directionsView: boolean): void;
        refreshRegion(): void;
        refreshRegionInfo(): void;
        refreshTrips(): void;
        checkWaiting(waitingState: any): void;
        alreadyAnEquivalent(newTrip: Trip, trips: Trip[]): boolean;
        equivalentTrips(tripA: Trip, tripB: Trip): boolean;
        onReqRealtimeFor(selected?: Trip | undefined): void;
        onAlternativeChange(group: TripGroup, alt: Trip): void;
        onSegmentServiceChange(segment: Segment, service: ServiceDeparture, callback: () => void): void;
        render(): React.ReactNode;
        componentDidMount(): void;
        componentDidUpdate(prevProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "region" | "waiting" | "onSegmentServiceChange" | "selected" | "query" | "onChange" | "onQueryChange" | "onQueryUpdate" | "preFrom" | "preTo" | "onPreChange" | "inputTextFrom" | "inputTextTo" | "onInputTextChange" | "regionInfo" | "viewport" | "onViewportChange" | "directionsView" | "onDirectionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort" | "onSortChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps>, prevState: Readonly<IWithRoutingResultsState>): void;
        sameApiQueries(q1: RoutingQuery, opts1: TKUserProfile, q2: RoutingQuery, opts2: TKUserProfile): boolean;
        getQueryUrlsWaitRegions(query: RoutingQuery): Promise<string[]>;
        computeModeSets(query: RoutingQuery, options: TKUserProfile): string[][];
        computeTrips(query: RoutingQuery): Promise<Promise<Trip[]>[]>;
        getQueryRegion(query: RoutingQuery): Region | undefined;
        getRoutingResultsJSONTest(): any;
        context: any;
        setState<K extends "region" | "waiting" | "selected" | "query" | "preFrom" | "preTo" | "inputTextFrom" | "inputTextTo" | "regionInfo" | "viewport" | "directionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort">(state: IWithRoutingResultsState | ((prevState: Readonly<IWithRoutingResultsState>, props: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "region" | "waiting" | "onSegmentServiceChange" | "selected" | "query" | "onChange" | "onQueryChange" | "onQueryUpdate" | "preFrom" | "preTo" | "onPreChange" | "inputTextFrom" | "inputTextTo" | "onInputTextChange" | "regionInfo" | "viewport" | "onViewportChange" | "directionsView" | "onDirectionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort" | "onSortChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps>) => IWithRoutingResultsState | Pick<IWithRoutingResultsState, K> | null) | Pick<IWithRoutingResultsState, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "region" | "waiting" | "onSegmentServiceChange" | "selected" | "query" | "onChange" | "onQueryChange" | "onQueryUpdate" | "preFrom" | "preTo" | "onPreChange" | "inputTextFrom" | "inputTextTo" | "onInputTextChange" | "regionInfo" | "viewport" | "onViewportChange" | "directionsView" | "onDirectionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort" | "onSortChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<IWithRoutingResultsState>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        shouldComponentUpdate?(nextProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "region" | "waiting" | "onSegmentServiceChange" | "selected" | "query" | "onChange" | "onQueryChange" | "onQueryUpdate" | "preFrom" | "preTo" | "onPreChange" | "inputTextFrom" | "inputTextTo" | "onInputTextChange" | "regionInfo" | "viewport" | "onViewportChange" | "directionsView" | "onDirectionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort" | "onSortChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps>, nextState: Readonly<IWithRoutingResultsState>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "region" | "waiting" | "onSegmentServiceChange" | "selected" | "query" | "onChange" | "onQueryChange" | "onQueryUpdate" | "preFrom" | "preTo" | "onPreChange" | "inputTextFrom" | "inputTextTo" | "onInputTextChange" | "regionInfo" | "viewport" | "onViewportChange" | "directionsView" | "onDirectionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort" | "onSortChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps>, prevState: Readonly<IWithRoutingResultsState>): any;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "region" | "waiting" | "onSegmentServiceChange" | "selected" | "query" | "onChange" | "onQueryChange" | "onQueryUpdate" | "preFrom" | "preTo" | "onPreChange" | "inputTextFrom" | "inputTextTo" | "onInputTextChange" | "regionInfo" | "viewport" | "onViewportChange" | "directionsView" | "onDirectionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort" | "onSortChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "region" | "waiting" | "onSegmentServiceChange" | "selected" | "query" | "onChange" | "onQueryChange" | "onQueryUpdate" | "preFrom" | "preTo" | "onPreChange" | "inputTextFrom" | "inputTextTo" | "onInputTextChange" | "regionInfo" | "viewport" | "onViewportChange" | "directionsView" | "onDirectionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort" | "onSortChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "region" | "waiting" | "onSegmentServiceChange" | "selected" | "query" | "onChange" | "onQueryChange" | "onQueryUpdate" | "preFrom" | "preTo" | "onPreChange" | "inputTextFrom" | "inputTextTo" | "onInputTextChange" | "regionInfo" | "viewport" | "onViewportChange" | "directionsView" | "onDirectionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort" | "onSortChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps>, nextState: Readonly<IWithRoutingResultsState>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "region" | "waiting" | "onSegmentServiceChange" | "selected" | "query" | "onChange" | "onQueryChange" | "onQueryUpdate" | "preFrom" | "preTo" | "onPreChange" | "inputTextFrom" | "inputTextTo" | "onInputTextChange" | "regionInfo" | "viewport" | "onViewportChange" | "directionsView" | "onDirectionsView" | "trips" | "waitingTripUpdate" | "tripUpdateError" | "sort" | "onSortChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps>, nextState: Readonly<IWithRoutingResultsState>, nextContext: any): void;
    };
    contextType?: React.Context<any> | undefined;
};
export default withRoutingResults;
