import React, { ReactNode, useContext, useState } from "react";
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
import TKUIFavouritesView, { TKUIFavouritesViewHelpers } from "../favourite/TKUIFavouritesView";
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
import TKUICard, { CardPresentation, TKUICardRaw } from "../card/TKUICard";
import { genClassNames } from "../css/GenStyle.css";
import Segment, { TripAvailability } from "../model/trip/Segment";
import { cardSpacing, colorWithOpacity } from "../jss/TKUITheme";
import Environment from "../env/Environment";
import { TKUILocationBoxRef } from "../location_box/TKUILocationBox";
import TKUIMxMView, { moveToNext, TKUIMxMViewHelpers } from "../mxm/TKUIMxMView";
import TKUIHomeCard from "../sidebar/TKUIHomeCard";
import TKUIMyBookings from "../booking/TKUIMyBookings";
import { IAccessibilityContext, TKAccessibilityContext } from "../config/TKAccessibilityProvider";
import CarPodLocation from "../model/location/CarPodLocation";
import TKUILocationDetail from "../location/TKUILocationDetailView";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import { TKError } from "../error/TKError";
import { ERROR_LOADING_DEEP_LINK } from "../error/TKErrorHelper";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import RoutingResults from "../model/trip/RoutingResults";
import TKUIVehicleAvailability from "../location/TKUIVehicleAvailability";
import ModeLocation from "../model/location/ModeLocation";
import LocationsResult from "../model/location/LocationsResult";
import PlannedTripsTracker from "../analytics/PlannedTripsTracker";
import { IFavouritesContext, TKFavouritesContext } from "../favourite/TKFavouritesProvider";
import { TKUIConfigContext } from "../config/TKUIConfigProvider";
import { IAccountContext, SignInStatus, TKAccountContext } from "../account/TKAccountContext";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { ReactComponent as IconTicket } from "../images/ic-ticket.svg";
import { bookingActionToHandler } from "../booking/TKUIBookingActions";
import { getTripBookingInfo } from "../trip/TripUtil";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     * @ignore
     */
    userLocationPromise?: Promise<LatLng>;
    renderTopRight?: () => React.ReactNode;
    transportSettingsUI?: "BRIEF" | "FULL" | "BRIEF_TO_FULL";
    hideSearch?: boolean;
    hideQueryInput?: boolean;
}

interface IConsumedProps extends IRoutingResultsContext, IServiceResultsContext, TKUIViewportUtilProps, IOptionsContext, IAccessibilityContext, IFavouritesContext, IAccountContext {
    directionsView: boolean,
    onDirectionsView: (onDirectionsView: boolean) => void,
    tkconfig: TKUIConfig
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

export interface CardViewData {
    viewId: string;
    renderCard: () => ReactNode;
    mapProps?: TKUIMapViewClientProps;
    onPop?: () => void;
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
        this.onShowBookingTrip = this.onShowBookingTrip.bind(this);
        this.pushCardView = this.pushCardView.bind(this);
        this.popCardView = this.popCardView.bind(this);
        this.onFavouriteTripQuery = this.onFavouriteTripQuery.bind(this);
        this.getBookingActions = this.getBookingActions.bind(this);

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

