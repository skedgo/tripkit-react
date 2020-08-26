import * as React from "react";
import {TKUIConfig} from "./TKUIConfig";
import Util from "../util/Util";
import TKStateConsumer, {TKState} from "./TKStateConsumer";
import TKStateProvider from "./TKStateProvider";
import {genClassNames, TKStateController} from "../index";
import classNames from "classnames";

interface IProps {
    config: TKUIConfig;
    children: ((state: TKState) => React.ReactNode) | React.ReactNode;
}

class TKRoot extends React.Component<IProps,{}> {

    private addRootStyleToChild(child: any) {
        return React.cloneElement(child, {className: classNames(child.props.className, genClassNames.root)});
    }

    private addRootStyleToChildren(children: React.ReactNode) {
        return React.Children.map(children, (child: any) => this.addRootStyleToChild(child));
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
                    this.addRootStyleToChildren(this.props.children)
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