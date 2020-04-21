import * as React from "react";
import { TKUIConfig } from "./TKUIConfig";
export declare const TKUIConfigContext: React.Context<TKUIConfig>;
declare class TKUIConfigProvider extends React.Component<{
    config: TKUIConfig;
}, {}> {
    render(): React.ReactNode;
}
export default TKUIConfigProvider;
