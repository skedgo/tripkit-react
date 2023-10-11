import { TKUITripRowStyle, TKUITripRowProps } from "../trip/TKUITripRow";
import { TKUIRoutingResultsViewProps, TKUIRoutingResultsViewStyle } from "../trip/TKUIRoutingResultsView";
import { TKUITheme } from "../jss/TKUITheme";
import { TKUICardProps, TKUICardStyle } from "../card/TKUICard";
import {
    TKUITripOverviewViewProps,
    TKUITripOverviewViewStyle
} from "../trip/TKUITripOverviewView";
import { TKUISegmentOverviewProps, TKUISegmentOverviewStyle } from "../trip/TKUISegmentOverview";
import { TKUIStreetsChartProps, TKUIStreetsChartStyle } from "../trip/TKUIStreetsChart";
import { TKUITimetableViewProps, TKUITimetableViewStyle } from "../service/TKUITimetableView";
import { TKUIServiceDepartureRowProps, TKUIServiceDepartureRowStyle } from "../service/TKUIServiceDepartureRow";
import { TKUIServiceViewProps, TKUIServiceViewStyle } from "../service/TKUIServiceView";
import { TKUIRoutingQueryInputProps, TKUIRoutingQueryInputStyle } from "../query/TKUIRoutingQueryInput";
import { TKUITripPlannerProps, TKUITripPlannerStyle } from "../trip-planner/TKUITripPlanner";
import { TKUITrainOccupancyInfoProps, TKUITrainOccupancyInfoStyle } from "../service/occupancy/TKUITrainOccupancyInfo";
import { TKUIShareViewProps, TKUIShareViewStyle } from "../share/TKUIShareView";
import { TKUILocationSearchProps, TKUILocationSearchStyle } from "../query/TKUILocationSearch";
import { TKUIFavouritesViewProps, TKUIFavouritesViewStyle } from "../favourite/TKUIFavouritesView";
import { TKUIFavouriteRowProps, TKUIFavouriteRowStyle } from "../favourite/TKUIFavouriteRow";
import { TKUIMapViewProps, TKUIMapViewStyle } from "../map/TKUIMapView";
import { TKUISidebarProps, TKUISidebarStyle } from "../sidebar/TKUISidebar";
import { TKUIProfileViewProps, TKUIProfileViewStyle } from "../options/TKUIProfileView";
import { TKUIUserPrioritiesProps, TKUIUserPrioritiesStyle } from "../options/TKUIUserPriorities";
import { TKUIMapLocationIconProps, TKUIMapLocationIconStyle } from "../map/TKUIMapLocationIcon";
import { TKUIMyLocationMapIconProps, TKUIMyLocationMapIconStyle } from "../map/TKUIMyLocationMapIcon";
import { TKUIRealtimeVehicleProps, TKUIRealtimeVehicleStyle } from "../map/TKUIRealtimeVehicle";
import { TKUIDateTimePickerProps, TKUIDateTimePickerStyle } from "../time/TKUIDateTimePicker";
import { TKUITransportPinProps, TKUITransportPinStyle } from "../map/TKUITransportPin";
import LatLng from "../model/LatLng";
import { TKUITooltipProps, TKUITooltipStyle } from "../card/TKUITooltip";
import { TKUIReportBtnProps, TKUIReportBtnStyle } from "../feedback/TKUIReportBtn";
import { TKUITransportOptionsViewProps, TKUITransportOptionsViewStyle } from "../options/TKUITransportOptionsView";
import { TKUITransportOptionsRowProps, TKUITransportOptionsRowStyle } from "../options/TKUITransportOptionsRow";
import { TKUIButtonProps, TKUIButtonStyle } from "../buttons/TKUIButton";
import { TKUITransportSwitchesViewProps, TKUITransportSwitchesViewStyle } from "../options/TKUITransportSwitchesView";
import { TKUISelectProps, TKUISelectStyle } from "../buttons/TKUISelect";
import { TKUIPrivacyOptionsViewProps, TKUIPrivacyOptionsViewStyle } from "../options/TKUIPrivacyOptionsView";
import { TKI18nMessages } from "../i18n/TKI18nProvider";
import { TKUITripTimeProps, TKUITripTimeStyle } from "../trip/TKUITripTime";
import { TKUITrackTransportProps, TKUITrackTransportStyle } from "../trip/TKUITrackTransport";
import { TKUILocationDetailFieldProps, TKUILocationDetailFieldStyle } from "../location/TKUILocationDetailField";
import { TKUICookiesBannerProps, TKUICookiesBannerStyle } from "../privacy/TKUICookiesBanner";
import { TKUIAlertsSummaryProps, TKUIAlertsSummaryStyle } from "../alerts/TKUIAlertsSummary";
import { TKUIAlertsViewProps, TKUIAlertsViewStyle } from "../alerts/TKUIAlertsView";
import { TKUIWaitingRequestProps, TKUIWaitingRequestStyle } from "../card/TKUIWaitingRequest";
import { TKUIMapPopupProps, TKUIMapPopupStyle } from "../map/TKUIMapPopup";
import { TKUIAutocompleteResultProps, TKUIAutocompleteResultStyle } from "../location_box/TKUIAutocompleteResult";
import { TKUILocationBoxProps, TKUILocationBoxStyle } from "../location_box/TKUILocationBox";
import { TKUICardCarouselProps, TKUICardCarouselStyle } from "../card/TKUICardCarousel";
import { TKUIAlertRowProps, TKUIAlertRowStyle } from "../alerts/TKUIAlertRow";
import { Tracker, InitializeOptions } from 'react-ga';
import { TrackerOptions } from "../analytics/GATracker";
import { TKUIErrorViewProps, TKUIErrorViewStyle } from "../error/TKUIErrorView";
import { TKState } from "./TKState";
import TKGeocodingOptions from "../geocode/TKGeocodingOptions";
import { TKComponentConfig } from "./TKComponentConfig";
import { TKComponentDefaultConfig as TKComponentDefaultConfigForExport } from "./TKComponentConfig";
import { TKUIWithClasses } from "../jss/StyleHelper";
import { TKUIServiceStepsProps, TKUIServiceStepsStyle } from "../trip/TKUIServiceSteps";
import { TKUIMapShapesProps, TKUIMapShapesStyle } from "../map/TKUIMapShapes";
import { TKUIMapStreetsProps, TKUIMapStreetsStyle } from "../map/TKUIMapStreets";
import { TKUIMapLocationPopupProps, TKUIMapLocationPopupStyle } from "../map/TKUIMapLocationPopup";
import { TKUIMxMViewProps, TKUIMxMViewStyle } from "../mxm/TKUIMxMView";
import { TKUIMxMIndexProps, TKUIMxMIndexStyle } from "../mxm/TKUIMxMIndex";
import { TKUIServiceRealtimeInfoProps, TKUIServiceRealtimeInfoStyle } from "../service/TKUIServiceRealtimeInfo";
import { TKUICardHeaderProps, TKUICardHeaderStyle } from "../card/TKUICardHeader";
import { TKUIMxMCardHeaderProps, TKUIMxMCardHeaderStyle } from "../mxm/TKUIMxMCardHeader";
import { TKUIMyBookingsProps, TKUIMyBookingsStyle } from "../booking/TKUIMyBookings";
import { TKUIMyBookingProps, TKUIMyBookingStyle } from "../booking/TKUIMyBooking";
import { TKUIHomeCardProps, TKUIHomeCardStyle } from "../sidebar/TKUIHomeCard";
import { TKUIActiveTripProps, TKUIActiveTripStyle } from "../sidebar/TKUIActiveTrip";
import { TKUIStreetStepProps, TKUIStreetStepStyle } from "../trip/TKUIStreetStep";
import { TKUIBookingCardClientProps, TKUIMxMBookingCardProps, TKUIMxMBookingCardStyle } from "../mxm/TKUIMxMBookingCard";
import TKUserProfile from "../model/options/TKUserProfile";
import { TKUIStripePaymentCardClientProps, TKUIStripePaymentCardProps, TKUIStripePaymentCardStyle } from "../stripekit/TKUIStripePaymentCard";
import { TKUIMxMCollectNearbyCardProps, TKUIMxMCollectNearbyCardStyle } from "../mxm/TKUIMxMCollectNearbyCard";
import { TKUIModeLocationRowProps, TKUIModeLocationRowStyle } from "../mxm/TKUIModeLocationRow";
import Trip from "../model/trip/Trip";
import { TKUIPagerControlProps, TKUIPagerControlStyle } from "../card/TKUIPagerControl";
import Segment from "../model/trip/Segment";
import RoutingQuery from "../model/RoutingQuery";
import { TKUIVehicleAvailabilityProps, TKUIVehicleAvailabilityStyle } from "../location/TKUIVehicleAvailability";
import { TKUILocationDetailViewProps, TKUILocationDetailViewStyle } from "../location/TKUILocationDetailView";
import { TKUISubscriptionProps, TKUISubscriptionStyle } from "../sidebar/TKUISubscription";
import { TKUISubscriptionViewProps, TKUISubscriptionViewStyle } from "../sidebar/TKUISubscriptionView";
import { TripGoApiHeadersMap } from "../api/TripGoApi";
import { TKUIMyBookingGroupProps, TKUIMyBookingGroupStyle } from "../booking/TKUIMyBookingGroup";

