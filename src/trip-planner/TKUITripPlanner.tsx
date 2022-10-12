import * as React from "react";
import LatLng from "../model/LatLng";
import Modal from 'react-modal';
import Util from "../util/Util";
import GATracker from "../analytics/GATracker";
import TKUITimetableView from "../service/TKUITimetableView";
import TKUIRoutingResultsView from "../trip/TKUIRoutingResultsView";
import { IServiceResultsContext, ServiceResultsContext } from "../service/ServiceResultsProvider";
import { IRoutingResultsContext, RoutingResultsContext } from "./RoutingResultsProvider";
import TKUIServiceView from "../service/TKUIServiceView";
import TKUITripOverviewView from "../trip/TKUITripOverviewView";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { tKUITripPlannerDefaultStyle } from "./TKUITripPlanner.css";
import TKUIRoutingQueryInput from "../query/TKUIRoutingQueryInput";
import Trip from "../model/trip/Trip";
import TKUICardCarousel from "../card/TKUICardCarousel";
import StopLocation from "../model/StopLocation";
import TKUIProfileView from "../options/TKUIProfileView";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { Subtract } from "utility-types";
import TKUILocationSearch from "../query/TKUILocationSearch";
import Location from "../model/Location";
import RoutingQuery, { TimePreference } from "../model/RoutingQuery";
import TKUILocationDetailView from "../location/TKUILocationDetailView";
import TKUIFavouritesView from "../favourite/TKUIFavouritesView";
import Favourite from "../model/favourite/Favourite";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import FavouritesData from "../data/FavouritesData";
import TKUIMapView, { TKUIMapPadding } from "../map/TKUIMapView";
import TKUISidebar from "../sidebar/TKUISidebar";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import classNames from "classnames";
import { TKUISlideUpPosition } from "../card/TKUISlideUp";
import DateTimeUtil from "../util/DateTimeUtil";
import GeolocationData from "../geocode/GeolocationData";
import { TKUIConfigContext } from "../config/TKUIConfigProvider";
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
import TKUIMxMView from "../mxm/TKUIMxMView";
import TKUIHomeCard from "../sidebar/TKUIHomeCard";
import TKUIMyBookings from "../booking/TKUIMyBookings";
import { IAccessibilityContext, TKAccessibilityContext } from "../config/TKAccessibilityProvider";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     * @ignore
     */
    userLocationPromise?: Promise<LatLng>;
    renderTopRight?: () => React.ReactNode;
    transportSettingsUI?: "BRIEF" | "FULL" | "BRIEF_TO_FULL";
    hideSearch?: boolean;
}

interface IConsumedProps extends IRoutingResultsContext, IServiceResultsContext, TKUIViewportUtilProps, IOptionsContext, IAccessibilityContext { }

export interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUITripPlannerDefaultStyle>

export type TKUITKUITripPlannerProps = IProps;
export type TKUITKUITripPlannerStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripPlanner {...props} />,
    styles: tKUITripPlannerDefaultStyle,
    classNamePrefix: "TKUITripPlanner"
};

interface IState {
    mapView: boolean;
    showSidebar: boolean;
    showTransportSettings: boolean;
    showMyBookings?: boolean;
    showFavourites: boolean;
    showLocationDetails: boolean;
    tripUpdateStatus?: TKRequestStatus;
    // Need to put this elem into the state so when instantiated it triggers a re-render on consumer TKUILocationSearch.
    searchMenuPanelElem?: HTMLDivElement;
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
            showLocationDetails: false
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
        GATracker.event({
            category: "query input",
            action: "display transport switches"
        });
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

