import * as React from "react";
import {TKUIConfig} from "./TKUIConfig";
import RoutingQuery from "../model/RoutingQuery";
import TripGoApi from "../api/TripGoApi";
import TKUIProvider from "./TKUIProvider";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import Util from "../util/Util";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import TKUserProfile from "../model/options/TKUserProfile";
import Region from "../model/region/Region";

interface IProps {
    config: TKUIConfig;
    initQuery?: RoutingQuery;
    children: ((state: TKUIState) => React.ReactNode) | React.ReactNode;
}

export interface TKUIState {
    routingQuery: RoutingQuery;
    region?: Region;
    userProfile: TKUserProfile;
}

class TKUI extends React.Component<IProps,{}> {

    constructor(props: IProps) {
        super(props);
        TripGoApi.apiKey = props.config.apiKey;
    }

    public render(): React.ReactNode {
        let client;
        if (Util.isFunction(this.props.children)) {
            client =
                <OptionsContext.Consumer>
                    {(optionsContext: IOptionsContext) =>
                        <RoutingResultsContext.Consumer>
                            {(routingContext: IRoutingResultsContext) => {
                                const state: TKUIState = {
                                    routingQuery: routingContext.query,
                                    region: routingContext.region,
                                    userProfile: optionsContext.value
                                };
                                return (this.props.children as ((state: TKUIState) => React.ReactNode))(state);
                            }}
                        </RoutingResultsContext.Consumer>
                    }
                </OptionsContext.Consumer>
        } else {
            client = this.props.children
        }
        return (
            <TKUIProvider config={this.props.config}>
                {client}
            </TKUIProvider>
        )
    }
}

export default TKUI;