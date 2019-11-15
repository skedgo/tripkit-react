import {IProps, ITKUITripRowStyle} from "../trip/TKUITripRow";
import {TKUICustomStyles, TKUIStyles} from "../jss/StyleHelper";
import {IProps as ITKUIRoutingResultsImplProps, ITKUIResultsStyle} from "../trip/TKUIResultsView";

interface ITKUIConfigRequired {
    TKUITripRow: Partial<ITKUIComponentConfig<IProps, ITKUITripRowStyle>>
    TKUIRoutingResultsView: Partial<ITKUIComponentConfig<ITKUIRoutingResultsImplProps, ITKUIResultsStyle>>
}

export type TKUIConfig = Partial<ITKUIConfigRequired>

export interface ITKUIComponentDefaultConfig<P, S> {
    render: (props: P) => JSX.Element;
    styles: TKUIStyles<S, P>;
    randomizeClassNames?: boolean;
    classNamePrefix: string;
}

export interface ITKUIComponentConfig<P, S> {
    render: (props: P) => JSX.Element;
    styles: TKUICustomStyles<S, P>;
    randomizeClassNames?: boolean;
    classNamePrefix: string;
}