import * as React from "react";
import '../css/app.css';
import RegionsData from "../data/RegionsData";
import LatLng from "../model/LatLng";
import Modal from 'react-modal';
import Util from "../util/Util";
import WaiAriaUtil from "../util/WaiAriaUtil";
import GATracker from "../analytics/GATracker";
import {TileLayer} from "react-leaflet";
import TKUITimetableView from "../service/TKUITimetableView";
import TKUIResultsView from "../trip/TKUIResultsView";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import {IRoutingResultsContext, RoutingResultsContext} from "./RoutingResultsProvider";
import TKUIServiceView from "../service/TKUIServiceView";
import TKUITripOverviewView from "../trip/TKUITripOverviewView";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUITripPlannerDefaultStyle} from "./TKUITripPlanner.css";
import TKUIRoutingQueryInput from "../query/TKUIRoutingQueryInput";
import Trip from "../model/trip/Trip";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import TKUICardCarousel from "../card/TKUICardCarousel";
import StopLocation from "../model/StopLocation";
import TKUIProfileView from "../options/TKUIProfileView";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import TKShareHelper from "../share/TKShareHelper";
import TKUILocationSearch from "../query/TKUILocationSearch";
import Location from "../model/Location";
import RoutingQuery, {TimePreference} from "../model/RoutingQuery";
import TKUILocationDetailView from "../location/TKUILocationDetailView";
import TKUIFavouritesView from "../favourite/TKUIFavouritesView";
import Favourite from "../model/favourite/Favourite";
import FavouriteStop from "../model/favourite/FavouriteStop";
import FavouriteLocation from "../model/favourite/FavouriteLocation";
import FavouriteTrip from "../model/favourite/FavouriteTrip";
import FavouritesData from "../data/FavouritesData";
import TKUIMapView, {TKUIMapPadding} from "../map/TKUIMapView";
import TKUISidebar from "../sidebar/TKUISidebar";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import classNames from "classnames";
import {TKUISlideUpPosition} from "../card/TKUISlideUp";
import {MapLocationType} from "../model/location/MapLocationType";
import StopsData from "../data/StopsData";
import DateTimeUtil from "../util/DateTimeUtil";
import GeolocationData from "../geocode/GeolocationData";
import {TKUIConfigContext} from "../config/TKUIConfigProvider";
import TKUIReportBtn from "../feedback/TKUIReportBtn";
import TKUITransportOptionsView from "../options/TKUITransportOptionsView";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import TKUserProfile from "../model/options/TKUserProfile";
import {TKUserPosition} from "../util/GeolocationUtil";
import TKUIWaitingRequest, {TKRequestStatus} from "../card/TKUIWaitingRequest";
import DeviceUtil from "../util/DeviceUtil";
import TKUICardContainer from "../card/TKUICardContainer";
import {CardPresentation} from "../card/TKUICard";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {}

interface IConsumedProps extends IRoutingResultsContext, IServiceResultsContext, TKUIViewportUtilProps {
    userProfile: TKUserProfile;
    onUserProfileChange: (update: TKUserProfile) => void;
    userLocationPromise?: Promise<LatLng>;
}

export interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export interface IStyle {
    main: CSSProps<IProps>;
    queryPanel: CSSProps<IProps>;
    mapMain: CSSProps<IProps>;
    reportBtn: CSSProps<IProps>;
}

export type TKUITKUITripPlannerProps = IProps;
export type TKUITKUITripPlannerStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripPlanner {...props}/>,
    styles: tKUITripPlannerDefaultStyle,
    classNamePrefix: "TKUITripPlanner"
};

interface IState {
    mapView: boolean;
    showSidebar: boolean;
    showSettings: boolean;
    showTransportSettings: boolean;
    showFavourites: boolean;
    showTripDetail?: boolean;
    cardPosition?: TKUISlideUpPosition;
    tripUpdateStatus?: TKRequestStatus;
}

class TKUITripPlanner extends React.Component<IProps, IState> {

    private ref: any;

