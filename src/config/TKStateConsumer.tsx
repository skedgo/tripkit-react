import * as React from "react";
import RoutingQuery from "../model/RoutingQuery";
import Region from "../model/region/Region";
import TKUserProfile from "../model/options/TKUserProfile";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {Moment} from "moment-timezone";

interface IProps {
    children: (state: TKState) => React.ReactNode;
}

export interface TKState {
    routingQuery: RoutingQuery;
    region?: Region;
    userProfile: TKUserProfile;
    trips?: Trip[];
    selectedTrip?: Trip;
    stop?: StopLocation;
    selectedService?: ServiceDeparture;
    timetableInitTime: Moment;
}

class TKStateConsumer extends React.Component<IProps,{}> {

    public render(): React.ReactNode {
        return (
            <OptionsContext.Consumer>
                {(optionsContext: IOptionsContext) =>
                    <RoutingResultsContext.Consumer>
                        {(routingContext: IRoutingResultsContext) =>
                            <ServiceResultsContext.Consumer>
                                {(serviceContext: IServiceResultsContext) => {
                                    const state: TKState = {
                                        routingQuery: routingContext.query,
                                        region: routingContext.region,
                                        userProfile: optionsContext.value,
                                        trips: routingContext.trips,
                                        selectedTrip: routingContext.selected,
                                        stop: serviceContext.stop,
                                        timetableInitTime: serviceContext.initTime,
                                        selectedService: serviceContext.selectedService
                                    };
                                    return (this.props.children as ((state: TKState) => React.ReactNode))(state);
                                }}
                            </ServiceResultsContext.Consumer>
                        }
                    </RoutingResultsContext.Consumer>
                }
            </OptionsContext.Consumer>
        )
    }

}

export default TKStateConsumer;