    private async onFavouriteTripQuery(favourite: FavouriteTrip) {
        const segmentsCopy = JSON.parse(JSON.stringify(favourite.pattern));
        segmentsCopy[0].startTime = DateTimeUtil.getNow().valueOf() / 1000;
        const requestBody = {
            config: { v: TripGoApi.apiVersion },
            segments: segmentsCopy
        };
        try {
            this.props.onWaitingStateLoad(true);
            const routingResults = await TripGoApi.apiCallT("waypoint.json", NetworkUtil.MethodType.POST, RoutingResults, requestBody);
            this.props.onWaitingStateLoad(false);
            if (this.state.showFavourites) {
                this.setState({ showFavourites: false });
            }
            const trips = routingResults.groups;
            if (trips && trips.length > 0) {
                const selectedTrip = trips[0];
                // Need to do this since TKUIMxMView doesn't render if there's no selected trip.
                // TODO: consider removing that limitation.
                this.props.onSelectedTripChange(selectedTrip);
                this.pushCardView({
                    viewId: "RELATED_TRIP",
                    renderCard: () =>
                        <TKUITripOverviewView
                            value={selectedTrip}
                            onTripSegmentSelected={this.props.setSelectedTripSegment}
                            cardProps={{
                                onRequestClose: () => {
                                    this.popCardView();
                                    this.props.onSelectedTripChange(undefined);
                                },
                                slideUpOptions: {
                                    position: this.props.selectedTripSegment ? TKUISlideUpPosition.HIDDEN : undefined,
                                    initPosition: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                                    draggable: true,
                                    modalUp: this.props.landscape ? { top: 5, unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
                                    modalMiddle: { top: 55, unit: '%' },
                                    modalDown: { top: 90, unit: '%' }
                                },
                                presentation: CardPresentation.SLIDE_UP
                            }}
                            actions={this.getBookingActions(selectedTrip)}
                        />,
                    mapProps: {
                        trip: selectedTrip,
                        readonly: true
                    }
                })
            }
        } catch (e) {
            this.props.onWaitingStateLoad(false, new TKError("Error loading trip", "", false));
        }
    }

    private onFavouriteClicked(favourite: Favourite) {
        if (favourite instanceof FavouriteStop) {
            this.props.onQueryUpdate({ to: favourite.stop });
            this.props.onStopChange(favourite.stop);
        } else if (favourite instanceof FavouriteLocation) {
            this.props.onQueryUpdate({ from: Location.createCurrLoc(), to: favourite.location, timePref: TimePreference.NOW });
            this.props.onDirectionsView(true);
        } else if (favourite instanceof FavouriteTrip) {
            this.onFavouriteTripQuery(favourite);
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

    private popCardView({ viewId }: { viewId?: string } = {}) {
        this.setState(prevState => {
            const prevCardStack = prevState.cardStack;
            const cardToPop = viewId ? prevCardStack.slice().reverse().find(cardData => cardData.viewId === viewId) : prevCardStack[prevCardStack.length - 1];
            cardToPop?.onPop?.();
            return ({
                cardStack: prevCardStack.filter(cardData => cardData !== cardToPop)
            });
        });
    }

    private clearCardStack() {
        this.state.cardStack.slice().forEach(() => this.popCardView());
        // this.setState({
        //     cardStack: []
        // })
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
                    this.onShowTrip(selectedTrip);
                }
            })
            .catch((error: Error) => onWaitingStateLoad(false,
                new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false, error.stack)));
    }

    private onShowBookingTrip(booking: ConfirmedBookingData) {
        const { onWaitingStateLoad } = this.props;
        const tripUrl = booking.trips?.[0]!;
        onWaitingStateLoad(true);
        TripGoApi.apiCallUrlT(TripGoApi.defaultToVersion(tripUrl, TripGoApi.apiVersion), NetworkUtil.MethodType.GET, RoutingResults)
            .then((routingResults: RoutingResults) => {
                onWaitingStateLoad(false);
                const trips = routingResults.groups;
                if (trips && trips.length > 0) {
                    const selectedTrip = trips[0];
                    this.onShowBookingCard(selectedTrip);
                }
            })
            .catch((error: Error) => onWaitingStateLoad(false,
                new TKError("Error loading trip", ERROR_LOADING_DEEP_LINK, false, error.stack)));
    }

    private getBookingActions(selectedTrip: Trip) {
        const { accountsSupported, status, tkconfig } = this.props;
        const { bookingSegment } = getTripBookingInfo(selectedTrip, tkconfig, status);
        const bookAction = bookingSegment && accountsSupported && status === SignInStatus.signedIn && tkconfig.booking?.renderBookingCard &&
            <TKUIButton
                icon={<IconTicket />}
                text={bookingSegment!.booking!.title}
                type={TKUIButtonType.PRIMARY_VERTICAL}
                key={"actionTicket"}
                onClick={() => {
                    this.popCardView({ viewId: "RELATED_TRIP" });
                    this.onShowBookingCard(selectedTrip);
                }}
            />
        const tripOverviewActions = (_trip: Trip, defaultActions: JSX.Element[]): JSX.Element[] => [
            ...bookAction ? [bookAction] : [],
            ...defaultActions
        ];
        return tripOverviewActions
    }

