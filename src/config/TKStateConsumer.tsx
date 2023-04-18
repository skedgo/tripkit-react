import * as React from "react";
import { IRoutingResultsContext, RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import { IOptionsContext, OptionsContext } from "../options/OptionsProvider";
import { IServiceResultsContext, ServiceResultsContext } from "../service/ServiceResultsProvider";
import { TKUIConfig } from "./TKUIConfig";
import { TKUIConfigContext } from "./TKUIConfigProvider";
import { TKState } from "./TKState";
import { TKAccessibilityContext } from "./TKAccessibilityProvider";

interface IProps {
    children: (state: TKState) => React.ReactNode;
}

class TKStateConsumer extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <TKUIConfigContext.Consumer>
                {(config: TKUIConfig) =>
                    <OptionsContext.Consumer>
                        {(optionsContext: IOptionsContext) =>
                            <TKAccessibilityContext.Consumer>
                                {accessibilityContext =>
                                    <RoutingResultsContext.Consumer>
                                        {(routingContext: IRoutingResultsContext) =>
                                            <ServiceResultsContext.Consumer>
                                                {(serviceContext: IServiceResultsContext) => {
                                                    const state: TKState = {
                                                        ...routingContext,
                                                        ...serviceContext,
                                                        ...optionsContext,
                                                        ...accessibilityContext,
                                                        config
                                                    };
                                                    return (this.props.children as ((state: TKState) => React.ReactNode))(state);
                                                }}
                                            </ServiceResultsContext.Consumer>
                                        }
                                    </RoutingResultsContext.Consumer>
                                }
                            </TKAccessibilityContext.Consumer>
                        }
                    </OptionsContext.Consumer>
                }
            </TKUIConfigContext.Consumer>
        )
    }

}

export default TKStateConsumer;