import {TKUITripRowStyle, TKUITripRowProps} from "../trip/TKUITripRow";
import {TKUIRoutingResultsViewProps, TKUIRoutingResultsViewStyle} from "../trip/TKUIRoutingResultsView";
import {TKUITheme} from "../jss/TKUITheme";
import {TKUICardProps, TKUICardStyle} from "../card/TKUICard";
import {
    TKUITripOverviewViewProps,
    TKUITripOverviewViewStyle
} from "../trip/TKUITripOverviewView";
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
import {TKUILocationDetailFieldProps, TKUILocationDetailFieldStyle} from "../location/TKUILocationDetailField";
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
import {TKState} from "./TKState";
import TKGeocodingOptions from "../geocode/TKGeocodingOptions";
import {TKComponentConfig} from "./TKComponentConfig";
import {TKComponentDefaultConfig as TKComponentDefaultConfigForExport} from "./TKComponentConfig";
import {TKUIWithClasses} from "../jss/StyleHelper";
import {TKUIServiceStepsProps, TKUIServiceStepsStyle} from "../trip/TKUIServiceSteps";
import {TKUIMapShapesProps, TKUIMapShapesStyle} from "../map/TKUIMapShapes";
import {TKUIMapStreetsProps, TKUIMapStreetsStyle} from "../map/TKUIMapStreets";
import {TKUIMapLocationPopupProps, TKUIMapLocationPopupStyle} from "../map/TKUIMapLocationPopup";
import {TKUIQueryLocationBoxProps, TKUIQueryLocationBoxStyle} from "../query/TKUIQueryLocationBox";
import {TKUIMxMViewProps, TKUIMxMViewStyle} from "../mxm/TKUIMxMView";
import {TKUIMxMIndexProps, TKUIMxMIndexStyle} from "../mxm/TKUIMxMIndex";
import {TKUIServiceRealtimeInfoProps, TKUIServiceRealtimeInfoStyle} from "../service/TKUIServiceRealtimeInfo";
import {TKUICardHeaderProps, TKUICardHeaderStyle} from "../card/TKUICardHeader";
import {TKUIMxMCardHeaderProps, TKUIMxMCardHeaderStyle} from "../mxm/TKUIMxMCardHeader";
import {TKUIMyBookingsProps, TKUIMyBookingsStyle} from "../booking/TKUIMyBookings";
import {TKUIMyBookingProps, TKUIMyBookingStyle} from "../booking/TKUIMyBooking";
import {TKUIHomeCardProps, TKUIHomeCardStyle} from "../sidebar/TKUIHomeCard";
import {TKUIActiveTripProps, TKUIActiveTripStyle} from "../sidebar/TKUIActiveTrip";

/**
 * SDK configuration
 */
export const TKUIConfigForDoc = (props: TKUIConfig) => null;
TKUIConfigForDoc.displayName = 'TKUIConfig';

interface ITKUIConfigRequired {
    apiKey: string;
}