    private onShowBookingCard(trip: Trip) {
        const onRequestTripRefresh = trip === this.props.selectedTrip ? this.props.refreshSelectedTrip : TripGoApi.updateRT;
        const { status, tkconfig } = this.props;
        const { showBooking, bookingType, bookingSegment } = getTripBookingInfo(trip, tkconfig, status);
        const isCreateBooking = !bookingSegment?.booking?.confirmation;
        if (!showBooking || bookingType === "external" || status !== SignInStatus.signedIn || !tkconfig.booking?.renderBookingCard) {
            return; // Precodition for showing booking card not met.
        }
        const BookingCardWithTripState = () => {
            const [tripS, setTripS] = useState<Trip>(trip);
            const handleRequestTripRefresh = async (refreshURLForSourceObject?: string) => {
                // Workaround in case the last booking hit returns an updateURL, which may be different from the one in the trip.
                if (refreshURLForSourceObject) {
                    tripS.updateURL = refreshURLForSourceObject;
                }
                const update = await onRequestTripRefresh(tripS);
                update && setTripS(update);
                return update;
            };
            return (
                <TKPropsOverride
                    componentKey="TKUIBookingActions"
                    propsOverride={{
                        actionToHandler: (action) => bookingActionToHandler(action, {
                            requestRefresh: handleRequestTripRefresh,
                            onRequestAnother: () => {
                                this.props.onQueryChange(RoutingQuery.create());
                                this.props.onComputeTripsForQuery(false);
                                this.props.setSelectedTripSegment(undefined);
                                if (this.state.showMyBookings) {
                                    this.setState({ showMyBookings: false });
                                }
                                if (this.props.showUserProfile) {
                                    this.props.setShowUserProfile(false);
                                }
                                setTimeout(() => !this.props.directionsView && !this.props.query.to &&
                                    this.locSearchBoxRef && this.locSearchBoxRef.focus(), 100);
                                this.clearCardStack();
                            },
                            onShowRelatedTrip: () => {
                                this.popCardView({ viewId: "BOOKING_CARD" });
                                this.onShowTripUrl(action.internalURL);
                            },
                            setWaitingFor: action => this.props.onWaitingStateLoad(!!action)
                        })
                    }}
                >
                    {tkconfig.booking!.renderBookingCard!({
                        trip: tripS,
                        onRequestTripRefresh: handleRequestTripRefresh,
                        onRequestClose: () => {
                            this.popCardView?.();
                            const { bookingSegment: tripSBookingSegment } = getTripBookingInfo(tripS, tkconfig, status);
                            // If booking was created, show trip details.
                            if (isCreateBooking && tripSBookingSegment?.booking?.confirmation) {
                                this.onShowTrip(tripS);
                            }
                        },
                        onShowTrip: (trip) => {
                            if (this.state.showMyBookings) {
                                this.setState({ showMyBookings: false });
                            }
                            this.popCardView();
                            this.onShowTrip(trip);
                        }
                    })}
                </TKPropsOverride>
            );
        };
        this.pushCardView({
            viewId: "BOOKING_CARD",
            renderCard: () => <BookingCardWithTripState key={"bookingCard"} />
        });
    }

