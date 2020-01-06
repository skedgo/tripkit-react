import * as React from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {Moment} from "moment-timezone";
import withServiceResults from "../api/WithServiceResults";
import StopLocation from "../model/StopLocation";
import {EventEmitter} from "fbemitter";
import DateTimeUtil from "../util/DateTimeUtil";

export interface IServiceResultsContext {
    // stop query. Maybe group in class, similar to RoutingQuery. E.g. DeparturesQuery
    stop?: StopLocation;
    onStopChange: (stop?: StopLocation) => void;
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

export const ServiceResultsContext = React.createContext<IServiceResultsContext>({
    onStopChange: (stop?: StopLocation) => {},
    initTime: DateTimeUtil.getNow(),
    departures: [],
    waiting: true,
    title: "",
    onServiceSelection: (departure?: ServiceDeparture) => {},
    servicesEventBus: new EventEmitter(),
    onFindAndSelectService: (stop: StopLocation, serviceCode: string, initTime: Moment) => {}
});

class ServiceResultsProvider extends React.Component<{}, {}> {
    private ContextWithValue = withServiceResults((props: IServiceResultsContext) =>
        <ServiceResultsContext.Provider value={props}>{this.props.children}</ServiceResultsContext.Provider>);

    public render(): React.ReactNode {
        return (
            <this.ContextWithValue {...this.props}/>
        );
    }
}

export default ServiceResultsProvider;