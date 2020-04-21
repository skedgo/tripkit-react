import * as React from "react";
import { Moment } from "moment-timezone";
import Segment from "../model/trip/Segment";
import ServiceDeparture from "../model/service/ServiceDeparture";
import { IServiceResultsContext as IServiceResConsumerProps } from "../service/ServiceResultsProvider";
import StopLocation from "../model/StopLocation";
import { EventEmitter } from "fbemitter";
export interface IWithServiceResultsProps {
    onSegmentServiceChange: (segment: Segment, service: ServiceDeparture, callback?: () => void) => void;
}
interface IWithServiceResultsState {
    startStop?: StopLocation;
    segment?: Segment;
    initTime: Moment;
    departures: ServiceDeparture[];
    noRTDepartures: ServiceDeparture[];
    selected?: ServiceDeparture;
    filter: string;
    departuresFiltered: ServiceDeparture[];
    displayLimit: number;
    initTimeChanged: boolean;
}
declare function withServiceResults<P extends IServiceResConsumerProps>(Consumer: React.ComponentType<any>): {
    new (props: Pick<P, import("utility-types").SetDifference<keyof P, "title" | "stop" | "onStopChange" | "timetableForSegment" | "onTimetableForSegment" | "initTime" | "onInitTimeChange" | "onFilterChange" | "onRequestMore" | "onFindAndSelectService" | "departures" | "waiting" | "selectedService" | "onServiceSelection" | "servicesEventBus">> & IWithServiceResultsProps): {
        readonly idealMinDisplayed: 15;
        requestsWithoutNewResults: number;
        prevFilter: string;
        prevDeparturesCount: number;
        awaitingRealtime: boolean;
        rTSchedule: any;
        eventBus: EventEmitter;
        requestMoreDepartures(): void;
        onFilterChange(filter: string): void;
        getDisplaySnap(state: IWithServiceResultsState): number;
        getDisplayDepartures(): ServiceDeparture[];
        isWaiting(state: IWithServiceResultsState): boolean;
        onInitTimeChange(initTime: Moment): void;
        onServiceSelection(departure?: ServiceDeparture | undefined): void;
        onStopChange(stop?: StopLocation | undefined): void;
        onTimetableForSegment(segment?: Segment | undefined): void;
        getSelectedService(): ServiceDeparture | undefined;
        render(): React.ReactNode;
        coverDisplayRequestHash: string;
        getCoverDisplayRequestHash(): string;
        /**
         * requesting departures if those
         * matching the filter are not enough to fill the scroll panel.
         */
        coverDisplayLimit(): void;
        updateDepartures(departuresUpdater: (prev: ServiceDeparture[]) => ServiceDeparture[], callback?: (() => void) | undefined): void;
        applyFilter(callback?: (() => void) | undefined): void;
        requestDepartures(): Promise<ServiceDeparture[]>;
        getLastDepartureTime(): number;
        matchesFilter(departure: ServiceDeparture, filter: string): boolean;
        realtimeUpdate(): void;
        requestUntilServiceFound(serviceTripId: string, limit?: number): void;
        onFindAndSelectService(stop: StopLocation, serviceCode: string, initTime: Moment): void;
        componentWillUnmount(): void;
        context: any;
        setState<K extends "filter" | "initTime" | "departures" | "startStop" | "segment" | "noRTDepartures" | "selected" | "departuresFiltered" | "displayLimit" | "initTimeChanged">(state: IWithServiceResultsState | ((prevState: Readonly<IWithServiceResultsState>, props: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "title" | "stop" | "onStopChange" | "timetableForSegment" | "onTimetableForSegment" | "initTime" | "onInitTimeChange" | "onFilterChange" | "onRequestMore" | "onFindAndSelectService" | "departures" | "waiting" | "selectedService" | "onServiceSelection" | "servicesEventBus">> & IWithServiceResultsProps>) => IWithServiceResultsState | Pick<IWithServiceResultsState, K> | null) | Pick<IWithServiceResultsState, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "title" | "stop" | "onStopChange" | "timetableForSegment" | "onTimetableForSegment" | "initTime" | "onInitTimeChange" | "onFilterChange" | "onRequestMore" | "onFindAndSelectService" | "departures" | "waiting" | "selectedService" | "onServiceSelection" | "servicesEventBus">> & IWithServiceResultsProps> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<IWithServiceResultsState>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "title" | "stop" | "onStopChange" | "timetableForSegment" | "onTimetableForSegment" | "initTime" | "onInitTimeChange" | "onFilterChange" | "onRequestMore" | "onFindAndSelectService" | "departures" | "waiting" | "selectedService" | "onServiceSelection" | "servicesEventBus">> & IWithServiceResultsProps>, nextState: Readonly<IWithServiceResultsState>, nextContext: any): boolean;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "title" | "stop" | "onStopChange" | "timetableForSegment" | "onTimetableForSegment" | "initTime" | "onInitTimeChange" | "onFilterChange" | "onRequestMore" | "onFindAndSelectService" | "departures" | "waiting" | "selectedService" | "onServiceSelection" | "servicesEventBus">> & IWithServiceResultsProps>, prevState: Readonly<IWithServiceResultsState>): any;
        componentDidUpdate?(prevProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "title" | "stop" | "onStopChange" | "timetableForSegment" | "onTimetableForSegment" | "initTime" | "onInitTimeChange" | "onFilterChange" | "onRequestMore" | "onFindAndSelectService" | "departures" | "waiting" | "selectedService" | "onServiceSelection" | "servicesEventBus">> & IWithServiceResultsProps>, prevState: Readonly<IWithServiceResultsState>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "title" | "stop" | "onStopChange" | "timetableForSegment" | "onTimetableForSegment" | "initTime" | "onInitTimeChange" | "onFilterChange" | "onRequestMore" | "onFindAndSelectService" | "departures" | "waiting" | "selectedService" | "onServiceSelection" | "servicesEventBus">> & IWithServiceResultsProps>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "title" | "stop" | "onStopChange" | "timetableForSegment" | "onTimetableForSegment" | "initTime" | "onInitTimeChange" | "onFilterChange" | "onRequestMore" | "onFindAndSelectService" | "departures" | "waiting" | "selectedService" | "onServiceSelection" | "servicesEventBus">> & IWithServiceResultsProps>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "title" | "stop" | "onStopChange" | "timetableForSegment" | "onTimetableForSegment" | "initTime" | "onInitTimeChange" | "onFilterChange" | "onRequestMore" | "onFindAndSelectService" | "departures" | "waiting" | "selectedService" | "onServiceSelection" | "servicesEventBus">> & IWithServiceResultsProps>, nextState: Readonly<IWithServiceResultsState>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<Pick<P, import("utility-types").SetDifference<keyof P, "title" | "stop" | "onStopChange" | "timetableForSegment" | "onTimetableForSegment" | "initTime" | "onInitTimeChange" | "onFilterChange" | "onRequestMore" | "onFindAndSelectService" | "departures" | "waiting" | "selectedService" | "onServiceSelection" | "servicesEventBus">> & IWithServiceResultsProps>, nextState: Readonly<IWithServiceResultsState>, nextContext: any): void;
    };
    sortDepartures(departures: ServiceDeparture[], considerRealtime?: boolean): ServiceDeparture[];
    contextType?: React.Context<any> | undefined;
};
export default withServiceResults;