    private onShowTrip(trip: Trip) {
        // Need to do this since TKUIMxMView doesn't render if there's no selected trip.
        // **TODO:** consider removing that limitation.                
        this.props.onSelectedTripChange(trip);
        this.props.setSelectedTripSegment(undefined);
        this.pushCardView({
            viewId: "RELATED_TRIP",
            renderCard: () => (
                <TKUITripOverviewView
                    value={trip}
                    onTripSegmentSelected={this.props.setSelectedTripSegment}
                    cardProps={{
                        onRequestClose: () => {
                            this.popCardView();
                        },
                        slideUpOptions: {
                            position: this.props.selectedTripSegment ? TKUISlideUpPosition.HIDDEN : undefined,
                            initPosition: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                            draggable: true,
                            modalUp: this.props.landscape ? { top: 5, unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
                            modalMiddle: { top: 55, unit: '%' },
                            modalDown: { top: 90, unit: '%' }
                        },
                        presentation: CardPresentation.SLIDE_UP
                    }}
                    actions={this.getBookingActions(trip)} />
            ),
            onPop: () => this.props.onSelectedTripChange(undefined),
            mapProps: {
                trip,
                readonly: true
            }
        })
    }

    public render(): React.ReactNode {
        const props = this.props;
        const { isUserTabbing, classes, t, tkconfig, status } = this.props;
        const directionsView = this.props.directionsView;
        // const emptyCardStack = this.state.cardStack.length === 0;
        const emptyCardStack = true;
        const hideQueryPanelElements = this.state.cardStack.some(cardData => cardData.viewId === "RELATED_TRIP");
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
        const queryInput = !this.props.hideQueryInput && directionsView &&
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
                key={this.state.showLocationDetailsFor.getKey()}  // So changing location causes the component to be re-constructed.
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
            <TKUIFavouritesViewHelpers.TKStateProps>
                {stateProps =>
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
                        {...stateProps}
                    />
                }
            </TKUIFavouritesViewHelpers.TKStateProps>;
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
                            modalUp: this.props.landscape ? { top: this.props.hideQueryInput ? cardSpacing() : 176 + 2 * cardSpacing(), unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
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
                        actions={this.getBookingActions(this.props.selectedTrip!)}
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
                                            actions={this.getBookingActions(this.props.selectedTrip!)}
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
                {stateProps =>
                    <TKUIMxMView
                        {...stateProps}
                        onRequestClose={() => props.setSelectedTripSegment(undefined)}
                        parentElement={this.ref}
                        onShowVehicleAvailabilityForSegment={async ({ segment }) => {
                            this.props.onWaitingStateLoad(true);
                            const groupsJSON = await TripGoApi.apiCall(`locations.json?lat=${segment.from.lat}&lng=${segment.from.lng}&radius=1000&modes=${segment.modeIdentifier}&strictModeMatch=false`, NetworkUtil.MethodType.GET)
                            this.props.onWaitingStateLoad(false);
                            const carPod = Util.deserialize(groupsJSON.groups[0], LocationsResult)
                                .getLocations()[0];
                            if (!carPod) {
                                return; // TODO: display error.
                            }
                            this.pushCardView({
                                viewId: "AVAILABILITY",
                                renderCard: () => <TKUICard
                                    title={segment.sharedVehicle?.operator.name}
                                    subtitle={"Change vehicle and / or booking range"}
                                    presentation={this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                                    styles={{
                                        modalContent: overrideClass({
                                            width: '800px'
                                        })
                                    }}
                                    onRequestClose={() => this.popCardView()}
                                >
                                    <TKUIVehicleAvailability
                                        location={carPod as CarPodLocation}
                                        segment={segment}
                                        onUpdateTrip={async ({ bookingStart, bookingEnd, vehicleId, bookingStartChanged }) => {
                                            const vehicleChanged = vehicleId !== segment.sharedVehicle?.identifier;
                                            // TODO: if can pick a vehicle from a different car-pod location, then we need to pass that location to the following call.
                                            const trip = (vehicleChanged || bookingStartChanged) ?
                                                await this.props.onSegmentCollectBookingChange(segment, segment.location as ModeLocation, { ...bookingStartChanged ? { bookingStart, bookingEnd } : {}, vehicleId }) :
                                                segment.trip;
                                            this.popCardView();
                                            return trip;
                                        }} />
                                </TKUICard>
                            });
                        }}
                    />}
            </TKUIMxMViewHelpers.TKStateProps>

        const topCardView = this.state.cardStack.length > 0 ? this.state.cardStack[this.state.cardStack.length - 1] : undefined;
        let content = (
            <div id={modalContainerId} className={classNames(classes.modalMain, genClassNames.root, isUserTabbing && classes.ariaFocusEnabled)}
                ref={el => el && (this.ref = el)}
                role="none"
            >
                <div id={mainContainerId} className={classes.main} ref={el => el && (this.appMainRef = el)} role="none">
                    <div className={classes.queryPanel} role="none" style={{ ...hideQueryPanelElements ? { display: 'none' } : {} }}>
                        {searchBar}
                        {homeCard}
                        {queryInput}
                    </div>
                    <div id="map-main" className={classes.mapMain}>
                        <TKUIMapViewHelpers.TKStateProps>
                            {stateProps => <TKUIMapView
                                {...stateProps}
                                hideLocations={this.props.trips !== undefined || this.props.selectedService !== undefined}
                                padding={mapPadding}
                                locationActionHandler={(loc: Location) => {
                                    if (loc instanceof StopLocation) {
                                        return () => {
                                            this.showTimetableFor(loc as StopLocation);
                                            FavouritesData.recInstance.add(FavouriteStop.create(loc as StopLocation));
                                        };
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
                                {...topCardView?.mapProps} />}
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
                {/* {topCardView?.renderCard()} */}
                {this.state.cardStack.map((card) => card.renderCard())}
            </div>
        );
        content =
            <TKPropsOverride
                componentKey="TKUIMyBooking"
                propsOverride={props => ({
                    onShowTrip: () => this.onShowBookingTrip(props.booking)
                    // onShowTrip: () => this.onShowBookingTrip(props.booking, props.onRequestRefresh)  **TODO:**
                })}
            >
                {content}
            </TKPropsOverride>;
        content =
            <TKPropsOverride
                componentKey="TKUITripRow"
                propsOverride={props => {
                    const { showBooking, bookingType, bookingSegment } = getTripBookingInfo(props.value, tkconfig, status);
                    return ({
                        renderAction: showBooking ? (trip => {
                            const booking = bookingSegment!.booking!;
                            return (
                                bookingType === "external" ?
                                    <TKUIButton
                                        text={booking?.title ?? t("Book")}
                                        type={TKUIButtonType.PRIMARY_LINK}
                                        onClick={(e: any) => {
                                            props.onSegmentSelected?.(bookingSegment);
                                            if (bookingSegment!.isPT() && status === SignInStatus.signedIn) {
                                                // Workaround to go to booking MxM card, with #18051 this won't be necessary anymore.
                                                setTimeout(() => {
                                                    moveToNext?.();
                                                    moveToNext?.();
                                                });
                                            }
                                            e.stopPropagation();
                                        }}
                                        role={"button"}
                                        aria-label={t("Book")}
                                        disabled={trip.availability === TripAvailability.MISSED_PREBOOKING_WINDOW}
                                        styles={theme => ({
                                            link: overrideClass({
                                                padding: '0 6px',
                                                '&:disabled': {
                                                    color: colorWithOpacity(theme.colorPrimary, .4),
                                                    cursor: 'initial'
                                                }
                                            })
                                        })} /> :
                                    <TKUIButton
                                        text={booking?.title ?? t("Book")}
                                        type={TKUIButtonType.PRIMARY}
                                        onClick={(e) => {
                                            this.onShowBookingCard(this.props.selectedTrip!);
                                            e.stopPropagation();
                                        }} // **TODO:** Ensure that the trip with the booking is selected first. It does in practice, but understand why.
                                        role={"button"}
                                        aria-label={t("Book")}
                                        disabled={trip.availability === TripAvailability.MISSED_PREBOOKING_WINDOW}
                                        styles={{
                                            primary: overrideClass({
                                                margin: '-10px 10px',
                                                padding: '4px 16px'
                                            })
                                        }}
                                    />
                            );
                        }) : undefined
                    });
                }}
            >
                {content}
            </TKPropsOverride>;
        content =
            <TKPropsOverride
                componentKey="TKUIMxMIndex"
                propsOverride={props => {
                    const trip = props.segments[0].trip;
                    const { showBooking, bookingType, bookingSegment } = getTripBookingInfo(trip, tkconfig, status);
                    return ({
                        renderAction: showBooking && bookingType === "inapp" ? (trip => {
                            const booking = bookingSegment!.booking!;
                            return (
                                <TKUIButton
                                    text={booking?.title ?? t("Book")}
                                    type={TKUIButtonType.PRIMARY}
                                    onClick={(e) => {
                                        this.onShowBookingCard(trip);
                                        e.stopPropagation();
                                    }}
                                    role={"button"}
                                    aria-label={t("Book")}
                                    disabled={trip.availability === TripAvailability.MISSED_PREBOOKING_WINDOW}
                                    styles={{
                                        primary: overrideClass({
                                            margin: '0 10px',
                                            padding: '3px 16px'
                                        })
                                    }}
                                />
                            );
                        }) : undefined
                    })
                }}
            >
                {content}
            </TKPropsOverride>;

        return content;
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
            if (e.shiftKey && e.metaKey && e.key === "f") {
                this.setState({ showFavourites: true });
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
            || prevProps.isSupportedFavourites && !this.props.isSupportedFavourites // Favourites became unsupported (e.g. on signout)
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

        // Planned trips tracking.
        if (this.props.selectedTrip !== prevProps.selectedTrip) {
            PlannedTripsTracker.instance.selected = this.props.selectedTrip;
        }
        if (this.props.tripDetailsView !== prevProps.tripDetailsView ||
            this.props.selectedTrip !== prevProps.selectedTrip) {
            if (this.props.tripDetailsView && this.props.selectedTrip) {
                PlannedTripsTracker.instance.scheduleTrack({ anonymous: this.props.userProfile.trackTripSelections });
            } else {
                PlannedTripsTracker.instance.cancelScheduledTrack();
            }
        }

        if (this.props.trips !== prevProps.trips) {
            PlannedTripsTracker.instance.trips = this.props.trips;
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
        const favouritesContext = useContext(TKFavouritesContext);
        const tkconfig = useContext(TKUIConfigContext);
        const accountContext = useContext(TKAccountContext);
        return (
            <>
                {props.children!({
                    ...routingContext,
                    directionsView: routingContext.computeTripsForQuery,
                    onDirectionsView: routingContext.onComputeTripsForQuery,
                    ...serviceContext,
                    ...viewportProps,
                    ...optionsContext,
                    ...accessibilityContext,
                    ...favouritesContext,
                    ...accountContext,
                    tkconfig
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