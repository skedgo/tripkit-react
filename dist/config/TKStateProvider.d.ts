import * as React from "react";
import { TKUIConfig } from "./TKUIConfig";
interface IProps {
    config: TKUIConfig;
}
declare class TKStateProvider extends React.Component<IProps, {}> {
    constructor(props: IProps);
    render(): React.ReactNode;
}
export default TKStateProvider;
