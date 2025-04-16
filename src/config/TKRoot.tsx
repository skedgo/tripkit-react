import "reflect-metadata";
import React, { ReactNode } from "react";
import { TKUIConfig } from "./TKUIConfig";
import Util from "../util/Util";
import TKStateConsumer from "./TKStateConsumer";
import TKStateController from "./TKStateController";
import { TKState } from "./TKState";
import TKStateProvider from "./TKStateProvider";
import classNames from "classnames";
import { genClassNames } from "../css/GenStyle.css";

interface IProps {
    /**
     * The SDK configuration object.
     * @ctype
     */
    config: TKUIConfig;
    children: ((state: TKState) => React.ReactNode) | React.ReactNode;
}

/**
 * Component wrapping all the other SDK components. It allows to specify global and component-specific configs,
 * and also provides a shared state and actions layer, which SDK components can optionally connect to in order to
 * share data and interact with the TripGo API.
 */

class TKRoot extends React.Component<IProps, {}> {

    private addRootStyleToChild(child: any) {
        return React.cloneElement(child, { className: classNames(child.props.className, genClassNames.root) });
    }

    private addRootStyleToChildren(children: React.ReactNode) {
        return React.Children.map(children, (child: any) => child && this.addRootStyleToChild(child));
    }

    public render(): React.ReactNode {
        return (
            <TKStateProvider config={this.props.config}>
                {Util.isFunction(this.props.children) ?
                    <TKStateConsumer>
                        {(state: TKState) =>
                            this.addRootStyleToChildren((this.props.children as ((state: TKState) => React.ReactNode))(state))
                        }
                    </TKStateConsumer>
                    :
                    this.addRootStyleToChildren(this.props.children as ReactNode)
                }
                <TKStateController
                    onInit={this.props.config.onInitState}
                    onUpdate={this.props.config.onUpdateState}
                />
            </TKStateProvider>
        )
    }
}

export default TKRoot;