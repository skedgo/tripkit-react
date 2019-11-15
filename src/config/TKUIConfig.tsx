import {ITKUITripRowStyle, TKUITripRowProps} from "../trip/TKUITripRow";
import {TKUICustomStyles, TKUIStyles} from "../jss/StyleHelper";
import {ITKUIResultsStyle, TKUIResultsViewProps} from "../trip/TKUIResultsView";
import {TKUITheme} from "../jss/TKUITheme";

interface ITKUIConfigRequired {
    theme: Partial<TKUITheme>;
    TKUITripRow: Partial<ITKUIComponentConfig<TKUITripRowProps, ITKUITripRowStyle>>;
    TKUIRoutingResultsView: Partial<ITKUIComponentConfig<TKUIResultsViewProps, ITKUIResultsStyle>>;
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