    constructor(props: IProps) {
        super(props);
        this.state = {
            showSidebar: false,
            showSettings: false,
            showTransportSettings: false,
            mapView: false,
            showFavourites: false,
            showTripDetail: TKShareHelper.isSharedTripLink()
        };

        (this.props.userLocationPromise ||
            GeolocationData.instance.requestCurrentLocation(true, true)
                .then((userPosition: TKUserPosition) => userPosition.latLng))
            .then((userLocation: LatLng) => {
                // Don't fit map to user position if query from / to was already set. Avoids jumping to user location
                // on shared links.
                if (!this.props.query.isEmpty()) {
                    return;
                }
                const initViewport = {center: userLocation, zoom: 13};
                this.props.onViewportChange(initViewport);
            });

        WaiAriaUtil.addTabbingDetection();

        this.onShowSettings = this.onShowSettings.bind(this);
        this.onShowTransportSettings = this.onShowTransportSettings.bind(this);
        this.onFavouriteClicked = this.onFavouriteClicked.bind(this);

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
        GATracker.instance.send('query input', 'click', 'options button');
        RegionsData.instance.requireRegions().then(() => this.setState({showSettings: true}));
    }

    private onShowTransportSettings() {
        this.setState({showTransportSettings: true});
    }

    private onFavouriteClicked(favourite: Favourite) {
        if (favourite instanceof FavouriteStop) {
            this.props.onQueryUpdate({to: favourite.stop});
        } else if (favourite instanceof FavouriteLocation) {
            this.props.onQueryUpdate({from: Location.createCurrLoc(), to: favourite.location, timePref: TimePreference.NOW});
            this.props.onDirectionsView(true);
        } else if (favourite instanceof FavouriteTrip) {
            this.props.onQueryUpdate({from: favourite.from, to: favourite.to, timePref: TimePreference.NOW});
            this.props.onDirectionsView(true);
        }
        FavouritesData.recInstance.add(favourite);
    }

    private static isLocationDetailView(props: IProps): boolean {
        const toLocation = props.query.to;
        return !props.directionsView && !!toLocation && toLocation.isResolved() &&
            !toLocation.isDroppedPin() && !(toLocation instanceof StopLocation);
    }

