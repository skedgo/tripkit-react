import * as React from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {Moment} from "moment-timezone";
import withServiceResults, {IWithServiceResultsProps} from "../api/WithServiceResults";
import StopLocation from "../model/StopLocation";
import {EventEmitter} from "fbemitter";
import DateTimeUtil from "../util/DateTimeUtil";
import Segment from "../model/trip/Segment";
import {TKError} from "../error/TKError";

export interface IServiceResultsContext {
    // stop query. Maybe group in class, similar to RoutingQuery. E.g. DeparturesQuery
    stop?: StopLocation;    // TODO: maybe more intuitive timetableForStop and onTimetableForStop?
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
    serviceError?: TKError;
    title: string;
    selectedService?: ServiceDeparture;
    onServiceSelection: (departure?: ServiceDeparture) => void;
    servicesEventBus: EventEmitter;
}

export const ServiceResultsContext = React.createContext<IServiceResultsContext>({
    onStopChange: (stop?: StopLocation) => {},
    onTimetableForSegment: (segment?: Segment) => {},
    initTime: DateTimeUtil.getNow(),
    departures: [],
    waiting: true,
    title: "",
    onServiceSelection: (departure?: ServiceDeparture) => {},
    servicesEventBus: new EventEmitter(),
    onFindAndSelectService: (stop: StopLocation, serviceCode: string, initTime: Moment) => {}
});

class ServiceResultsProvider extends React.Component<IWithServiceResultsProps, {}> {
    private ContextWithValue = withServiceResults((props: IServiceResultsContext) =>
        <ServiceResultsContext.Provider value={props}>{this.props.children}</ServiceResultsContext.Provider>);

    public render(): React.ReactNode {
        return (
            <this.ContextWithValue {...this.props}/>
        );
    }
}

export default ServiceResultsProvider;