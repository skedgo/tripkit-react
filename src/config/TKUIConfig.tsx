import {TKUITripRowStyle, TKUITripRowProps} from "../trip/TKUITripRow";
import {TKUICustomStyles, TKUIStyles, TKUIWithClasses} from "../jss/StyleHelper";
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
import {TKUILocationSearchProps, TKUILocationSearchStyle} from "../query/TKUILocationSearch";
import {TKUILocationDetailViewProps, TKUILocationDetailViewStyle} from "../location/TKUILocationDetailView";
import {TKUIFavouritesViewProps, TKUIFavouritesViewStyle} from "../favourite/TKUIFavouritesView";
import {TKUIFavouriteRowProps, TKUIFavouriteRowStyle} from "../favourite/TKUIFavouriteRow";
import {TKUIMapViewProps, TKUIMapViewStyle} from "../map/TKUIMapView";
import {TKUISidebarProps, TKUISidebarStyle} from "../sidebar/TKUISidebar";
import {TKUIProfileViewProps, TKUIProfileViewStyle} from "../options/TKUIProfileView";
import {TKUIUserPrioritiesProps, TKUIUserPrioritiesStyle} from "../options/TKUIUserPriorities";
import {TKUIMapLocationIconProps, TKUIMapLocationIconStyle} from "../map/TKUIMapLocationIcon";
import {TKUIMyLocationMapIconProps, TKUIMyLocationMapIconStyle} from "../map/TKUIMyLocationMapIcon";
import {TKUIRealtimeVehicleProps, TKUIRealtimeVehicleStyle} from "../map/TKUIRealtimeVehicle";
import {TKUIDateTimePickerProps, TKUIDateTimePickerStyle} from "../time/TKUIDateTimePicker";

interface ITKUIConfigRequired {
    apiKey: string;
}

interface ITKUIConfigOptional {
    theme: Partial<TKUITheme>;
    TKUITripPlanner: TKComponentConfig<TKUITKUITripPlannerProps, TKUITKUITripPlannerStyle>;
    TKUILocationSearch: TKComponentConfig<TKUILocationSearchProps, TKUILocationSearchStyle>;
    TKUIFavouritesView: TKComponentConfig<TKUIFavouritesViewProps, TKUIFavouritesViewStyle>;
    TKUIFavouriteRow: TKComponentConfig<TKUIFavouriteRowProps, TKUIFavouriteRowStyle>;
    TKUITKUIRoutingQueryInput: TKComponentConfig<TKUIRoutingQueryInputProps, TKUIRoutingQueryInputStyle>;
    TKUICard: TKComponentConfig<TKUICardProps, TKUICardStyle>;
    TKUITripRow: TKComponentConfig<TKUITripRowProps, TKUITripRowStyle>;
    TKUIRoutingResultsView: TKComponentConfig<TKUIResultsViewProps, TKUIResultsViewStyle>;
    TKUITripOverviewView: TKComponentConfig<TKUITripOverviewViewProps, TKUITripOverviewViewStyle>;
    TKUISegmentOverview: TKComponentConfig<TKUISegmentOverviewProps, TKUISegmentOverviewStyle>;
    TKUIWCSegmentInfo: TKComponentConfig<TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle>;
    TKUITimetableView: TKComponentConfig<TKUITimetableViewProps, TKUITimetableViewStyle>;
    TKUIServiceDepartureRow: TKComponentConfig<TKUIServiceDepartureRowProps, TKUIServiceDepartureRowStyle>;
    TKUIServiceView: TKComponentConfig<TKUIServiceViewProps, TKUIServiceViewStyle>;
    TKUITrainOccupancyInfo: TKComponentConfig<TKUITrainOccupancyInfoProps, TKUITrainOccupancyInfoStyle>;
    TKUIShareView: TKComponentConfig<TKUIShareViewProps, TKUIShareViewStyle>;
    TKUILocationDetailView: TKComponentConfig<TKUILocationDetailViewProps, TKUILocationDetailViewStyle>;
    TKUIMapView: TKComponentConfig<TKUIMapViewProps, TKUIMapViewStyle>;
    TKUISidebar: TKComponentConfig<TKUISidebarProps, TKUISidebarStyle>;
    TKUIProfileView: TKComponentConfig<TKUIProfileViewProps, TKUIProfileViewStyle>;
    TKUIUserPriorities: TKComponentConfig<TKUIUserPrioritiesProps, TKUIUserPrioritiesStyle>;
    TKUIMapLocationIcon: TKComponentConfig<TKUIMapLocationIconProps, TKUIMapLocationIconStyle>;
    TKUIMyLocationMapIcon: TKComponentConfig<TKUIMyLocationMapIconProps, TKUIMyLocationMapIconStyle>;
    TKUIRealtimeVehicle: TKComponentConfig<TKUIRealtimeVehicleProps, TKUIRealtimeVehicleStyle>;
    TKUIDateTimePicker: TKComponentConfig<TKUIDateTimePickerProps, TKUIDateTimePickerStyle>;
}

export type TKUIConfig = ITKUIConfigRequired & Partial<ITKUIConfigOptional>;

export interface TKComponentDefaultConfig<P extends TKUIWithClasses<S, P>, S> {
    render: (props: P) => JSX.Element;
    styles: TKUIStyles<S, P>;
    randomizeClassNames?: boolean;
    classNamePrefix: string;
    props?: TKUIPropsOverride<P, S>;
}

export type TKComponentConfig<P extends TKUIWithClasses<S, P>, S> =
    Partial<Subtract<TKComponentDefaultConfig<P, S>,
            {styles: TKUIStyles<S, P>}> & {styles: TKUICustomStyles<S, P>}>;

type TKUIPropsOverride<P extends TKUIWithClasses<S, P>, S> = Partial<P> | ((implProps: P) => Partial<P>);
