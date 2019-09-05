import * as React from "react";
import withRoutingResults from "../api/WithRoutingResults";
import RoutingQuery from "../model/RoutingQuery";
import Trip from "../model/trip/Trip";
import TripGroup from "../model/trip/TripGroup";
import Options from "../model/Options";

export interface IRoutingResultsContext {
    query: RoutingQuery;
    onQueryChange: (query: RoutingQuery) => void;
    trips?: Trip[];
    waiting: boolean;
    onReqRealtimeFor: (trip?: Trip) => void;
    onAlternativeChange: (group: TripGroup, alt: Trip) => void;
}

export const RoutingResultsContext = React.createContext<IRoutingResultsContext | undefined>(undefined);

class RoutingResultsProvider extends React.Component<{initQuery?: RoutingQuery, options: Options}, {}> {
    private ContextWithValue = withRoutingResults((props: IRoutingResultsContext) =>
        <RoutingResultsContext.Provider value={props}>{this.props.children}</RoutingResultsContext.Provider>);

    public render(): React.ReactNode {
        return (
            <this.ContextWithValue urlQuery={this.props.initQuery} options={this.props.options}/>
        );
    }

}

export default RoutingResultsProvider;