interface ITKUIConfigOptional {
    server: string;
    /**
     * Override for [default theme object]().
     * @ctype
     */
    theme: Partial<TKUITheme> | ((isDark: boolean) => Partial<TKUITheme>);
    /** @ctype */
    onInitState: (state: TKState) => void;
    /** @ctype */
    onUpdateState: (state: TKState, prevState: TKState) => void;
    /** @ctype */
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
    TKUIQueryLocationBox: TKComponentConfig<TKUIQueryLocationBoxProps, TKUIQueryLocationBoxStyle>;
    TKUIButton: TKComponentConfig<TKUIButtonProps, TKUIButtonStyle>;
    TKUISelect: TKComponentConfig<TKUISelectProps, TKUISelectStyle>;
    TKUICard: TKComponentConfig<TKUICardProps, TKUICardStyle>;
    TKUICardHeader: TKComponentConfig<TKUICardHeaderProps, TKUICardHeaderStyle>;
    TKUITripRow: TKComponentConfig<TKUITripRowProps, TKUITripRowStyle>;
    TKUITripTime: TKComponentConfig<TKUITripTimeProps, TKUITripTimeStyle>;
    TKUITrackTransport: TKComponentConfig<TKUITrackTransportProps, TKUITrackTransportStyle>;
    TKUIRoutingResultsView: TKComponentConfig<TKUIRoutingResultsViewProps, TKUIRoutingResultsViewStyle>;
    TKUITripOverviewView: TKComponentConfig<TKUITripOverviewViewProps, TKUITripOverviewViewStyle>;
    TKUISegmentOverview: TKComponentConfig<TKUISegmentOverviewProps, TKUISegmentOverviewStyle>;
    TKUIWCSegmentInfo: TKComponentConfig<TKUIWCSegmentInfoProps, TKUIWCSegmentInfoStyle>;
    TKUITimetableView: TKComponentConfig<TKUITimetableViewProps, TKUITimetableViewStyle>;
    TKUIServiceDepartureRow: TKComponentConfig<TKUIServiceDepartureRowProps, TKUIServiceDepartureRowStyle>;
    TKUIServiceView: TKComponentConfig<TKUIServiceViewProps, TKUIServiceViewStyle>;
    TKUITrainOccupancyInfo: TKComponentConfig<TKUITrainOccupancyInfoProps, TKUITrainOccupancyInfoStyle>;
    TKUIShareView: TKComponentConfig<TKUIShareViewProps, TKUIShareViewStyle>;
    TKUILocationDetailView: TKComponentConfig<TKUILocationDetailViewProps, TKUILocationDetailViewStyle>;
    TKUILocationDetailField: TKComponentConfig<TKUILocationDetailFieldProps, TKUILocationDetailFieldStyle>;
    TKUICookiesBanner: TKComponentConfig<TKUICookiesBannerProps, TKUICookiesBannerStyle>;
    TKUIMapView: TKComponentConfig<TKUIMapViewProps, TKUIMapViewStyle>;
    TKUIMapLocationIcon: TKComponentConfig<TKUIMapLocationIconProps, TKUIMapLocationIconStyle>;
    TKUITransportPin: TKComponentConfig<TKUITransportPinProps, TKUITransportPinStyle>;
    TKUIMapPopup: TKComponentConfig<TKUIMapPopupProps, TKUIMapPopupStyle>;
    TKUIMapLocationPopup: TKComponentConfig<TKUIMapLocationPopupProps, TKUIMapLocationPopupStyle>;
    TKUIMapShapes: TKComponentConfig<TKUIMapShapesProps, TKUIMapShapesStyle>;
    TKUIMapStreets: TKComponentConfig<TKUIMapStreetsProps, TKUIMapStreetsStyle>;
    TKUISidebar: TKComponentConfig<TKUISidebarProps, TKUISidebarStyle>;
    TKUIProfileView: TKComponentConfig<TKUIProfileViewProps, TKUIProfileViewStyle>;
    TKUIUserPriorities: TKComponentConfig<TKUIUserPrioritiesProps, TKUIUserPrioritiesStyle>;
    TKUIMyLocationMapIcon: TKComponentConfig<TKUIMyLocationMapIconProps, TKUIMyLocationMapIconStyle>;
    TKUIRealtimeVehicle: TKComponentConfig<TKUIRealtimeVehicleProps, TKUIRealtimeVehicleStyle>;
    TKUIDateTimePicker: TKComponentConfig<TKUIDateTimePickerProps, TKUIDateTimePickerStyle>;
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
    TKUIServiceSteps: TKComponentConfig<TKUIServiceStepsProps, TKUIServiceStepsStyle>;
    TKUIMxMView: TKComponentConfig<TKUIMxMViewProps, TKUIMxMViewStyle>;
    TKUIMxMIndex: TKComponentConfig<TKUIMxMIndexProps, TKUIMxMIndexStyle>;
    TKUIMxMCardHeader: TKComponentConfig<TKUIMxMCardHeaderProps, TKUIMxMCardHeaderStyle>;
    TKUIServiceRealtimeInfo: TKComponentConfig<TKUIServiceRealtimeInfoProps, TKUIServiceRealtimeInfoStyle>;
    TKUIMyBookings: TKComponentConfig<TKUIMyBookingsProps, TKUIMyBookingsStyle>;
    TKUIMyBooking: TKComponentConfig<TKUIMyBookingProps, TKUIMyBookingStyle>;
    TKUIHomeCard: TKComponentConfig<TKUIHomeCardProps, TKUIHomeCardStyle>;
    TKUIActiveTrip: TKComponentConfig<TKUIActiveTripProps, TKUIActiveTripStyle>;
}

export type TKUIConfig = ITKUIConfigRequired & Partial<ITKUIConfigOptional>;

// Did this to avoid refactor affecting all components after re-locating TKComponentDefaultConfig for documentation.
export type TKComponentDefaultConfig<P extends TKUIWithClasses<S, P>,S> = TKComponentDefaultConfigForExport<P,S>;