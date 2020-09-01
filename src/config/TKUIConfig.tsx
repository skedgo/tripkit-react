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
import {TKUITransportPinProps, TKUITransportPinStyle} from "../map/TKUITransportPin";
import LatLng from "../model/LatLng";
import {TKUITooltipProps, TKUITooltipStyle} from "../card/TKUITooltip";
import {TKUIReportBtnProps, TKUIReportBtnStyle} from "../feedback/TKUIReportBtn";
import {TKUITransportOptionsViewProps, TKUITransportOptionsViewStyle} from "../options/TKUITransportOptionsView";
import {TKUITransportOptionsRowProps, TKUITransportOptionsRowStyle} from "../options/TKUITransportOptionsRow";
import {TKUIButtonProps, TKUIButtonStyle} from "../buttons/TKUIButton";
import {TKUITransportSwitchesViewProps, TKUITransportSwitchesViewStyle} from "../options/TKUITransportSwitchesView";
import {TKUISelectProps, TKUISelectStyle} from "../buttons/TKUISelect";
import {TKUIPrivacyOptionsViewProps, TKUIPrivacyOptionsViewStyle} from "../options/TKUIPrivacyOptionsView";
import {TKI18nMessages} from "../i18n/TKI18nProvider";
import {TKUITripTimeProps, TKUITripTimeStyle} from "../trip/TKUITripTime";
import {TKUITrackTransportProps, TKUITrackTransportStyle} from "../trip/TKUITrackTransport";
import {TKUIW3wProps, TKUIW3wStyle} from "../location/TKUIW3w";
import {TKUICookiesBannerProps, TKUICookiesBannerStyle} from "../privacy/TKUICookiesBanner";
import {TKUIAlertsSummaryProps, TKUIAlertsSummaryStyle} from "../alerts/TKUIAlertsSummary";
import {TKUIAlertsViewProps, TKUIAlertsViewStyle} from "../alerts/TKUIAlertsView";
import {TKUIWaitingRequestProps, TKUIWaitingRequestStyle} from "../card/TKUIWaitingRequest";
import {TKUIMapPopupProps, TKUIMapPopupStyle} from "../map/TKUIMapPopup";
import {TKUIAutocompleteResultProps, TKUIAutocompleteResultStyle} from "../location_box/TKUIAutocompleteResult";
import {TKUILocationBoxProps, TKUILocationBoxStyle} from "../location_box/TKUILocationBox";
import {TKUICardCarouselProps, TKUICardCarouselStyle} from "../card/TKUICardCarousel";
import {TKUIAlertRowProps, TKUIAlertRowStyle} from "../alerts/TKUIAlertRow";
import {Tracker, InitializeOptions} from 'react-ga';
import {TrackerOptions} from "../analytics/GATracker";
import {TKUIErrorViewProps, TKUIErrorViewStyle} from "../error/TKUIErrorView";
import {TKState} from "./TKStateConsumer";
import TKGeocodingOptions from "../geocode/TKGeocodingOptions";

export const TKUIConfigForDoc = (props: TKUIConfig) => null;
TKUIConfigForDoc.displayName = 'Config object';

interface ITKUIConfigRequired {
    apiKey: string;
}

