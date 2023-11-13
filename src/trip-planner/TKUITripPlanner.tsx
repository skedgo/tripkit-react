import React, { ReactNode, useContext } from "react";
import LatLng from "../model/LatLng";
import Modal from 'react-modal';
import Util from "../util/Util";
import TKUITimetableView, { TKUITimetableViewHelpers } from "../service/TKUITimetableView";
import TKUIRoutingResultsView, { TKUIRoutingResultsViewHelpers } from "../trip/TKUIRoutingResultsView";
import { IServiceResultsContext, ServiceResultsContext } from "../service/ServiceResultsProvider";
import { IRoutingResultsContext, RoutingResultsContext } from "./RoutingResultsProvider";
import TKUIServiceView, { TKUIServiceViewHelpers } from "../service/TKUIServiceView";
import TKUITripOverviewView from "../trip/TKUITripOverviewView";
import { TKUIWithClasses, TKUIWithStyle, overrideClass } from "../jss/StyleHelper";
import { tKUITripPlannerDefaultStyle, wideCardWidth } from "./TKUITripPlanner.css";
import TKUIRoutingQueryInput, { TKUIRoutingQueryInputHelpers } from "../query/TKUIRoutingQueryInput";
import Trip from "../model/trip/Trip";
import TKUICardCarousel from "../card/TKUICardCarousel";
import StopLocation from "../model/StopLocation";
import TKUIProfileView from "../options/TKUIProfileView";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, PropsMapper, TKPropsOverride } from "../config/TKConfigHelper";
import { Subtract } from "utility-types";
import TKUILocationSearch, { TKUILocationSearchHelpers } from "../query/TKUILocationSearch";
import Location from "../model/Location";
import RoutingQuery, { TimePreference } from "../model/RoutingQuery";
import TKUIFavouritesView from "../favourite/TKUIFavouritesView";
import Favourite from "../model/favourite/Favourite";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import FavouritesData from "../data/FavouritesData";
import TKUIMapView, { TKUIMapPadding, TKUIMapViewClientProps, TKUIMapViewHelpers } from "../map/TKUIMapView";
import TKUISidebar from "../sidebar/TKUISidebar";
import { TKUIViewportUtilProps, useResponsiveUtil } from "../util/TKUIResponsiveUtil";
import classNames from "classnames";
import { TKUISlideUpPosition } from "../card/TKUISlideUp";
import DateTimeUtil from "../util/DateTimeUtil";
import GeolocationData from "../geocode/GeolocationData";
import TKUIReportBtn from "../feedback/TKUIReportBtn";
import TKUITransportOptionsView from "../options/TKUITransportOptionsView";
import { IOptionsContext, OptionsContext } from "../options/OptionsProvider";
import { TKUserPosition } from "../util/GeolocationUtil";
import TKUIWaitingRequest, { TKRequestStatus } from "../card/TKUIWaitingRequest";
import DeviceUtil from "../util/DeviceUtil";
import { CardPresentation, TKUICardRaw } from "../card/TKUICard";
import { genClassNames } from "../css/GenStyle.css";
import Segment from "../model/trip/Segment";
import { cardSpacing } from "../jss/TKUITheme";
import Environment from "../env/Environment";
import { TKUILocationBoxRef } from "../location_box/TKUILocationBox";
import TKUIMxMView, { TKUIMxMViewHelpers } from "../mxm/TKUIMxMView";
import TKUIHomeCard from "../sidebar/TKUIHomeCard";
import TKUIMyBookings from "../booking/TKUIMyBookings";
import { IAccessibilityContext, TKAccessibilityContext } from "../config/TKAccessibilityProvider";
import CarPodLocation from "../model/location/CarPodLocation";
import TKUILocationDetail from "../location/TKUILocationDetailView";
import { BookingAction, ConfirmationPrompt } from "../model/trip/BookingInfo";
import UIUtil from "../util/UIUtil";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import { TKError } from "../error/TKError";
import { ERROR_LOADING_DEEP_LINK } from "../error/TKErrorHelper";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import RoutingResults from "../model/trip/RoutingResults";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     * @ignore
     */
    userLocationPromise?: Promise<LatLng>;
    renderTopRight?: () => React.ReactNode;
    transportSettingsUI?: "BRIEF" | "FULL" | "BRIEF_TO_FULL";
    hideSearch?: boolean;
}

interface IConsumedProps extends IRoutingResultsContext, IServiceResultsContext, TKUIViewportUtilProps, IOptionsContext, IAccessibilityContext {
    directionsView: boolean,
    onDirectionsView: (onDirectionsView: boolean) => void
}

export interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUITripPlannerDefaultStyle>

export type TKUITripPlannerProps = IProps;
export type TKUITripPlannerStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripPlanner {...props} />,
    styles: tKUITripPlannerDefaultStyle,
    classNamePrefix: "TKUITripPlanner"
};

interface CardViewData {
    viewId: string;
    renderCard: () => ReactNode;
    mapProps?: TKUIMapViewClientProps;
}

