import * as React from "react";
import RoutingQuery from "../model/RoutingQuery";
import Region from "../model/region/Region";
import TKUserProfile from "../model/options/TKUserProfile";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import Trip from "../model/trip/Trip";

interface IProps {
    children: (state: TKState) => React.ReactNode;
}

export interface TKState {
    routingQuery: RoutingQuery;
    region?: Region;
    userProfile: TKUserProfile;
    trips?: Trip[];
    selectedTrip?: Trip;
}

class TKStateConsumer extends React.Component<IProps,{}> {

    public render(): React.ReactNode {
        return (
            <OptionsContext.Consumer>
                {(optionsContext: IOptionsContext) =>
                    <RoutingResultsContext.Consumer>
                        {(routingContext: IRoutingResultsContext) => {
                            const state: TKState = {
                                routingQuery: routingContext.query,
                                region: routingContext.region,
                                userProfile: optionsContext.value,
                                trips: routingContext.trips,
                                selectedTrip: routingContext.selected
                            };
                            return (this.props.children as ((state: TKState) => React.ReactNode))(state);
                        }}
                    </RoutingResultsContext.Consumer>
                }
            </OptionsContext.Consumer>
        )
    }

}

export default TKStateConsumer;