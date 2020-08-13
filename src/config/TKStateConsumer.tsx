import * as React from "react";
import TKUserProfile from "../model/options/TKUserProfile";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import {Moment} from "moment-timezone";
import {TKUIConfig} from "./TKUIConfig";
import {TKUIConfigContext} from "./TKUIConfigProvider";

interface IProps {
    /**
     * Need this doc to be displayed by styleguidist
     * @param {TKState} state
     * @returns {React.ReactNode}
     * @public
     */
    children: (state: TKState) => React.ReactNode;
}

export interface TKState extends IRoutingResultsContext, IServiceResultsContext, IOptionsContext {
    config: TKUIConfig;
}

class TKStateConsumer extends React.Component<IProps,{}> {

    public render(): React.ReactNode {
        return (
            <TKUIConfigContext.Consumer>
                {(config: TKUIConfig) =>
                    <OptionsContext.Consumer>
                        {(optionsContext: IOptionsContext) =>
                            <RoutingResultsContext.Consumer>
                                {(routingContext: IRoutingResultsContext) =>
                                    <ServiceResultsContext.Consumer>
                                        {(serviceContext: IServiceResultsContext) => {
                                            const state: TKState = {
                                                ...routingContext,
                                                ...serviceContext,
                                                ...optionsContext,
                                                config: config
                                            };
                                            return (this.props.children as ((state: TKState) => React.ReactNode))(state);
                                        }}
                                    </ServiceResultsContext.Consumer>
                                }
                            </RoutingResultsContext.Consumer>
                        }
                    </OptionsContext.Consumer>
                }
            </TKUIConfigContext.Consumer>
        )
    }

}

export default TKStateConsumer;