    private static ableToShowLocationDetailView(props: IProps): boolean {
        const toLocation = props.query.to;
        return !props.directionsView && !!toLocation && toLocation.isResolved() &&
            !toLocation.isDroppedPin() && !(toLocation instanceof StopLocation);
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
            time: DateTimeUtil.momentFromTimeTZ(targetSegment.startTime * 1000, segment.from.timezone)
        });
        this.props.onTripDetailsView(false);
    }

    public render(): React.ReactNode {
        const props = this.props;
        const { isUserTabbing, classes, t } = this.props;
        const searchBar =
            !this.props.hideSearch && !this.props.directionsView && !(this.props.portrait && this.props.selectedService) &&
            <div>
                <TKUILocationSearch
                    onDirectionsClicked={() => {
                        this.props.onQueryChange(Util.iAssign(this.props.query, { from: Location.createCurrLoc() }));
                        this.props.onDirectionsView(true);
                    }}
                    onShowSideBarClicked={() => {
                        this.setState({ showSidebar: true });
                    }}
                    onLocationBoxRef={(ref: TKUILocationBoxRef) => this.locSearchBoxRef = ref}
                    menuContainer={this.state.searchMenuPanelElem}
                />
                <div className={classes.searchMenuContainer}
                    ref={(ref) => ref && ref !== this.state.searchMenuPanelElem && this.setState({ searchMenuPanelElem: ref })} />
            </div>;
        const sideBar =
            <TKUISidebar
                open={this.state.showSidebar && !this.props.directionsView}
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
        const queryInput = this.props.directionsView &&
            !(this.props.tripDetailsView && this.props.selectedTrip) && // not displaying trip details view, and
            !this.props.selectedTripSegment &&    // not displaying MxM view
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
            />;
        const toLocation = this.props.query.to;
        const locationDetailView = this.state.showLocationDetails && TKUITripPlanner.ableToShowLocationDetailView(this.props) &&
            <TKUILocationDetailView
                location={toLocation!}
                slideUpOptions={{
                    initPosition: this.props.portrait ? TKUISlideUpPosition.DOWN : TKUISlideUpPosition.UP,
                    position: DeviceUtil.isTouch() ? undefined :
                        this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                    draggable: DeviceUtil.isTouch(),
                    modalUp: this.props.landscape ? { top: 48 + 2 * cardSpacing(), unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
                    modalDown: { top: this.getContainerHeight() - 145, unit: 'px' }
                }}
                onRequestClose={() => this.setState({ showLocationDetails: false })}
            />;
        const timetableView = this.isShowTimetable() ?
            <TKUITimetableView
                onRequestClose={() => this.showTimetableFor(undefined)}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.UP,
                    // Hide, but don't close, when service is selected.
                    // position: this.props.selectedService ? TKUISlideUpPosition.HIDDEN : undefined,
                    position: this.props.selectedService ? TKUISlideUpPosition.HIDDEN : TKUISlideUpPosition.UP,
                    draggable: false,
                    modalUp: this.props.landscape ?
                        { top: (this.props.directionsView ? 176 : 48) + 2 * cardSpacing(), unit: 'px' } :
                        { top: cardSpacing(false), unit: 'px' },
                    modalDown: { top: this.getContainerHeight() - 40, unit: 'px' }
                }}
            /> : null;
        const serviceDetailView = this.isShowServiceDetail() ?
            <TKUIServiceView
                onRequestClose={() => this.props.onServiceSelection(undefined)}
                slideUpOptions={{
                    initPosition: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                    position: DeviceUtil.isTouch() ? undefined :
                        this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                    draggable: DeviceUtil.isTouch(),
                    modalUp: this.props.landscape ? { top: (this.props.directionsView ? 176 : 48) + 2 * cardSpacing(), unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
                    modalDown: { top: this.getContainerHeight() - 130, unit: 'px' }
                }}
            /> : null;
        const favouritesView = this.state.showFavourites && !this.props.directionsView &&
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
        const routingResultsView = this.props.directionsView && this.props.query.isComplete(true) && this.props.trips ?
            <TKUIRoutingResultsView
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
            /> : null;

        const homeCard = searchBar && !locationDetailView && !favouritesView &&
            !this.isShowTimetable() &&
            <TKUIHomeCard onMyBookings={() => this.setState({ showMyBookings: true })} />;
        let tripDetailView: any;
        if (this.isShowTripDetail()) {
            if (DeviceUtil.isTouch()) {
                tripDetailView =
                    <TKUITripOverviewView
                        value={this.props.selectedTrip!}
                        onRequestClose={() => this.props.onTripDetailsView(false)}
                        slideUpOptions={{
                            position: props.selectedTripSegment ? TKUISlideUpPosition.HIDDEN : undefined,
                            initPosition: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                            draggable: true,
                            modalUp: this.props.landscape ? { top: 5, unit: 'px' } : { top: cardSpacing(false), unit: 'px' },
                            modalMiddle: { top: 55, unit: '%' },
                            modalDown: { top: 90, unit: '%' }
                        }}
                        onRequestAlternativeRoutes={this.onRequestAlternativeRoutes}
                        setSelectedTripSegment={props.setSelectedTripSegment}
                    />
            } else {
                const sortedTrips = this.props.trips || [];
                const selected = sortedTrips.indexOf(this.props.selectedTrip!);
                tripDetailView =
                    <TKUICardCarousel
                        selected={selected}
                        onChange={(selected: number) => this.props.onChange((this.props.trips || [])[selected])}
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
                                            onRequestClose={() => {
                                                this.props.onTripDetailsView(false);
                                            }}
                                            key={trip.getKey(String(i))}
                                            handleRef={(handleRef: any) => registerHandle(i, handleRef)}
                                            cardPresentation={CardPresentation.NONE}
                                            slideUpOptions={{
                                                draggable: false,    // Needs to specify so it's needed by TKUIScrollForCard
                                                showHandle: true
                                            }}
                                            shouldFocusAfterRender={i === selected ? undefined : false}
                                            doNotStack={i !== selected}
                                            setSelectedTripSegment={props.setSelectedTripSegment}
                                        />
                                    </div>
                                )}
                    </TKUICardCarousel>;
            }
        }
        const mapPadding: TKUIMapPadding = {};
        if (this.props.landscape) {
            mapPadding.left = this.props.query.isEmpty() && !favouritesView && !serviceDetailView
                && !locationDetailView ? 0 : 500;
        } else {
            if (this.props.directionsView && this.props.trips) {
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
        //     this.props.directionsView && this.props.trips ? {bottom: this.ref ? this.ref.offsetHeight * .45 : 20, top: 100} : undefined;
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
        const mxMView = props.selectedTripSegment && <TKUIMxMView parentElement={this.ref} />;
        return (
            <TKUIConfigContext.Consumer>
                {(config: TKUIConfig) =>
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
                                <TKUIMapView
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
                                        } else if (TKUITripPlanner.ableToShowLocationDetailView(this.props)) {
                                            return () => this.setState({ showLocationDetails: true });
                                        }
                                        return undefined;
                                    }}
                                />
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
                    </div>
                }
            </TKUIConfigContext.Consumer>
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

        setTimeout(() => GATracker.pageview(window.location.pathname + window.location.search), 1000);

        // Focus location search box on web-app load.
        setTimeout(() => !this.props.directionsView && !this.props.query.to &&
            this.locSearchBoxRef && this.locSearchBoxRef.focus(), 2000);
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void {
        if (TKUITripPlanner.ableToShowLocationDetailView(this.props) !== TKUITripPlanner.ableToShowLocationDetailView(prevProps)) {
            this.setState({ showLocationDetails: TKUITripPlanner.ableToShowLocationDetailView(this.props) });
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
        } else if (prevProps.query.to !== this.props.query.to && this.props.query.to
            && !this.props.directionsView && !this.state.showLocationDetails
            // Don't show location details if it was the case that the location was unresolved and become
            // resolved. Copied from stop location case, not sure it it's actually necessary.
            && !(prevProps.query.to && prevProps.query.to.id && prevProps.query.to.id === this.props.query.to.id)) {
            this.setState({ showLocationDetails: true })
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
            || !prevState.showLocationDetails && this.state.showLocationDetails // Start displaying location details
        ) {
            this.setState({ showFavourites: false });
        }
        // Switched to directions view, so close location detail
        if (!prevProps.directionsView && this.props.directionsView && this.state.showLocationDetails) {
            this.setState({ showLocationDetails: false });
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

const Consumer: React.SFC<{ children: (props: IConsumedProps) => React.ReactNode }> = (props: { children: (props: IConsumedProps) => React.ReactNode }) => {
    return (
        <TKUIConfigContext.Consumer>
            {(config: TKUIConfig) =>
                <TKAccessibilityContext.Consumer>
                    {(accessibilityContext: IAccessibilityContext) =>
                        <TKUIViewportUtil>
                            {(viewportProps: TKUIViewportUtilProps) =>
                                <OptionsContext.Consumer>
                                    {(optionsContext: IOptionsContext) =>
                                        <RoutingResultsContext.Consumer>
                                            {(routingResultsContext: IRoutingResultsContext) =>
                                                <ServiceResultsContext.Consumer>
                                                    {(serviceContext: IServiceResultsContext) => (
                                                        props.children!({
                                                            ...routingResultsContext,
                                                            ...serviceContext,
                                                            ...viewportProps,
                                                            ...optionsContext,
                                                            ...accessibilityContext
                                                        })
                                                    )}
                                                </ServiceResultsContext.Consumer>
                                            }
                                        </RoutingResultsContext.Consumer>
                                    }
                                </OptionsContext.Consumer>
                            }
                        </TKUIViewportUtil>
                    }
                </TKAccessibilityContext.Consumer>
            }
        </TKUIConfigContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({ ...inputProps, ...consumedProps })}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUITripPlanner, config, Mapper);