interface ITKUIConfigOptional {
    /**
     * Override for [default theme object]()
     */
    theme: Partial<TKUITheme> | ((isDark: boolean) => Partial<TKUITheme>);
    onInitState: (state: TKState) => void;
    onUpdateState: (state: TKState, prevState: TKState) => void;
    initViewport: {center?: LatLng, zoom?: number};
    /**
     * @ctype
     */
    i18n: {locale: string, translations: TKI18nMessages} | Promise<{locale: string, translations: TKI18nMessages}>;
    isDarkDefault: boolean,
    analytics?: {google?: {
        tracker: TrackerOptions | TrackerOptions[];
        initOptions?: InitializeOptions;
    }};
    /**
     * @ctype
     */
    geocoding?: Partial<TKGeocodingOptions> | ((defaultOptions: TKGeocodingOptions) => Partial<TKGeocodingOptions>);
    TKUITripPlanner: TKComponentConfig<TKUITKUITripPlannerProps, TKUITKUITripPlannerStyle>;
    TKUILocationBox: TKComponentConfig<TKUILocationBoxProps, TKUILocationBoxStyle>;
    TKUILocationSearch: TKComponentConfig<TKUILocationSearchProps, TKUILocationSearchStyle>;
    TKUIFavouritesView: TKComponentConfig<TKUIFavouritesViewProps, TKUIFavouritesViewStyle>;
    TKUIFavouriteRow: TKComponentConfig<TKUIFavouriteRowProps, TKUIFavouriteRowStyle>;
    TKUIRoutingQueryInput: TKComponentConfig<TKUIRoutingQueryInputProps, TKUIRoutingQueryInputStyle>;
    TKUIButton: TKComponentConfig<TKUIButtonProps, TKUIButtonStyle>;
    TKUISelect: TKComponentConfig<TKUISelectProps, TKUISelectStyle>;
    TKUICard: TKComponentConfig<TKUICardProps, TKUICardStyle>;
    TKUITripRow: TKComponentConfig<TKUITripRowProps, TKUITripRowStyle>;
    TKUITripTime: TKComponentConfig<TKUITripTimeProps, TKUITripTimeStyle>;
    TKUITrackTransport: TKComponentConfig<TKUITrackTransportProps, TKUITrackTransportStyle>;
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
    /**
     * See [style props](/#tkuiw3wcss)  __COMPONENT__
     * @public
     */
    TKUIW3w: TKComponentConfig<TKUIW3wProps, TKUIW3wStyle>;
    TKUICookiesBanner: TKComponentConfig<TKUICookiesBannerProps, TKUICookiesBannerStyle>;
    TKUIMapView: TKComponentConfig<TKUIMapViewProps, TKUIMapViewStyle>;
    TKUISidebar: TKComponentConfig<TKUISidebarProps, TKUISidebarStyle>;
    TKUIProfileView: TKComponentConfig<TKUIProfileViewProps, TKUIProfileViewStyle>;
    TKUIUserPriorities: TKComponentConfig<TKUIUserPrioritiesProps, TKUIUserPrioritiesStyle>;
    TKUIMapLocationIcon: TKComponentConfig<TKUIMapLocationIconProps, TKUIMapLocationIconStyle>;
    TKUIMyLocationMapIcon: TKComponentConfig<TKUIMyLocationMapIconProps, TKUIMyLocationMapIconStyle>;
    TKUIMapPopup: TKComponentConfig<TKUIMapPopupProps, TKUIMapPopupStyle>;
    TKUIRealtimeVehicle: TKComponentConfig<TKUIRealtimeVehicleProps, TKUIRealtimeVehicleStyle>;
    TKUIDateTimePicker: TKComponentConfig<TKUIDateTimePickerProps, TKUIDateTimePickerStyle>;
    TKUITransportPin: TKComponentConfig<TKUITransportPinProps, TKUITransportPinStyle>;
    TKUITooltip: TKComponentConfig<TKUITooltipProps, TKUITooltipStyle>;
    TKUIWaitingRequest: TKComponentConfig<TKUIWaitingRequestProps, TKUIWaitingRequestStyle>;
    TKUIReportBtn: TKComponentConfig<TKUIReportBtnProps, TKUIReportBtnStyle>;
    TKUITransportSwitchesView: TKComponentConfig<TKUITransportSwitchesViewProps, TKUITransportSwitchesViewStyle>;
    TKUITransportOptionsView: TKComponentConfig<TKUITransportOptionsViewProps, TKUITransportOptionsViewStyle>;
    TKUITransportOptionsRow: TKComponentConfig<TKUITransportOptionsRowProps, TKUITransportOptionsRowStyle>;
    TKUIPrivacyOptionsView: TKComponentConfig<TKUIPrivacyOptionsViewProps, TKUIPrivacyOptionsViewStyle>;
    TKUIAlertsSummary: TKComponentConfig<TKUIAlertsSummaryProps, TKUIAlertsSummaryStyle>;
    TKUIAlertsView: TKComponentConfig<TKUIAlertsViewProps, TKUIAlertsViewStyle>;
    TKUIAlertRow: TKComponentConfig<TKUIAlertRowProps, TKUIAlertRowStyle>;
    TKUIAutocompleteResult: TKComponentConfig<TKUIAutocompleteResultProps, TKUIAutocompleteResultStyle>;
    TKUICardCarousel: TKComponentConfig<TKUICardCarouselProps, TKUICardCarouselStyle>;
    TKUIErrorView: TKComponentConfig<TKUIErrorViewProps, TKUIErrorViewStyle>;
}

export type TKUIConfig = ITKUIConfigRequired & Partial<ITKUIConfigOptional>;

export interface TKComponentDefaultConfig<P extends TKUIWithClasses<S, P>, S> {
    render: (props: P) => JSX.Element;
    styles: TKUIStyles<S, P>;
    randomizeClassNames?: boolean;
    verboseClassNames?: boolean;
    classNamePrefix: string;
    props?: TKUIPropsOverride<P, S>;
}

export type TKComponentConfig<P extends TKUIWithClasses<S, P>, S> =
    Partial<Subtract<TKComponentDefaultConfig<P, S>,
            {styles: TKUIStyles<S, P>}> & {styles: TKUICustomStyles<S, P>}>;

export type TKUIPropsOverride<P extends TKUIWithClasses<S, P>, S> = Partial<P> | ((implProps: P) => Partial<P>);