    public render(): React.ReactNode {
        const t = this.props.t;
        const searchBar =
            // this.state.cardPosition !== TKUISlideUpPosition.UP &&
            !this.props.directionsView && !(this.props.portrait && this.props.selectedService) &&
            <TKUILocationSearch
                onDirectionsClicked={() => {
                    this.props.onQueryChange(Util.iAssign(this.props.query, {from: Location.createCurrLoc()}));
                    this.props.onDirectionsView(true);
                }}
                onShowSideBar={() => {
                    this.setState({showSidebar: true});
                }}
            />;
        const sideBar =
            <TKUISidebar
                open={this.state.showSidebar && !this.props.directionsView}
                onRequestClose={() => {
                    return this.setState({showSidebar: false});
                }}
                onShowSettings={this.onShowSettings}
                onShowFavourites={() => this.setState({showFavourites: true})}
            />;
        const settings = this.state.showSettings &&
            <TKUIProfileView
                onRequestClose={() => this.setState({showSettings: false})}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.UP,
                    draggable: false
                }}
            />;
        const transportSettings = this.state.showTransportSettings &&
            <TKUITransportOptionsView
                value={this.props.userProfile}
                onChange={this.props.onUserProfileChange}
                onRequestClose={() => this.setState({showTransportSettings: false})}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.UP,
                    draggable: false,
                    modalUp: this.props.landscape ? {top: 65, unit: 'px'} : undefined,
                    modalDown: this.ref ? {top: this.ref.offsetHeight - 145, unit: 'px'} : undefined
                }}
            />;
        const queryInput = this.props.directionsView &&
            !(this.state.showTripDetail && this.props.selected) &&
            <TKUIRoutingQueryInput
                title={t("Route")}
                isTripPlanner={true}
                onShowTransportOptions={this.onShowTransportSettings}
                resolveCurrLocInFrom={this.props.query.from !== null && this.props.query.to !== null}
                collapsable={true}
                onClearClicked={() => {
                    this.props.onQueryChange(RoutingQuery.create());
                    this.props.onDirectionsView(false);
                }}
            />;
        const toLocation = this.props.query.to;
        const locationDetailView = TKUITripPlanner.isLocationDetailView(this.props) && !this.state.showFavourites &&
            !(this.state.showSettings && this.props.portrait) &&
            <TKUILocationDetailView
                location={toLocation!}
                slideUpOptions={{
                    initPosition: this.props.portrait ? TKUISlideUpPosition.DOWN : TKUISlideUpPosition.UP,
                    position: DeviceUtil.isTouch() ? undefined :
                        this.props.portrait ? TKUISlideUpPosition.DOWN : TKUISlideUpPosition.UP,
                    draggable: DeviceUtil.isTouch(),
                    onPositionChange: (position: TKUISlideUpPosition) => this.setState({cardPosition: position}),
                    modalUp: this.props.landscape ? {top: 65, unit: 'px'} : undefined,
                    modalDown: this.ref ? {top: this.ref.offsetHeight - 145, unit: 'px'} : undefined
                }}
            />;
        const timetableView = this.isShowTimetable() ?
            <TKUITimetableView
                onRequestClose={() => {
                    if (this.props.timetableForSegment) {
                        this.props.onTimetableForSegment(undefined);
                    } else {
                        this.showTimetableFor(undefined);
                    }
                }}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.UP,
                    // Hide, but don't close, when service is selected.
                    // position: this.props.selectedService ? TKUISlideUpPosition.HIDDEN : undefined,
                    position: this.props.selectedService && !this.props.timetableForSegment ?
                        TKUISlideUpPosition.HIDDEN : TKUISlideUpPosition.UP,
                    draggable: false,
                    modalUp: this.props.landscape ? {top: this.props.timetableForSegment ? 40 :
                            this.props.directionsView ? 195 : 65, unit: 'px'} : undefined,
                    modalDown: this.ref ? {top: this.ref.offsetHeight - 40, unit: 'px'} : undefined
                }}
            /> : null;
        const serviceDetailView = this.props.selectedService && !this.props.timetableForSegment ?
            <TKUIServiceView
                onRequestClose={() => this.props.onServiceSelection(undefined)}
                slideUpOptions={{
                    initPosition: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                    position: DeviceUtil.isTouch() ? undefined :
                        this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                    draggable: DeviceUtil.isTouch(),
                    modalUp: this.props.landscape ? {top: this.props.directionsView ? 195 : 65, unit: 'px'} : undefined,
                    modalDown: this.ref ? {top: this.ref.offsetHeight - 130, unit: 'px'} : undefined
                }}
            /> : null;
        const favouritesView = this.state.showFavourites && !this.props.directionsView &&
            <TKUIFavouritesView
                onFavouriteClicked={this.onFavouriteClicked}
                onRequestClose={() => {this.setState({showFavourites: false})}}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.UP,
                    draggable: DeviceUtil.isTouch(),
                    modalUp: this.props.landscape ? {top: 65, unit: 'px'} : undefined,
                    modalMiddle: {top: 55, unit: '%'},
                    modalDown: {top: this.ref.offsetHeight - 80, unit: 'px'}
                }}
            />;
        const routingResultsView = this.props.directionsView && this.props.trips && !(this.state.showTripDetail && this.props.selected) ?
            <TKUIResultsView
                className="gl-no-shrink"
                onDetailsClicked={() => {
                    this.setState({showTripDetail: true});
                }}
                onShowOptions={this.onShowTransportSettings}
                slideUpOptions={{
                    initPosition: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                    position: DeviceUtil.isTouch() ? undefined :
                        this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                    draggable: DeviceUtil.isTouch(),
                    modalUp: this.props.landscape ? {top: 195, unit: 'px'} : undefined,
                    modalMiddle: {top: 55, unit: '%'},
                    modalDown: {top: 90, unit: '%'}
                }}
            /> : null;

        let tripDetailView: any;
        if (this.state.showTripDetail && this.props.selected && !this.props.timetableForSegment) {
            if (DeviceUtil.isTouch()) {
                tripDetailView =
                    <TKUITripOverviewView
                        value={this.props.selected}
                        onRequestClose={() => {
                            this.setState({showTripDetail: false})
                        }}
                        slideUpOptions={{
                            initPosition: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                            draggable: true,
                            modalUp: this.props.landscape ? {top: 5, unit: 'px'} : undefined,
                            modalMiddle: {top: 55, unit: '%'},
                            modalDown: {top: 90, unit: '%'}
                        }}
                    />
            } else {
                const sortedTrips = this.props.trips || [];
                const selected = sortedTrips.indexOf(this.props.selected);
                tripDetailView =
                    <TKUICardCarousel
                        selected={selected}
                        onChange={(selected: number) => this.props.onChange((this.props.trips || [])[selected])}
                        slideUpOptions={{
                            position: this.props.portrait ? TKUISlideUpPosition.MIDDLE : TKUISlideUpPosition.UP,
                            modalDown: {top: this.ref.offsetHeight - 100, unit: 'px'},
                            draggable: false
                        }}
                    >
                        {(registerHandle: (index: number, handle: any) => void) =>
                            sortedTrips
                                .map((trip: Trip, i: number) =>
                                    <TKUITripOverviewView
                                        value={trip}
                                        onRequestClose={() => {
                                            this.setState({showTripDetail: false})
                                        }}
                                        key={i + "-" + trip.getKey()}
                                        handleRef={(handleRef: any) => registerHandle(i, handleRef)}
                                        cardPresentation={CardPresentation.SLIDE_UP_STYLE}
                                        slideUpOptions={{
                                            draggable: false    // Needs to specify so it's needed by TKUIScrollForCard
                                        }}
                                    />)}
                    </TKUICardCarousel>;
            }
        }
        const classes = this.props.classes;
        const mapPadding: TKUIMapPadding = {};
        if(this.props.landscape) {
            mapPadding.left = this.props.query.isEmpty() && !favouritesView && !serviceDetailView
            && !locationDetailView ? 0 : 500;
        } else {
            if (this.props.directionsView && this.props.trips) {
                mapPadding.bottom = this.ref ? this.ref.offsetHeight * .50 : 20;
            }
            if (queryInput) {
                mapPadding.top = 100;
            } else {
                mapPadding.top = 50;
            }
            if (serviceDetailView) {
                mapPadding.bottom = this.ref ? this.ref.offsetHeight * .55 : 20;
            }
        }
        // this.props.landscape ? {left: 500} :
        //     this.props.directionsView && this.props.trips ? {bottom: this.ref ? this.ref.offsetHeight * .45 : 20, top: 100} : undefined;
        return (
            <TKUIConfigContext.Consumer>
                {(config: TKUIConfig) =>
                    <div id="mv-main-panel"
                         className={classNames(classes.main, "app-style")}
                         ref={el => this.ref = el}
                    >
                        <div className={classNames(classes.queryPanel
                            // , "sg-animate-fade",
                            // this.state.cardPosition === TKUISlideUpPosition.UP && !this.props.directionsView ? "out" : "in"
                        )}
                        >
                            {searchBar}
                            {queryInput}
                        </div>
                        <div id="map-main" className={classes.mapMain}>
                            <TKUIMapView
                                hideLocations={this.props.trips !== undefined || this.props.selectedService !== undefined}
                                padding={mapPadding}
                                onLocAction={(locType: MapLocationType, loc: Location) => {
                                    if (locType === MapLocationType.STOP) {
                                        this.showTimetableFor(loc as StopLocation);
                                        FavouritesData.recInstance.add(FavouriteStop.create(loc as StopLocation))
                                    }
                                }}
                            >
                                <TileLayer
                                    attribution="&copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                    // url="http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg"
                                    url="https://api.mapbox.com/styles/v1/mgomezlucero/cjvp9zm9114591cn8cictke9e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA"
                                />
                            </TKUIMapView>
                        </div>
                        <TKUIReportBtn className={classes.reportBtn}/>
                        {sideBar}
                        {settings}
                        {locationDetailView}
                        {favouritesView}
                        {routingResultsView}
                        {tripDetailView}
                        {timetableView}
                        {serviceDetailView}
                        {transportSettings}
                        <TKUICardContainer/>
                        {<TKUIWaitingRequest
                            status={this.state.tripUpdateStatus}
                            message={this.props.waitingTripUpdate ? "Updating trip" :
                                this.props.tripUpdateError ? "Error updating trip" : ""}
                        />}
                    </div>
                }
            </TKUIConfigContext.Consumer>
        );
    }

    public componentDidMount() {
        Modal.setAppElement(this.ref);

        if (TKShareHelper.isSharedQueryLink()) {
            const transports = TKShareHelper.parseTransportsQueryParam();
            if (transports) {
                const update = Util.iAssign(this.props.userProfile, {transportOptions: transports});
                this.props.onUserProfileChange(update);
            }
            const query = TKShareHelper.parseSharedQueryLink();
            if (query) {
                this.props.onQueryChange(query);
                this.props.onDirectionsView(true);
                TKShareHelper.resetToHome();
            }
        }

        if (TKShareHelper.isSharedStopLink()) {
            const shareLinkPath = decodeURIComponent(document.location.pathname);
            const shareLinkSplit = shareLinkPath.split("/");
            const region = shareLinkSplit[2];
            const stopCode = shareLinkSplit[3];
            StopsData.instance.getStopFromCode(region, stopCode)
                .then((stop: StopLocation) =>
                    RegionsData.instance.requireRegions().then(() => {
                        this.props.onQueryUpdate({to: stop});
                        this.props.onStopChange(stop);
                        TKShareHelper.resetToHome();
                    }));
        }

        if (TKShareHelper.isSharedServiceLink()) {
            const shareLinkPath = decodeURIComponent(document.location.pathname);
            const shareLinkSplit = shareLinkPath.split("/");
            const region = shareLinkSplit[2];
            const stopCode = shareLinkSplit[3];
            const serviceCode = shareLinkSplit[4];
            const initTime = DateTimeUtil.momentFromTimeTZ(parseInt(shareLinkSplit[5]) * 1000);
            StopsData.instance.getStopFromCode(region, stopCode)
                .then((stop: StopLocation) => {
                    RegionsData.instance.requireRegions().then(() => {
                        this.props.onQueryUpdate({to: stop});
                        this.props.onFindAndSelectService(stop, serviceCode, initTime);
                        TKShareHelper.resetToHome();
                    })
                });
        }

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.keyCode === 27) { // Close sidebar on escape
                if (this.state.showSidebar) {
                    this.setState({showSidebar: false});
                }
            }
        });
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void {
        // If on search view and a stop is set as query from, then show timetable for the stop
        if (prevProps.query.from !== this.props.query.from && this.props.query.from && this.props.query.from instanceof StopLocation
            && !this.props.directionsView) {
            this.showTimetableFor(this.props.query.from as StopLocation);
        } else if (prevProps.query.to !== this.props.query.to && this.props.query.to && this.props.query.to instanceof StopLocation
            && !this.props.directionsView) {
            this.showTimetableFor(this.props.query.to as StopLocation);
        } else if (this.isShowTimetable() // Hide timetable if neither query from nor to are stops, and not displaying it for a trip segment.
            && (!this.props.query.from || !(this.props.query.from instanceof StopLocation))
            && (!this.props.query.to || !(this.props.query.to instanceof StopLocation))
            && (!this.props.timetableForSegment)) {
            this.showTimetableFor(undefined);
        }

        // Hide timetable if start showing trips.
        if (prevProps.trips === undefined && this.props.trips !== undefined) {
            this.showTimetableFor(undefined);
        }
        if (!this.isShowTimetable(prevProps) && this.isShowTimetable() // Start displaying timetable
            || (this.isShowTimetable() && prevProps.stop !== this.props.stop) // Already displaying timetable, but clicked other stop
            || !TKUITripPlanner.isLocationDetailView(prevProps) && TKUITripPlanner.isLocationDetailView(this.props) // Start displaying location details
        ) {
            this.setState({showFavourites: false});
        }
        // Switched to directions view, so close timetable
        if (!prevProps.directionsView && this.props.directionsView && this.isShowTimetable()) {
            this.showTimetableFor(undefined);
        }
        // Showing trip details and query from/to changed (e.g. drag & frop of 'from' or 'to' pin), so set detail view
        // off (display routing results for new query). Notice it shouldn't be other causes of re-computing trips since
        // we are on trip details view.
        if (this.state.showTripDetail &&
            (prevProps.query.from !== this.props.query.from || prevProps.query.to !== this.props.query.to)) {
            this.setState({showTripDetail: false});
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
    }


    /**
     * Assumes timetables should show iff stop in global state is defined (not undefined).
     */
    private isShowTimetable(props?: IProps) {
        const targetProps = props || this.props;
        return targetProps.stop !== undefined || targetProps.timetableForSegment !== undefined;
    }

    private showTimetableFor(stop?: StopLocation) {
        this.props.onStopChange(stop);
    }
}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
    return (
        <TKUIConfigContext.Consumer>
            {(config: TKUIConfig) =>
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
                                                    userProfile: optionsContext.value,
                                                    onUserProfileChange: optionsContext.onChange,
                                                    userLocationPromise: config.userLocationPromise
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
        </TKUIConfigContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect(
    (config: TKUIConfig) => config.TKUITripPlanner, config, Mapper);