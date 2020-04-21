import * as React from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import { Moment } from "moment-timezone";
import { IWithServiceResultsProps } from "../api/WithServiceResults";
import StopLocation from "../model/StopLocation";
import { EventEmitter } from "fbemitter";
import Segment from "../model/trip/Segment";
export interface IServiceResultsContext {
    stop?: StopLocation;
    onStopChange: (stop?: StopLocation) => void;
    timetableForSegment?: Segment;
    onTimetableForSegment: (segment?: Segment) => void;
    initTime: Moment;
    onInitTimeChange?: (initTime: Moment) => void;
    onFilterChange?: (filter: string) => void;
    onRequestMore?: () => void;
    onFindAndSelectService: (stop: StopLocation, serviceCode: string, initTime: Moment) => void;
    departures: ServiceDeparture[];
    waiting: boolean;
    title: string;
    selectedService?: ServiceDeparture;
    onServiceSelection: (departure?: ServiceDeparture) => void;
    servicesEventBus: EventEmitter;
}
export declare const ServiceResultsContext: React.Context<IServiceResultsContext>;
declare class ServiceResultsProvider extends React.Component<IWithServiceResultsProps, {}> {
    private ContextWithValue;
    render(): React.ReactNode;
}
export default ServiceResultsProvider;
