import * as React from "react";
import TKUserProfile from "../model/options/TKUserProfile";
export interface IOptionsContext {
    value: TKUserProfile;
    onChange: (value: TKUserProfile) => void;
}
export declare const OptionsContext: React.Context<IOptionsContext>;
declare class OptionsProvider extends React.Component<{}, {
    value: TKUserProfile;
}> {
    constructor(props: {});
    private onChange;
    render(): React.ReactNode;
}
export default OptionsProvider;
