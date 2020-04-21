import * as React from "react";
import { TKUIConfig } from "./TKUIConfig";
import { TKState } from "./TKStateConsumer";
interface IProps {
    config: TKUIConfig;
    children: ((state: TKState) => React.ReactNode) | React.ReactNode;
}
declare class TKRoot extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default TKRoot;