interface IState {
    mapView: boolean;
    showSidebar: boolean;
    showTransportSettings: boolean;
    showMyBookings?: boolean;
    showFavourites: boolean;
    showLocationDetailsFor?: Location;
    tripUpdateStatus?: TKRequestStatus;
    // Need to put this elem into the state so when instantiated it triggers a re-render on consumer TKUILocationSearch.
    searchMenuPanelElem?: HTMLDivElement;
    fadeOutHome: boolean;
    fadeOutHomeBounce: boolean;
    cardStack: CardViewData[];
}

const modalContainerId = "mv-modal-panel";
const mainContainerId = "mv-main-panel";

class TKUITripPlanner extends React.Component<IProps, IState> {

    public static defaultProps: Partial<IProps> = {
        transportSettingsUI: "BRIEF_TO_FULL"
    };

    private ref: any;
    private appMainRef: any;
    private locSearchBoxRef?: TKUILocationBoxRef = undefined;

    constructor(props: IProps) {
        super(props);
        this.state = {
            showSidebar: false,
            showTransportSettings: false,
            mapView: false,
            showFavourites: false,
            showLocationDetailsFor: undefined,
            fadeOutHome: false,
            fadeOutHomeBounce: false,
            cardStack: []
        };
        TKUICardRaw.modalContainerId = modalContainerId;
        TKUICardRaw.mainContainerId = mainContainerId;

        (this.props.userLocationPromise ||
            GeolocationData.instance.requestCurrentLocation(true, true)
                .then((userPosition: TKUserPosition) => userPosition.latLng))
            .then((userLocation: LatLng) => {
                // Don't fit map to user position if query from or to were already set (and are not unresolved current).
                // Avoids jumping to user location on shared links.
                const queryFrom = this.props.query.from;
                const queryTo = this.props.query.to;
                if (queryFrom !== null && !(queryFrom.isCurrLoc() && !queryFrom.isResolved()) ||
                    queryTo !== null && !(queryTo.isCurrLoc() && !queryTo.isResolved())) {
                    return;
                }
                this.props.setViewport(userLocation, 13);
            })
            .catch((error) => console.log(error));

        this.props.enableTabbingDetection();

        this.onShowSettings = this.onShowSettings.bind(this);
        this.onShowTransportSettings = this.onShowTransportSettings.bind(this);
        this.onFavouriteClicked = this.onFavouriteClicked.bind(this);
        this.onRequestAlternativeRoutes = this.onRequestAlternativeRoutes.bind(this);
        this.setFadeOutHome = this.setFadeOutHome.bind(this);
        this.onBookingAction = this.onBookingAction.bind(this);
        this.onShowBookingTrip = this.onShowBookingTrip.bind(this);
        this.pushCardView = this.pushCardView.bind(this);
        this.popCardView = this.popCardView.bind(this);

        // For development:
        // RegionsData.instance.requireRegions().then(()=> {
        // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200942")
        // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "AU_NSW_Sydney-Central Station Railway Square-bus")
        // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200070")
        // StopsData.instance.getStopFromCode("AU_ACT_Canberra", "AU_ACT_Canberra-P4937")
        // StopsData.instance.getStopFromCode("AU_ACT_Canberra", "P3418")
        // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200060") // Central Station
        //     .then((stop: StopLocation) => {
        //             this.props.onStopChange(stop);
        //         }
        //     )
        // });
    }
    private onShowSettings() {
        this.props.setShowUserProfile(true);
    }

    private onShowTransportSettings() {
        this.setState({ showTransportSettings: true });
    }

    private onFavouriteClicked(favourite: Favourite) {
        if (favourite instanceof FavouriteStop) {
            this.props.onQueryUpdate({ to: favourite.stop });
            this.props.onStopChange(favourite.stop);
        } else if (favourite instanceof FavouriteLocation) {
            this.props.onQueryUpdate({ from: Location.createCurrLoc(), to: favourite.location, timePref: TimePreference.NOW });
            this.props.onDirectionsView(true);
        } else if (favourite instanceof FavouriteTrip) {
            this.props.onQueryUpdate({ from: favourite.from, to: favourite.to, timePref: TimePreference.NOW });
            this.props.onDirectionsView(true);
        }
        FavouritesData.recInstance.add(favourite);
    }

    private isShowTripDetail(props?: IProps) {
        props = props ? props : this.props;
        return props.tripDetailsView && props.selectedTrip
    }

    private isShowServiceDetail() {
        return this.props.selectedService;
    }

    /**
     * If this.ref wasn't computed use body height. Notice this may cause issues if
     * body's height doesn't coincide with parent height, and we actually want parent
     * height.
     */
    private getContainerHeight(): number {
        return this.ref ? this.ref.offsetHeight : (window as any).document.body.offsetHeight;
    }

    private onRequestAlternativeRoutes(segment: Segment) {
        const targetSegment = segment.isContinuation ? segment.prevSegment()! : segment;
        this.props.onQueryUpdate({
            from: targetSegment.from,
            time: DateTimeUtil.momentFromIsoWithTimezone(targetSegment.startTime)
        });
        this.props.onTripDetailsView(false);
    }

    private pushCardView(props: CardViewData) {
        this.setState(prevState => {
            const prevStack = prevState.cardStack.filter(cardData => cardData.viewId !== props.viewId);
            return ({
                cardStack: [...prevStack, props]
            });
        });
    }

