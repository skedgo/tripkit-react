import {TKUITripRowStyle, TKUITripRowProps} from "../trip/TKUITripRow";
import {TKUICustomStyles, TKUIStyles} from "../jss/StyleHelper";
import {TKUIResultsViewProps, TKUIResultsViewStyle} from "../trip/TKUIResultsView";
import {TKUITheme} from "../jss/TKUITheme";
import {TKUICardProps, TKUICardStyle} from "../card/TKUICard";
import {
    TKUITripOverviewViewProps,
    TKUITripOverviewViewStyle
} from "../trip/TKUITripOverviewView";
import {Subtract} from "utility-types";

interface ITKUIConfigRequired {
    theme: Partial<TKUITheme>;
    TKUICard: ConfigRefiner<TKUICardProps, TKUICardStyle>;
    TKUITripRow: ConfigRefiner<TKUITripRowProps, TKUITripRowStyle>;
    TKUIRoutingResultsView: ConfigRefiner<TKUIResultsViewProps, TKUIResultsViewStyle>;
    TKUITripOverviewView: ConfigRefiner<TKUITripOverviewViewProps, TKUITripOverviewViewStyle>;
}

export type TKUIConfig = Partial<ITKUIConfigRequired>

export interface ITKUIComponentDefaultConfig<P, S> {
    render: (props: P) => JSX.Element;
    styles: TKUIStyles<S, P>;
    randomizeClassNames?: boolean;
    classNamePrefix: string;
    configProps?: Partial<P>;
}

export type ConfigRefiner<P, S> =
    Partial<Subtract<ITKUIComponentDefaultConfig<P, S>,
        {styles: TKUIStyles<S, P>, configProps?: Partial<P>}>
        & {styles: TKUICustomStyles<S, P>, configProps?: TKUICustomPartialProps<P>}>;

type TKUICustomPartialProps<P> = Partial<P> | ((defaultConfigProps: Partial<P>) => Partial<P>);