import {TKUITripRowStyle, TKUITripRowProps} from "../trip/TKUITripRow";
import {TKUICustomStyles, TKUIStyles} from "../jss/StyleHelper";
import {TKUIResultsViewProps, TKUIResultsViewStyle} from "../trip/TKUIResultsView";
import {TKUITheme} from "../jss/TKUITheme";
import {TKUICardProps, TKUICardStyle} from "../card/TKUICard";

interface ITKUIConfigRequired {
    theme: Partial<TKUITheme>;
    TKUICard: Partial<ITKUIComponentConfig<TKUICardProps, TKUICardStyle>>;
    TKUITripRow: Partial<ITKUIComponentConfig<TKUITripRowProps, TKUITripRowStyle>>;
    TKUIRoutingResultsView: Partial<ITKUIComponentConfig<TKUIResultsViewProps, TKUIResultsViewStyle>>;
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