/**
 * SDK configuration
 */
export const TKUIConfigForDoc = (props: TKUIConfig) => null;
TKUIConfigForDoc.displayName = 'TKUIConfig';

interface ITKUIConfigRequired {
    /**
     * Allows to specify the api key to be used to access the TripGo API services.
     * @order 1
     * @divider
     */
    apiKey: string;
}

export interface IThemeCreatorProps {
    isDark: boolean;
    isHighContrast: boolean;
}
export interface TKUIGAConfig {
    tracker: TrackerOptions;
    // It's checked before every GA event, allowing to enable / disable tracking
    // dynamically, e.g. depending con cookies / tracking consent.
    isEnabled?: () => boolean;  // () => true; by default
    isOldUA?: boolean;
}

interface ITKUIConfigOptional {
    /**
     * Allows to specify the base url of the TripGo api services.
     */
    apiServer: string;
    /**
     * It allows to amend (add, change, remove) the default headers sent along TripGo api requests by specifying a map from headers to values,
     * that will be used to override the defaults in the following way:
     * 
     * ```
     * {
     *   ...defaultHeaders,
     *   ...apiHeaders
     * }
     * ```
     * 
     * Also, to remove an existing (default) header you can map its key to `undefined`. Next is a possible value:
     * 
     * ```
     * {
     *   "X-Tsp-Client-UserId": "1234",
     *   "Accept-Language": undefined
     * }
     * ```
     * Which adds "X-Tsp-Client-UserId" and removes "Accept-Language".
     * It also allows to specify the headers map through a function of the request url, useful to selectively ammend headers
     * depending on the url.
     *      
     * @ctype TripGoApiHeadersMap | <br> 
     * (props: { requestUrl: URL }) => TripGoApiHeadersMap | undefined
     */
    apiHeaders: TripGoApiHeadersMap | ((params: { defaultHeaders: TripGoApiHeadersMap, requestUrl: URL }) => TripGoApiHeadersMap | undefined);
    /**
     * Override for [default theme object]().
     * @ctype
     */
    theme: Partial<TKUITheme> | ((props: IThemeCreatorProps) => Partial<TKUITheme>);
    /** 
     * @ignore
     * @ctype 
     */
    onInitState: (state: TKState) => void;
    /** 
     * @ignore
     */
    onUpdateState: (state: TKState, prevState: TKState) => void;
    /**
     * @ctype
     */
    initViewport: { center?: LatLng, zoom?: number };
    /** @ctype */
    defaultUserProfile: TKUserProfile;
    /**
     * @ignore
     * @ctype
     */
    resetUserProfile: boolean;
    /**
     * If true then region in global state will be fixed to that one of the initial
     * viewport. Useful when the api key covers multiple regions, but we want one
     * of them to be the central region (e.g. consider just transports of that region).
     * @ctype
     * @ignore
     */
    fixToInitViewportRegion: boolean;
    /**
     * @ctype
     */
    i18n: { locale: string, translations: TKI18nMessages } | Promise<{ locale: string, translations: TKI18nMessages }>;
    isDarkMode: boolean;
    /**
     * Allows to specify google analytics (GA) config to track user events to GA.
     * @ctype
     */
    analytics: {
        google?: TKUIGAConfig
    };
    /**
     * @ignore
     */
    tripCompareFc: (trip1: Trip, trip2: Trip) => number;
    /**
     * @ignore     
     */
    computeModeSetsBuilder: (defaultFunction: (query: RoutingQuery, options: TKUserProfile) => string[][]) => (query: RoutingQuery, options: TKUserProfile) => string[][];
    /**
     * @ignore     
     */
    booking: {
        renderBookingCard?: (props: TKUIBookingCardClientProps) => JSX.Element;
        enabled?: (segment: Segment) => boolean;    // () => true, by default
    };
    /**
     * @ignore     
     */
    payment: {
        renderPaymentCard: (props: TKUIStripePaymentCardClientProps) => React.ReactNode;
        stripePublicKey?: string;
    };
    /**
     * @ctype
     */
    geocoding: Partial<TKGeocodingOptions> | ((defaultOptions: TKGeocodingOptions) => Partial<TKGeocodingOptions>);
    /**
     * Config for [](TKUITripPlanner)
     * @ctype TKComponentConfig<TKUITripPlannerProps, TKUITripPlannerStyle>
     */
    TKUITripPlanner: TKComponentConfig<TKUITripPlannerProps, TKUITripPlannerStyle>;
    /**
     * Config for [](TKUILocationBox)
     * @ctype TKComponentConfig<TKUILocationBoxProps, TKUILocationBoxStyle>
     */
    TKUILocationBox: TKComponentConfig<TKUILocationBoxProps, TKUILocationBoxStyle>;
    TKUILocationSearch: TKComponentConfig<TKUILocationSearchProps, TKUILocationSearchStyle>;
    TKUIFavouritesView: TKComponentConfig<TKUIFavouritesViewProps, TKUIFavouritesViewStyle>;
    TKUIFavouriteRow: TKComponentConfig<TKUIFavouriteRowProps, TKUIFavouriteRowStyle>;
    TKUIRoutingQueryInput: TKComponentConfig<TKUIRoutingQueryInputProps, TKUIRoutingQueryInputStyle>;
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
    TKUIStreetsChart: TKComponentConfig<TKUIStreetsChartProps, TKUIStreetsChartStyle>;
    TKUITimetableView: TKComponentConfig<TKUITimetableViewProps, TKUITimetableViewStyle>;
    TKUIServiceDepartureRow: TKComponentConfig<TKUIServiceDepartureRowProps, TKUIServiceDepartureRowStyle>;
    TKUIServiceView: TKComponentConfig<TKUIServiceViewProps, TKUIServiceViewStyle>;
    TKUITrainOccupancyInfo: TKComponentConfig<TKUITrainOccupancyInfoProps, TKUITrainOccupancyInfoStyle>;
    TKUIShareView: TKComponentConfig<TKUIShareViewProps, TKUIShareViewStyle>;
    /**
     * Config for [](TKUILocationDetailView)
     * @ctype TKComponentConfig<TKUILocationDetailViewProps, TKUILocationDetailViewStyle>
     */
    TKUILocationDetailView: TKComponentConfig<TKUILocationDetailViewProps, TKUILocationDetailViewStyle>;
    TKUILocationDetailField: TKComponentConfig<TKUILocationDetailFieldProps, TKUILocationDetailFieldStyle>;
    /**
     * Config for [](TKUIVehicleAvailability)
     * @ctype TKComponentConfig<TKUIVehicleAvailabilityProps, TKUIVehicleAvailabilityStyle>
     */
    TKUIVehicleAvailability: TKComponentConfig<TKUIVehicleAvailabilityProps, TKUIVehicleAvailabilityStyle>;
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
    TKUIStreetStep: TKComponentConfig<TKUIStreetStepProps, TKUIStreetStepStyle>;
    TKUIMxMView: TKComponentConfig<TKUIMxMViewProps, TKUIMxMViewStyle>;
    TKUIMxMIndex: TKComponentConfig<TKUIMxMIndexProps, TKUIMxMIndexStyle>;
    TKUIMxMCardHeader: TKComponentConfig<TKUIMxMCardHeaderProps, TKUIMxMCardHeaderStyle>;
    TKUIServiceRealtimeInfo: TKComponentConfig<TKUIServiceRealtimeInfoProps, TKUIServiceRealtimeInfoStyle>;
    TKUIMyBookings: TKComponentConfig<TKUIMyBookingsProps, TKUIMyBookingsStyle>;
    TKUIMyBooking: TKComponentConfig<TKUIMyBookingProps, TKUIMyBookingStyle>;
    TKUIMyBookingGroup: TKComponentConfig<TKUIMyBookingGroupProps, TKUIMyBookingGroupStyle>;
    TKUIMxMBookingCard: TKComponentConfig<TKUIMxMBookingCardProps, TKUIMxMBookingCardStyle>;
    TKUIMxMCollectNearbyCard: TKComponentConfig<TKUIMxMCollectNearbyCardProps, TKUIMxMCollectNearbyCardStyle>;
    TKUIModeLocationRow: TKComponentConfig<TKUIModeLocationRowProps, TKUIModeLocationRowStyle>;
    TKUIHomeCard: TKComponentConfig<TKUIHomeCardProps, TKUIHomeCardStyle>;
    TKUIActiveTrip: TKComponentConfig<TKUIActiveTripProps, TKUIActiveTripStyle>;
    TKUISubscription: TKComponentConfig<TKUISubscriptionProps, TKUISubscriptionStyle>;
    TKUISubscriptionView: TKComponentConfig<TKUISubscriptionViewProps, TKUISubscriptionViewStyle>;
    TKUIStripePaymentCard: TKComponentConfig<TKUIStripePaymentCardProps, TKUIStripePaymentCardStyle>;
    TKUIPagerControl: TKComponentConfig<TKUIPagerControlProps, TKUIPagerControlStyle>;
}

export type TKUIConfig = ITKUIConfigRequired & Partial<ITKUIConfigOptional>;

// Did this to avoid refactor affecting all components after re-locating TKComponentDefaultConfig for documentation.
export type TKComponentDefaultConfig<P extends TKUIWithClasses<S, P>, S> = TKComponentDefaultConfigForExport<P, S>;