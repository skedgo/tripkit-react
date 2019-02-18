import * as React from "react";
import TripGroup from "../model/trip/TripGroup";
import Trip from "../model/trip/Trip";
import { ITripPlannerProps as RResultsConsumerProps } from "../trip-planner/ITripPlannerProps";
import RoutingQuery from "../model/RoutingQuery";
interface IWithRoutingResultsProps {
    urlQuery?: RoutingQuery;
}
interface IWithRoutingResultsState {
    query: RoutingQuery;
    trips: Trip[] | null;
    selected?: Trip;
    waiting: boolean;
}
declare function withRoutingResults<P extends RResultsConsumerProps>(Consumer: React.ComponentType<P>): {
    new (props: Pick<P, import("utility-types/dist/mapped-types").SetDifference<keyof P, "waiting" | "trips" | "query" | "onQueryChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps): {
        realtimeInterval: any;
        onQueryChange(query: RoutingQuery): void;
        checkWaiting(waitingState: any): void;
        alreadyAnEquivalent(newTrip: Trip, trips: Trip[]): boolean;
        equivalentTrips(tripA: Trip, tripB: Trip): boolean;
        onReqRealtimeFor(selected?: Trip | undefined): void;
        onAlternativeChange(group: TripGroup, alt: Trip): void;
        render(): React.ReactNode;
        componentDidMount(): void;
        setState<K extends "waiting" | "trips" | "selected" | "query">(state: IWithRoutingResultsState | ((prevState: Readonly<IWithRoutingResultsState>, props: Readonly<Pick<P, import("utility-types/dist/mapped-types").SetDifference<keyof P, "waiting" | "trips" | "query" | "onQueryChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps>) => IWithRoutingResultsState | Pick<IWithRoutingResultsState, K> | null) | Pick<IWithRoutingResultsState, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        readonly props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<Pick<P, import("utility-types/dist/mapped-types").SetDifference<keyof P, "waiting" | "trips" | "query" | "onQueryChange" | "onReqRealtimeFor" | "onAlternativeChange">> & IWithRoutingResultsProps>;
        state: Readonly<IWithRoutingResultsState>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
};
export default withRoutingResults;
export { IWithRoutingResultsProps, IWithRoutingResultsState };
