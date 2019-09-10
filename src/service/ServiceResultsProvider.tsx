import * as React from "react";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {Moment} from "moment-timezone";
import withServiceResults from "../api/WithServiceResults";
import StopLocation from "../model/StopLocation";

export interface IServiceResultsContext {
    // stop query. Maybe group in class, similar to RoutingQuery. E.g. DeparturesQuery
    stop?: StopLocation;
    onStopChange: (stop?: StopLocation) => void;
    initTime: Moment;
    onInitTimeChange?: (initTime: Moment) => void;
    onFilterChange?: (filter: string) => void;
    onRequestMore?: () => void;

    departures: ServiceDeparture[];
    waiting: boolean;
    title: string;
    selectedService?: ServiceDeparture;
    onServiceSelection: (departure?: ServiceDeparture) => void;
}

export const ServiceResultsContext = React.createContext<IServiceResultsContext | undefined>(undefined);

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