    // private popCardView(props: { type?: string } = {}) {
    private popCardView() {
        this.setState(prevState => {
            const prevCardStack = prevState.cardStack;
            return ({
                cardStack: prevCardStack.slice(0, prevState.cardStack.length - 1)
            });
        });
    }

    private onShowTripUrl(tripUrl: string) {
        const { onWaitingStateLoad } = this.props;
        onWaitingStateLoad(true);
        TripGoApi.apiCallUrlT(TripGoApi.defaultToVersion(tripUrl, TripGoApi.apiVersion), NetworkUtil.MethodType.GET, RoutingResults)
            .then((routingResults: RoutingResults) => {
                onWaitingStateLoad(false);
                if (this.state.showMyBookings) {
                    this.setState({ showMyBookings: false });
                }
                if (this.props.directionsView) {
                    this.props.onDirectionsView(false);
                    this.props.onQueryChange(RoutingQuery.create());
                }
                const trips = routingResults.groups;
                if (trips && trips.length > 0) {
                    const selectedTrip = trips[0];
                    this.pushCardView({
                        viewId: "RELATED_TRIP",
                        renderCard: () =>
                            <TKUIMxMView
                                trip={trips[0]}
                                onTripSegmentSelected={() => { }}
                                onRequestClose={() => this.popCardView()}
                            />,
                        mapProps: {
                            trip: selectedTrip
                        }
                    })
                }
            })
            .catch((error: Error) => onWaitingStateLoad(false,
                new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false, error.stack)));
    }

    private onShowBookingTrip(booking: ConfirmedBookingData) {
        const { onWaitingStateLoad, onTripJsonUrl, onTripDetailsView, setSelectedTripSegment } = this.props;
        const tripUrl = booking.trips?.[0]!;
        onWaitingStateLoad(true);
        TripGoApi.apiCallUrlT(TripGoApi.defaultToVersion(tripUrl, TripGoApi.apiVersion), NetworkUtil.MethodType.GET, RoutingResults)
            .then((routingResults: RoutingResults) => {
                onWaitingStateLoad(false);
                if (this.state.showMyBookings) {
                    this.setState({ showMyBookings: false });
                }
                const trips = routingResults.groups;
                if (trips && trips.length > 0) {
                    const bookingId = booking?.id
                    const selectedTrip = trips[0];
                    const selectedSegment = selectedTrip.segments.find(segment =>
                        segment.booking?.confirmation?.purchase?.id === bookingId);
                    this.pushCardView({
                        viewId: "RELATED_TRIP",
                        renderCard: () =>
                            <TKUIMxMView
                                trip={trips[0]}
                                onTripSegmentSelected={() => { }}
                                onRequestClose={() => this.popCardView()}
                                selectedTripSegment={selectedSegment}
                            />,
                        mapProps: {
                            trip: selectedTrip
                        }
                    })
                }
            })
            .catch((error: Error) => onWaitingStateLoad(false,
                new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false, error.stack)));
    }

    private onBookingAction(action: BookingAction) {
        const { onQueryChange, onComputeTripsForQuery, selectedTrip: trip, refreshSelectedTrip } = this.props;
        const requestRefresh = () => refreshSelectedTrip().then(() => { });
        if (action.type === "REQUESTANOTHER") {
            onQueryChange(RoutingQuery.create());
            onComputeTripsForQuery(false);
        } else if (action.type === "SHOW_RELATED_TRIP") {
            this.onShowTripUrl(action.internalURL);
            // onWaitingStateLoad(true);
            // onTripJsonUrl(action.internalURL)
            //     .then((trips) => {
            //         onWaitingStateLoad(false);
            //         // if (selectedSegmentId && trips && trips.length > 0) {
            //         //     const selectedTrip = trips[0];
            //         //     const selectedSegment = selectedTrip.segments.find(segment => segment.id === selectedSegmentId);
            //         //     selectedSegment && tKState.setSelectedTripSegment(selectedSegment);
            //         // }
            //         // tKState.onTripDetailsView(true);
            //         if (trips && trips.length > 0) {
            //             this.pushCardView({
            //                 viewId: "RELATED_TRIP",
            //                 renderCard: () =>
            //                     <TKUIMxMView
            //                         trip={trips[0]}
            //                         onTripSegmentSelected={() => { }}
            //                         onRequestClose={() => this.popCardView()}
            //                     />,
            //             });
            //             onQueryChange(RoutingQuery.create());
            //             // onComputeTripsForQuery(true);
            //         }
            //     })
            //     .catch((error: Error) => onWaitingStateLoad(false,
            //         new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false, error.stack)));
        } else if (action.confirmation || action.confirmationMessage) {
            const confirmationPrompt = action.confirmation
                ?? Object.assign(new ConfirmationPrompt(), { message: action.confirmationMessage }) // To maintain backward compatibility with old BE.
            UIUtil.confirmMsg({
                message: confirmationPrompt.message,
                confirmLabel: confirmationPrompt.confirmActionTitle || "Yes",
                cancelLabel: confirmationPrompt.abortActionTitle || "No",
                onConfirm: () => {
                    // setWaiting?.(true);
                    TripGoApi.apiCallUrl(action.internalURL, NetworkUtil.MethodType.GET)
                        // NetworkUtil.delayPromise(10)({})     // For testing
                        .then(bookingForm => {
                            // Workaround for (selected) trip with empty ("") updateUrl.
                            if (trip && !trip.updateURL
                                && bookingForm?.refreshURLForSourceObject) {    // Not sure if it always came a booking form.
                                trip.updateURL = bookingForm.refreshURLForSourceObject;
                            }
                            return requestRefresh();
                        })
                        .catch(UIUtil.errorMsg)
                    // .finally(() => setWaiting?.(false));
                }
            });
        } else if (action.externalURL) {
            window.open(action.externalURL, "_self");
        }
    }

    public render(): React.ReactNode {
        const props = this.props;
        const { isUserTabbing, classes, t } = this.props;
        const directionsView = this.props.directionsView;
        const emptyCardStack = this.state.cardStack.length === 0;
        const searchBar =
            !this.props.hideSearch && !directionsView && !(this.props.portrait && this.props.selectedService) &&
            emptyCardStack &&
            <div>
                <TKUILocationSearchHelpers.TKStateProps>
                    {stateProps =>
                        <TKUILocationSearch
                            {...stateProps}
                            onDirectionsClick={() => {
                                this.props.onQueryChange(Util.iAssign(this.props.query, { from: Location.createCurrLoc() }));
                                this.props.onDirectionsView(true);
                            }}
                            onShowSideMenuClicked={() => {
                                this.setState({ showSidebar: true });
                            }}
                            onLocationBoxRef={(ref: TKUILocationBoxRef) => this.locSearchBoxRef = ref}
                            onMenuVisibilityChange={open => this.setFadeOutHome(open)}
                        />
                    }
                </TKUILocationSearchHelpers.TKStateProps>
                <div className={classes.searchMenuContainer}
                    ref={(ref) => ref && ref !== this.state.searchMenuPanelElem && this.setState({ searchMenuPanelElem: ref })} />
            </div>;
        const sideBar =
            <TKUISidebar
                open={this.state.showSidebar && !directionsView}
                onRequestClose={() => {
                    return this.setState({ showSidebar: false });
                }}
                onShowSettings={this.onShowSettings}
                onShowFavourites={() => this.setState({ showFavourites: true })}
                parentElement={this.ref}
                appMainElement={this.appMainRef}
            />;
        const settings = this.props.showUserProfile &&
            <TKUIProfileView
                onRequestClose={() => this.props.setShowUserProfile(false)}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.UP,
                    modalUp: { top: cardSpacing(this.props.landscape), unit: 'px' },
                    draggable: false
                }}
            />;
        const transportSettings = this.state.showTransportSettings &&
            <TKUITransportOptionsView
                value={this.props.userProfile}
                onChange={this.props.onUserProfileChange}
                onRequestClose={() => this.setState({ showTransportSettings: false })}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.UP,
                    draggable: false,
                    modalUp: { top: cardSpacing(this.props.landscape), unit: 'px' },
                    modalDown: { top: this.getContainerHeight() - 145, unit: 'px' }
                }}
            />;
        const myBookings = this.state.showMyBookings &&
            <TKUIMyBookings
                onRequestClose={() => this.setState({ showMyBookings: false })}
            />;
        const queryInput = directionsView &&
            !(this.props.tripDetailsView && this.props.selectedTrip) && // not displaying trip details view, and
            !this.props.selectedTripSegment &&    // not displaying MxM view
            emptyCardStack &&
            <TKUIRoutingQueryInputHelpers.TKStateProps>
                {stateProps =>
                    <TKUIRoutingQueryInput
                        title={t("Route")}
                        showTransportsBtn={this.props.landscape}
                        showTimeSelect={this.props.landscape}
                        sideDropdown={DeviceUtil.isTablet}
                        onTransportButtonClick={this.props.transportSettingsUI == "FULL" ? this.onShowTransportSettings : undefined}
                        onShowTransportOptions={this.props.transportSettingsUI == "BRIEF_TO_FULL" ? this.onShowTransportSettings : undefined}
                        resolveCurrLocation={this.props.query.from !== null && this.props.query.to !== null}
                        onClearClicked={() => {
                            this.props.onQueryChange(RoutingQuery.create());
                            this.props.onDirectionsView(false);
                        }}
                        // To avoid capturing focus when returning from trip details view (where query input renders again),
                        // since focus should be returned to 'Detail' btn on trip row.
                        shouldFocusAfterRender={!this.props.trips && this.props.isUserTabbing}
                        {...stateProps}
                    />
                }
            </TKUIRoutingQueryInputHelpers.TKStateProps>;
        const locationHasVehicleAvailability = this.state.showLocationDetailsFor && this.state.showLocationDetailsFor instanceof CarPodLocation && this.state.showLocationDetailsFor.supportsVehicleAvailability;
        const locationDetailView = this.state.showLocationDetailsFor &&
            this.state.showLocationDetailsFor.isResolved() &&
            !this.state.showLocationDetailsFor.isDroppedPin() &&
            this.state.showLocationDetailsFor.hasDetail !== false &&
            <TKUILocationDetail
                location={this.state.showLocationDetailsFor}
                key={this.state.showLocationDetailsFor.id}  // So changing location causes the component to be re-constructed.
                actions={directionsView ? (_, defaultActions) => defaultActions.slice(1) : undefined}
                cardProps={{
                    presentation: CardPresentation.SLIDE_UP,
                    slideUpOptions: {
                        initPosition: this.props.portrait ? TKUISlideUpPosition.DOWN : TKUISlideUpPosition.UP,
                        position: DeviceUtil.isTouch() ? undefined :
                            this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                        draggable: DeviceUtil.isTouch(),
                        modalUp: this.props.landscape ?
                            { top: (this.isShowTripDetail() || this.props.selectedTripSegment || locationHasVehicleAvailability) ? cardSpacing() : (directionsView ? 176 : 48) + 2 * cardSpacing(), unit: 'px' } :
                            { top: cardSpacing(false), unit: 'px' },
                        modalDown: { top: this.getContainerHeight() - 145, unit: 'px' },
                        zIndex: this.props.selectedTripSegment || locationHasVehicleAvailability ? 1006 : undefined,   // Workaround to make details card to be above TKUIMxMIndex card in MxM view.
                        ...locationHasVehicleAvailability && { containerClass: classes.wideCard }
                    },
                    onRequestClose: () => this.setState({ showLocationDetailsFor: undefined })
                }}
            />;
        const timetableView = this.isShowTimetable() ?
            <TKUITimetableViewHelpers.TKStateProps>
                {stateProps =>
                    <TKUITimetableView
                        {...stateProps}
                        cardProps={{
                            onRequestClose: () => this.showTimetableFor(undefined),
                            slideUpOptions: {
                                initPosition: TKUISlideUpPosition.UP,
                                // Hide, but don't close, when service is selected.
                                // position: this.props.selectedService ? TKUISlideUpPosition.HIDDEN : undefined,
                                position: this.props.selectedService ? TKUISlideUpPosition.HIDDEN : TKUISlideUpPosition.UP,
                                draggable: false,
                                modalUp: this.props.landscape ?
                                    { top: (directionsView ? 176 : 48) + 2 * cardSpacing(), unit: 'px' } :
                                    { top: cardSpacing(false), unit: 'px' },
                                modalDown: { top: this.getContainerHeight() - 40, unit: 'px' }
                            },
                            presentation: CardPresentation.SLIDE_UP
                        }}
                    />}
            </TKUITimetableViewHelpers.TKStateProps>
            : null;
        const serviceDetailView = this.isShowServiceDetail() ?
            <TKUIServiceViewHelpers.TKStateProps>
                {stateProps =>
                    <TKUIServiceView
                        {...stateProps}
                        cardProps={{
                            presentation: CardPresentation.SLIDE_UP,
                            slideUpOptions: {
                                initPosition: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                                position: DeviceUtil.isTouch() ? undefined :
                                    this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                                draggable: DeviceUtil.isTouch(),
                                modalUp: this.props.landscape ? { top: (directionsView ? 176 : 48) + 2 * cardSpacing(), unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
                                modalDown: { top: this.getContainerHeight() - 130, unit: 'px' }
                            },
                            onRequestClose: () => this.props.onServiceSelection(undefined)
                        }}
                    />}
            </TKUIServiceViewHelpers.TKStateProps> : null;
        const favouritesView = this.state.showFavourites && !directionsView &&
            <TKUIFavouritesView
                onFavouriteClicked={this.onFavouriteClicked}
                onRequestClose={() => { this.setState({ showFavourites: false }) }}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.UP,
                    draggable: DeviceUtil.isTouch(),
                    modalUp: this.props.landscape ? { top: 48 + 2 * cardSpacing(), unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
                    modalMiddle: { top: 55, unit: '%' },
                    modalDown: { top: this.getContainerHeight() - 80, unit: 'px' }
                }}
            />;
        const routingResultsView = directionsView && this.props.query.isComplete(true) && this.props.trips ?
            <TKUIRoutingResultsViewHelpers.TKStateProps>
                {stateProps =>
                    <TKUIRoutingResultsView
                        {...stateProps}
                        onDetailsClicked={() => this.props.onTripDetailsView(true)}
                        onTransportButtonClick={this.props.transportSettingsUI == "FULL" ? this.onShowTransportSettings : undefined}
                        onShowOptions={this.props.transportSettingsUI == "BRIEF_TO_FULL" ? this.onShowTransportSettings : undefined}
                        slideUpOptions={{
                            initPosition: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                            position: this.isShowTripDetail() || this.props.selectedTripSegment ? TKUISlideUpPosition.HIDDEN :
                                DeviceUtil.isTouch() ? undefined :
                                    this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                            draggable: DeviceUtil.isTouch(),
                            modalUp: this.props.landscape ? { top: 176 + 2 * cardSpacing(), unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
                            modalMiddle: { top: 55, unit: '%' },
                            modalDown: { top: 90, unit: '%' }
                        }}
                        showTimeSelect={this.props.portrait}
                        showTransportsBtn={this.props.portrait}
                    />}
            </TKUIRoutingResultsViewHelpers.TKStateProps> : null;
        const homeCard = searchBar && !favouritesView && !this.isShowTimetable() && emptyCardStack &&
            <div className={this.state.fadeOutHome ? genClassNames.animateFadeOut : genClassNames.animateFadeIn}>
                <TKUIHomeCard
                    onMyBookings={() => this.setState({ showMyBookings: true })}
                    styles={{
                        main: overrideClass({
                            maxHeight: this.getContainerHeight() - 48 - 3 * cardSpacing() // 48 is TKUILocationSearch height
                        })
                    }}
                />
            </div>
        let tripDetailView: any;
        if (this.isShowTripDetail()) {
            if (DeviceUtil.isTouch()) {
                tripDetailView =
                    <TKUITripOverviewView
                        value={this.props.selectedTrip!}
                        onRequestAlternativeRoutes={this.onRequestAlternativeRoutes}
                        onTripSegmentSelected={props.setSelectedTripSegment}
                        cardProps={{
                            onRequestClose: () => this.props.onTripDetailsView(false),
                            slideUpOptions: {
                                position: props.selectedTripSegment ? TKUISlideUpPosition.HIDDEN : undefined,
                                initPosition: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                                draggable: true,
                                modalUp: this.props.landscape ? { top: 5, unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
                                modalMiddle: { top: 55, unit: '%' },
                                modalDown: { top: 90, unit: '%' }
                            },
                            presentation: CardPresentation.SLIDE_UP
                        }}
                    />
            } else {
                const sortedTrips = this.props.trips || [];
                const selected = sortedTrips.indexOf(this.props.selectedTrip!);
                tripDetailView =
                    <TKUICardCarousel
                        selected={selected}
                        onChange={(selected: number) => this.props.onSelectedTripChange((this.props.trips || [])[selected])}
                        slideUpOptions={{
                            position: props.selectedTripSegment ? TKUISlideUpPosition.HIDDEN :
                                this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                            modalDown: { top: this.getContainerHeight() - 100, unit: 'px' },
                            draggable: false
                        }}
                        parentElement={this.ref}
                    >
                        {(registerHandle: (index: number, handle: any) => void) =>
                            sortedTrips
                                .map((trip: Trip, i: number) =>
                                    <div className={classes.carouselPage}>
                                        <TKUITripOverviewView
                                            value={trip}
                                            key={trip.getKey(String(i))}
                                            handleRef={(handleRef: any) => registerHandle(i, handleRef)}
                                            shouldFocusAfterRender={i === selected ? undefined : false}
                                            doNotStack={i !== selected}
                                            onTripSegmentSelected={props.setSelectedTripSegment}
                                            cardProps={{
                                                onRequestClose: () => this.props.onTripDetailsView(false),
                                                slideUpOptions: {
                                                    draggable: false,    // Needs to specify so it's needed by TKUIScrollForCard
                                                    showHandle: true
                                                },
                                                presentation: CardPresentation.NONE
                                            }}
                                        />
                                    </div>
                                )}
                    </TKUICardCarousel>;
            }
        }
        const mapPadding: TKUIMapPadding = {};
        if (this.props.landscape) {
            mapPadding.left = this.props.query.isEmpty() && !favouritesView && !serviceDetailView
                && !locationDetailView ? 0 : locationHasVehicleAvailability ? wideCardWidth + 82 : 500;
        } else {
            if (directionsView && this.props.trips) {
                mapPadding.bottom = this.getContainerHeight() * .50;
            }
            if (queryInput) {
                mapPadding.top = 100;
            } else {
                mapPadding.top = 50;
            }
            if (serviceDetailView || (!DeviceUtil.isTouch() && locationDetailView)) {
                mapPadding.bottom = this.getContainerHeight() * .55;
            }
        }
        // this.props.landscape ? {left: 500} :
        //     directionsView && this.props.trips ? {bottom: this.ref ? this.ref.offsetHeight * .45 : 20, top: 100} : undefined;
        let stateLoadError: React.ReactNode = null;
        if (this.props.stateLoadError) {
            stateLoadError = this.props.stateLoadError.message;
            if (Environment.isBeta() && this.props.stateLoadError.stack) {
                stateLoadError =
                    <React.Fragment>
                        {stateLoadError}
                        <div className={classes.stacktrace}>
                            {this.props.stateLoadError.stack}
                        </div>
                    </React.Fragment>
            }
        }
        // Include a close button on beta environment.
        const waitingRequest =
            <TKUIWaitingRequest
                status={this.state.tripUpdateStatus}
                message={this.props.waitingTripUpdate ? "Updating trip" :
                    this.props.tripUpdateError ? "Error updating trip" : stateLoadError}
                onDismiss={Environment.isBeta() && this.props.stateLoadError ? () => this.setState({ tripUpdateStatus: undefined }) : undefined}
            />;
        const mxMView = props.selectedTripSegment &&
            <TKUIMxMViewHelpers.TKStateProps>
                {stateProps => <TKUIMxMView {...stateProps} onRequestClose={() => props.setSelectedTripSegment(undefined)} parentElement={this.ref} />}
            </TKUIMxMViewHelpers.TKStateProps>

        const topCardView = this.state.cardStack.length > 0 ? this.state.cardStack[this.state.cardStack.length - 1] : undefined;
        return (
            <TKPropsOverride
                componentKey="TKUIBookingActions"
                propsOverride={{
                    onAction: this.onBookingAction
                }}
            >
                <TKPropsOverride
                    componentKey="TKUIMyBooking"
                    propsOverride={props => ({
                        onShowTrip: () => this.onShowBookingTrip(props.booking)
                    })}
                >
                    <div id={modalContainerId} className={classNames(classes.modalMain, genClassNames.root, isUserTabbing && classes.ariaFocusEnabled)}
                        ref={el => el && (this.ref = el)}
                        role="none"
                    >
                        <div id={mainContainerId} className={classes.main} ref={el => el && (this.appMainRef = el)} role="none">
                            <div className={classes.queryPanel} role="none">
                                {searchBar}
                                {homeCard}
                                {queryInput}
                            </div>
                            <div id="map-main" className={classes.mapMain}>
                                <TKUIMapViewHelpers.TKStateProps>
                                    {stateProps =>
                                        <TKUIMapView
                                            {...stateProps}
                                            hideLocations={this.props.trips !== undefined || this.props.selectedService !== undefined}
                                            padding={mapPadding}
                                            locationActionHandler={(loc: Location) => {
                                                if (loc instanceof StopLocation) {
                                                    return () => {
                                                        this.showTimetableFor(loc as StopLocation);
                                                        FavouritesData.recInstance.add(FavouriteStop.create(loc as StopLocation))
                                                    }
                                                } else if (loc.isCurrLoc()) {
                                                    return undefined;
                                                } else if (loc.isResolved() && !loc.isDroppedPin()) {
                                                    return () => this.setState({ showLocationDetailsFor: loc });
                                                }
                                                return undefined;
                                            }}
                                            mapClickBehaviour={directionsView ? "SET_FROM_TO" : "SET_TO"}
                                            rightClickMenu={[
                                                { label: t("Directions.from.here"), effect: "SET_FROM", effectFc: () => this.props.onDirectionsView(true) },
                                                { label: t("Directions.to.here"), effect: "SET_TO", effectFc: () => this.props.onDirectionsView(true) },
                                                ...!directionsView ? [{ label: t("What's.here?"), effect: "SET_TO" as any }] : []
                                            ]}
                                            {...topCardView?.mapProps}
                                        />
                                    }
                                </TKUIMapViewHelpers.TKStateProps>
                            </div>
                            <TKUIReportBtn className={classNames(classes.reportBtn, this.props.landscape ? classes.reportBtnLandscape : classes.reportBtnPortrait)} />
                            {sideBar}
                            {settings}
                            {locationDetailView}
                            {routingResultsView}
                            {tripDetailView}
                            {timetableView}
                            {serviceDetailView}
                            {transportSettings}
                            {myBookings}
                            {favouritesView}
                            {waitingRequest}
                            {this.props.renderTopRight &&
                                <div className={classes.renderTopRight}>
                                    {this.props.renderTopRight()}
                                </div>}
                            {mxMView}
                        </div>
                        {topCardView?.renderCard()}
                    </div>
                </TKPropsOverride>
            </TKPropsOverride>
        );
    }

    public componentDidMount() {
        // TODO: what happens if this.ref is not instantiated yet, or changes since trip planner is re-build?
        // E.g. refresh styles.
        Modal.setAppElement(this.ref);
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.shiftKey && e.metaKey && e.key === "m") {
                this.setState({ showTransportSettings: true });
                e.preventDefault();
            }
            if (e.shiftKey && e.metaKey && e.key === "b") {
                this.setState({ showMyBookings: true });
                e.preventDefault();
            }
        });

        // Focus location search box on web-app load.
        setTimeout(() => !this.props.directionsView && !this.props.query.to &&
            this.locSearchBoxRef && this.locSearchBoxRef.focus(), 2000);
    }

    private setFadeOutHome(fadeOutHome: boolean) {
        this.setState({ fadeOutHomeBounce: fadeOutHome });
        // Just bounce setting fadeOutHome to false, to avoid home to start appearing to immediatly dissapear. E.g.
        // one component was hidden to display another: loc datail -> other loc detail on drag pin, showing autocompletion results -> pin drop).
        if (fadeOutHome) {
            this.setState({ fadeOutHome: true });
        } else {
            setTimeout(() => this.state.fadeOutHomeBounce !== this.state.fadeOutHome && this.setState({ fadeOutHome: fadeOutHome }), 500);
        }
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void {
        if (!!this.state.showLocationDetailsFor !== !!prevState.showLocationDetailsFor) {
            if (this.state.showLocationDetailsFor) {
                this.setFadeOutHome(true);
            } else {
                this.setFadeOutHome(false);
            }
        }

        // If on search view and a stop is set as query from, then show timetable for the stop
        if (prevProps.query.from !== this.props.query.from && this.props.query.from && this.props.query.from instanceof StopLocation
            && !this.props.directionsView) {
            this.showTimetableFor(this.props.query.from as StopLocation);
        } else if (prevProps.query.to !== this.props.query.to && this.props.query.to && this.props.query.to instanceof StopLocation
            && !this.props.directionsView
            // Don't show timetable if it was the case that the location is a stop that was unresolved and become
            // resolved, which happens when loading a timetable web-app url. Timetable will be triggered by TKStateUrl.
            && !(prevProps.query.to && prevProps.query.to.id && prevProps.query.to.id === this.props.query.to.id)) {
            this.showTimetableFor(this.props.query.to as StopLocation);
        } else if (prevProps.query.to !== this.props.query.to && this.props.query.to && !this.props.directionsView // Set destination on search view
            && this.props.query.to.isResolved() && !this.props.query.to.isDroppedPin()
            && this.props.query.to !== this.state.showLocationDetailsFor) {
            this.setState({ showLocationDetailsFor: this.props.query.to })
        }

        if (this.state.showLocationDetailsFor &&
            (
                (prevProps.query.from === this.state.showLocationDetailsFor && !this.props.query.from) ||   // Hide from details if removed from
                (prevProps.query.to === this.state.showLocationDetailsFor && !this.props.query.to) ||   // Hide to details if removed to
                (!prevProps.directionsView && this.props.directionsView) || // Switched to directions view, so close location detail
                (prevProps.trips === undefined && this.props.trips !== undefined) ||    // Hide details if started computing trips
                (prevProps.trips !== undefined && this.props.trips === undefined)       // Hide details if cleared trips
            )
        ) {
            this.setState({ showLocationDetailsFor: undefined })
        }

        if (this.isShowTimetable() // Hide timetable if neither query from nor to are stops, and not displaying it for a trip segment.
            && (!this.props.query.from || !(this.props.query.from instanceof StopLocation))
            && (!this.props.query.to || !(this.props.query.to instanceof StopLocation))) {
            this.showTimetableFor(undefined);
        }

        // Hide timetable if start showing trips.
        if (prevProps.trips === undefined && this.props.trips !== undefined) {
            this.showTimetableFor(undefined);
        }
        if (!this.isShowTimetable(prevProps) && this.isShowTimetable() // Start displaying timetable
            || (this.isShowTimetable() && prevProps.stop !== this.props.stop) // Already displaying timetable, but clicked other stop
            || !prevState.showLocationDetailsFor && this.state.showLocationDetailsFor // Start displaying location details
        ) {
            this.setState({ showFavourites: false });
        }
        // Switched to directions view, so close timetable
        if (!prevProps.directionsView && this.props.directionsView && this.isShowTimetable()) {
            this.showTimetableFor(undefined);
        }
        // Showing trip details and query from/to changed (e.g. drag & frop of 'from' or 'to' pin), so set detail view
        // off (display routing results for new query). Notice it shouldn't be other causes of re-computing trips since
        // we are on trip details view.
        if (this.props.tripDetailsView &&
            prevProps.query.from && prevProps.query.to &&   // if from or to were null, then we have just set them (e.g. share trip link), so don't leave trip details view.
            (prevProps.query.from !== this.props.query.from || prevProps.query.to !== this.props.query.to)) {
            this.props.onTripDetailsView(false);
        }

        // Start waiting for trip update
        if (!prevProps.waitingTripUpdate && this.props.waitingTripUpdate) {
            this.setState({
                tripUpdateStatus: TKRequestStatus.wait
            })
        }

        // End waiting for trip update
        if (prevProps.waitingTripUpdate && !this.props.waitingTripUpdate) {
            this.setState({
                tripUpdateStatus: this.props.tripUpdateError ? TKRequestStatus.error : TKRequestStatus.success
            });
            setTimeout(() => this.setState({
                tripUpdateStatus: undefined
            }), 2000);
        }

        if (prevProps.waitingStateLoad !== this.props.waitingStateLoad) {
            const status = this.props.waitingStateLoad ? TKRequestStatus.wait :
                this.props.stateLoadError ? TKRequestStatus.error : undefined;
            this.setState({
                tripUpdateStatus: status
            });
            if (!Environment.isBeta() && status === TKRequestStatus.error) { // Don't hide error automatically on beta environment.
                setTimeout(() => this.setState({
                    tripUpdateStatus: undefined
                }), 4000);
            }
        }

        // Need to re-inject styles so css properties based on portrait / landscape take effect.
        // TODO: disable since it triggers the re-construction of TKUITripPlanner, which causes some issues.
        // See comment on StyleHelper.onRefreshStyles and on TKUITripPlanner.css.ts
        // if (prevProps.landscape !== this.props.landscape) {
        //     this.props.refreshStyles()
        // }
    }


    /**
     * Assumes timetables should show iff stop in global state is defined (not undefined).
     */
    private isShowTimetable(props?: IProps) {
        const targetProps = props || this.props;
        return targetProps.stop !== undefined;
    }

    private showTimetableFor(stop?: StopLocation) {
        this.props.onStopChange(stop);
    }
}

const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> =
    (props: { children: (props: IConsumedProps) => React.ReactNode }) => {
        const accessibilityContext = useContext(TKAccessibilityContext);
        const viewportProps = useResponsiveUtil();
        const optionsContext = useContext(OptionsContext);
        const routingContext = useContext(RoutingResultsContext);
        const serviceContext = useContext(ServiceResultsContext);
        return (
            <>
                {props.children!({
                    ...routingContext,
                    directionsView: routingContext.computeTripsForQuery,
                    onDirectionsView: routingContext.onComputeTripsForQuery,
                    ...serviceContext,
                    ...viewportProps,
                    ...optionsContext,
                    ...accessibilityContext
                })}
            </>
        );
    };

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({ ...inputProps, ...consumedProps })}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUITripPlanner, config, Mapper);