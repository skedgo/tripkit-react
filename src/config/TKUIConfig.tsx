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
import {TKUISegmentOverviewProps, TKUISegmentOverviewStyle} from "../trip/TKUISegmentOverview";
import {TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle} from "../trip/TKUIWCSegmentInfo";
import {TKUITimetableViewProps, TKUITimetableViewStyle} from "../service/TKUITimetableView";
import {TKUIServiceDepartureRowProps, TKUIServiceDepartureRowStyle} from "../service/TKUIServiceDepartureRow";
import {TKUIServiceViewProps, TKUIServiceViewStyle} from "../service/TKUIServiceView";
import {TKUIRoutingQueryInputProps, TKUIRoutingQueryInputStyle} from "../query/TKUIRoutingQueryInput";
import {TKUITKUITripPlannerProps, TKUITKUITripPlannerStyle} from "../trip-planner/TKUITripPlanner";
import {TKUITrainOccupancyInfoProps, TKUITrainOccupancyInfoStyle} from "../service/occupancy/TKUITrainOccupancyInfo";
import {TKUIShareViewProps, TKUIShareViewStyle} from "../share/TKUIShareView";
import {TKUISearchBarProps, TKUISearchBarStyle} from "../query/TKUISearchBar";
import {TKUILocationDetailViewProps, TKUILocationDetailViewStyle} from "../location/TKUILocationDetailView";
import {TKUIFavouritesViewProps, TKUIFavouritesViewStyle} from "../favourite/TKUIFavouritesView";
import {TKUIFavouriteRowProps, TKUIFavouriteRowStyle} from "../favourite/TKUIFavouriteRow";
import {TKUIMapViewProps, TKUIMapViewStyle} from "../map/TKUIMapView";
import {TKUISidebarProps, TKUISidebarStyle} from "../sidebar/TKUISidebar";

interface ITKUIConfigRequired {
    theme: Partial<TKUITheme>;
    // TODO: rename ConfigRefiner to ConfigOverride?
    TKUITripPlanner: ConfigRefiner<TKUITKUITripPlannerProps, TKUITKUITripPlannerStyle>;
    TKUISearchBar: ConfigRefiner<TKUISearchBarProps, TKUISearchBarStyle>;
    TKUIFavouritesView: ConfigRefiner<TKUIFavouritesViewProps, TKUIFavouritesViewStyle>;
    TKUIFavouriteRow: ConfigRefiner<TKUIFavouriteRowProps, TKUIFavouriteRowStyle>;
    TKUITKUIRoutingQueryInput: ConfigRefiner<TKUIRoutingQueryInputProps, TKUIRoutingQueryInputStyle>;
    TKUICard: ConfigRefiner<TKUICardProps, TKUICardStyle>;
    TKUITripRow: ConfigRefiner<TKUITripRowProps, TKUITripRowStyle>;
    TKUIRoutingResultsView: ConfigRefiner<TKUIResultsViewProps, TKUIResultsViewStyle>;
    TKUITripOverviewView: ConfigRefiner<TKUITripOverviewViewProps, TKUITripOverviewViewStyle>;
    TKUISegmentOverview: ConfigRefiner<TKUISegmentOverviewProps, TKUISegmentOverviewStyle>;
    TKUIWCSegmentInfo: ConfigRefiner<TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle>;
    TKUITimetableView: ConfigRefiner<TKUITimetableViewProps, TKUITimetableViewStyle>;
    TKUIServiceDepartureRow: ConfigRefiner<TKUIServiceDepartureRowProps, TKUIServiceDepartureRowStyle>;
    TKUIServiceView: ConfigRefiner<TKUIServiceViewProps, TKUIServiceViewStyle>;
    TKUITrainOccupancyInfo: ConfigRefiner<TKUITrainOccupancyInfoProps, TKUITrainOccupancyInfoStyle>;
    TKUIShareView: ConfigRefiner<TKUIShareViewProps, TKUIShareViewStyle>;
    TKUILocationDetailView: ConfigRefiner<TKUILocationDetailViewProps, TKUILocationDetailViewStyle>;
    TKUIMapView: ConfigRefiner<TKUIMapViewProps, TKUIMapViewStyle>;
    TKUISidebar: ConfigRefiner<TKUISidebarProps, TKUISidebarStyle>;
}

export type TKUIConfig = Partial<ITKUIConfigRequired>

export interface ITKUIComponentDefaultConfig<P, S> {
    render: (props: P) => JSX.Element;
    styles: TKUIStyles<S, P>;
    randomizeClassNames?: boolean;
    classNamePrefix: string;
    configProps?: Partial<P>;
    // TODO: rename configProps to just props. Make TKUICustomPartialProps receive not just defaultConfigProps,
    // but props: IProps (the properties passed to the component, overriden with the defaultConfigProps).
    // Or make it receive: {...defaultConfigProps(implProps), ...implProps}, which is of type<P>, not partial<P>.
    // This way default and refiner config can be based on IProps (e.g. to receive more context). But still injectedStyles
    // won't be available. Keep thinking.
    // Also implProps override defaultConfigProps, which are overriden by refiner props.
    // The more simple, but less powerful, change is to rename to props, and make WithStyleInjector receive
    // {...defaultConfig.configProps} {...implProps} {...configProps}
}

export type ConfigRefiner<P, S> =
    Partial<Subtract<ITKUIComponentDefaultConfig<P, S>,
        {styles: TKUIStyles<S, P>, configProps?: Partial<P>}>
        & {styles: TKUICustomStyles<S, P>, configProps?: TKUICustomPartialProps<P>}>;

type TKUICustomPartialProps<P> = Partial<P> | ((defaultConfigProps: Partial<P>) => Partial<P>);