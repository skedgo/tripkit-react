import * as React from "react";
import {TKUIConfig} from "./TKUIConfig";
import RoutingQuery from "../model/RoutingQuery";
import Util from "../util/Util";
import TKStateConsumer, {TKState} from "./TKStateConsumer";
import TKStateProvider from "./TKStateProvider";

interface IProps {
    config: TKUIConfig;
    children: ((state: TKState) => React.ReactNode) | React.ReactNode;
}

// TODO: find a better name. It's the state provider, but state can also (optionally) be consumed.
// Maybe call this one TKStateProvider, and the current TKStateProvider is just an auxiliar?
// Maybe put a more general name, as WithTripKitState, or TKManager, or TKSDK, or TKRoot?
class TKRoot extends React.Component<IProps,{}> {

    public render(): React.ReactNode {
        return (
            <TKStateProvider config={this.props.config}>
                {Util.isFunction(this.props.children) ?
                    <TKStateConsumer>
                        {(state: TKState) =>
                            (this.props.children as ((state: TKState) => React.ReactNode))(state)
                        }
                    </TKStateConsumer>
                    :
                    this.props.children
                }
            </TKStateProvider>
        )
    }
}

export default TKRoot;