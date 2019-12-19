import * as React from "react";
import './TripPlannerDelete.css'
import '../css/app.css';
import RegionsData from "../data/RegionsData";
import LatLng from "../model/LatLng";
import Modal from 'react-modal';
import Util from "../util/Util";
import Region from "../model/region/Region";
import WaiAriaUtil from "../util/WaiAriaUtil";
import GATracker from "../analytics/GATracker";
import {TileLayer} from "react-leaflet";
import GeolocationData from "../geocode/GeolocationData";
import TKUITimetableView from "../service/TKUITimetableView";
import TKUIResultsView from "../trip/TKUIResultsView";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import TKUIFeedbackBtn from "../feedback/FeedbackBtn";
import {IRoutingResultsContext, RoutingResultsContext} from "./RoutingResultsProvider";
import TKUIServiceView from "../service/TKUIServiceView";
import TKUITripOverviewView from "../trip/TKUITripOverviewView";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {tKUITripPlannerDefaultStyle} from "./TKUITripPlanner.css";
import TKUIRoutingQueryInput from "query/TKUIRoutingQueryInput";
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
import TKUIMapView from "../map/TKUIMapView";
import TKUISidebar from "../sidebar/TKUISidebar";
import MediaQuery from 'react-responsive';
import TKUIResponsiveUtil from "../util/TKUIResponsiveUtil";
import classNames from "classnames";
import {TKUISlideUpPosition} from "../card/TKUISlideUp";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {}

interface IConsumedProps extends IRoutingResultsContext, IServiceResultsContext {}

export interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export interface IStyle {
    main: CSSProps<IProps>;
    queryPanel: CSSProps<IProps>;
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
    showFavourites: boolean;
    showTripDetail?: boolean;
    cardPosition?: TKUISlideUpPosition;
}

    // TODO:
    // Naming convention: analyze when to suffix with 'View', maybe never? In iOS they use 'Card' suffix.
    // - Maybe define a WithCard HOC that wraps a component inside a Card, and adds properties open, onRequestClose, and
    // and any other property of card that want to expose to outside. OnRequestClose is passed to the card, but also to
    // the consumer / wrapped component, so it can control close (e.g. needed by TKUIProfileView apply btn).
    // Maybe also open? WithCard can be used to wrap connect: export default WithCard(connect(...)). Analyze where to
    // call it.
    // - TimeZone handling considering region change. Idea (think again): always handle moments in UTC, and convert to region timezone
    // just when need to display. E.g. See value passed to <DateTimePicker/> in TKUIRoutingQueryInput. So every use of defaultTimezone
    // in DateTimeUtil should be changed to use UTC.
    // - Remove class TKUIWithStyle? Probably it doesn't make sense anymore to pass style or randomizeClassNames directly to components,
    // instead should pass through config. Ignoring props.styles in withStyleInjection. Either remove property or merge.
    // - Can define ITKUIXXXStyle simpler given I just use it to get keys with keyof?
    // - Maybe give it a try to make use of contexts more efficient? or maybe leave for later and continue with next item.
    // - Finish propagating new arquitecture to all components.

    // [ ] Start with architecture change.
    // - mostrar stops en mapa
    // - agregar skedgo geocoding source
    // - Transport options view
    // - Mode by mode instructions
    // Improve scheme to import, from class / element to entire module (see TODO on imports above)
    // - Create a TKQueryProvider that encapsulates this part of the state (next five props), and that are passed to
    // - Configuration points: provide all tripkit-iOS customization points. Then add more.
    //     - Component-level customization en https://docs.google.com/document/d/1-TefPUgLV7RoK1qkr_j1XGSS9XSCUv0w9bMLk6__fUQ/edit#heading=h.s7sw7zyaie11
    // -------------------------------------------------------------------------------------------------------------
    // Limpiar codigo luego de todos los cambios que hice
    // Mostrar / ocultar from / to / trips cuando se muestra un servicio. Ver todas las interacciones.

function getTranslate3d(el: any) {
    let values = el.style.transform.split(/\w+\(|\);?/);
    if (!values[1] || !values[1].length) {
        return [];
    }
    return values[1].split(/,\s?/g).map((coordS: string) => parseInt(coordS.slice(0, coordS.indexOf("px"))));
}

class TKUITripPlanner extends React.Component<IProps, IState> {

    private ref: any;

    constructor(props: IProps) {
        super(props);
        const userIpLocation = Util.global.userIpLocation;
        this.state = {
            showSidebar: false,
            showSettings: false,
            mapView: false,
            showFavourites: false,
            showTripDetail: TKShareHelper.isSharedTripLink()
        };
        const initViewport = {center: userIpLocation ? LatLng.createLatLng(userIpLocation[0], userIpLocation[1]) : LatLng.createLatLng(-33.8674899,151.2048442), zoom: 13};
        this.props.onViewportChange(initViewport);
        if (!userIpLocation) {
            GeolocationData.instance.requestCurrentLocation(true).then((userLocation: LatLng) => {
                RegionsData.instance.getCloserRegionP(userLocation).then((region: Region) => {
                    this.props.onViewportChange({center: region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()});
                })
            });
        }

        WaiAriaUtil.addTabbingDetection();

        Modal.setAppElement(this.ref);

        this.onShowSettings = this.onShowSettings.bind(this);
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

    private onFavouriteClicked(favourite: Favourite) {
        if (favourite instanceof FavouriteStop) {
            this.props.onStopChange(favourite.stop);
        } else if (favourite instanceof FavouriteLocation) {
            this.props.onQueryUpdate({from: Location.createCurrLoc(), to: favourite.location, timePref: TimePreference.NOW});
            this.props.onDirectionsView(true);
        } else if (favourite instanceof FavouriteTrip) {
            this.props.onQueryUpdate({from: favourite.from, to: favourite.to, timePref: TimePreference.NOW});
            this.props.onDirectionsView(true);
        }
        FavouritesData.recInstance.add(favourite);
    }

    public render(): React.ReactNode {
        const searchBar =
            // this.state.cardPosition !== TKUISlideUpPosition.UP &&
            !this.props.directionsView &&
            <TKUILocationSearch
                onDirectionsClicked={() => {
                    this.props.onQueryChange(Util.iAssign(this.props.query, {from: Location.createCurrLoc()}));
                    this.props.onDirectionsView(true);
                }}
                onShowSideBar={() => {
                    console.log("show sidebar");
                    return this.setState({showSidebar: true});
                }}
            />;
        const sideBar =
            <TKUISidebar
                open={this.state.showSidebar && !this.props.directionsView}
                onRequestClose={() => {
                    console.log("hide sidebar");
                    return this.setState({showSidebar: false});
                }}
                onShowSettings={this.onShowSettings}
                onShowFavourites={() => this.setState({showFavourites: true})}
            />;
        const settings = this.state.showSettings &&
            <TKUIProfileView
                onClose={() => this.setState({showSettings: false})}
            />;
        const queryInput = this.props.directionsView &&
            <TKUIRoutingQueryInput
                isTripPlanner={true}
                onShowOptions={this.onShowSettings}
                collapsable={true}
                onClearClicked={() => {
                    this.props.onQueryChange(RoutingQuery.create());
                    this.props.onStopChange(undefined);
                    this.props.onDirectionsView(false);
                }}
            />;
        const toLocation = this.props.query.to;
        const locationDetailView = !this.props.directionsView && toLocation && toLocation.isResolved() &&
            !toLocation.isDroppedPin() && !this.props.stop &&
            <TKUILocationDetailView
                location={toLocation}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.DOWN,
                    onPositionChange: (position: TKUISlideUpPosition) => this.setState({cardPosition: position})
                }}
                // top={65}
            />;
        const favouritesView = this.state.showFavourites && !this.props.directionsView && !locationDetailView &&
            <TKUIFavouritesView
                onFavouriteClicked={this.onFavouriteClicked}
                onRequestClose={() => {this.setState({showFavourites: false})}}
                top={65}
            />;
        const departuresView =
            this.props.stop && !this.props.trips ?
            <TKUITimetableView
                open={this.props.stop && !this.props.trips}
                onRequestClose={() => {
                    this.props.onStopChange(undefined);
                }}
                top={this.props.directionsView ? 190 : 65}
            /> : null;

        const serviceDetailView = this.props.selectedService ?
            <TKUIServiceView
                onRequestClose={() => this.props.onServiceSelection(undefined)}
                top={this.props.directionsView ? 190 : 65}
            /> : null;

        const routingResultsView = this.props.directionsView && this.props.trips && !(this.state.showTripDetail && this.props.selected) ?
            <TKUIResultsView
                className="gl-no-shrink"
                onDetailsClicked={() => {
                    this.setState({showTripDetail: true});
                }}
                onShowOptions={this.onShowSettings}
                slideUpOptions={{
                    initPosition: TKUISlideUpPosition.MIDDLE,
                    // onPositionChange: (position: TKUISlideUpPosition) => this.setState({cardPosition: position})
                }}
                // styles={Util.iAssign(tKUIResultsDefaultStyle, {
                //     main: {
                //         ...tKUIResultsDefaultStyle.main,
                //         backgroundColor: 'lightcoral'
                //     }
                // })}
            /> : null;

        let tripDetailView;
        if (this.state.showTripDetail && this.props.selected) {
            const sortedTrips = this.props.trips || [];
            const selected = sortedTrips.indexOf(this.props.selected);
            tripDetailView =
                <TKUICardCarousel selected={selected} onChange={(selected: number) => this.props.onChange(sortedTrips[selected])}>
                    {sortedTrips.map((trip: Trip, i: number) =>
                        <TKUITripOverviewView
                            value={trip}
                            onRequestClose={() => {
                                this.setState({showTripDetail: false})
                            }}
                            key={i + "-" + trip.getKey()}
                        />)}
                </TKUICardCarousel>;
        }
        const classes = this.props.classes;
        return (
            <div id="mv-main-panel"
                 className={classNames(classes.main,
                     "mainViewPanel TripPlanner" +
                 (this.props.trips ? " TripPlanner-tripsView" : " TripPlanner-noTripsView") +
                 (this.state.mapView ? " TripPlanner-mapView" : " TripPlanner-noMapView") +
                 (this.props.selected ? " TripPlanner-tripSelected" : " TripPlanner-noTripSelected"))}
                 ref={el => this.ref = el}
            >
                <div className={classNames(classes.queryPanel, "sg-animate-fade",
                this.state.cardPosition === TKUISlideUpPosition.UP && !this.props.directionsView ? "out" : "in")}>
                    {searchBar}
                    {queryInput}
                </div>
                <div id="map-main" className="TripPlanner-mapMain avoidVerticalScroll gl-flex gl-grow gl-column">
                    <MediaQuery maxWidth={TKUIResponsiveUtil.getPortraitWidth()}>
                        {(matches: boolean) =>
                            <TKUIMapView
                                hideLocations={this.props.trips !== undefined || this.props.selectedService !== undefined}
                                padding={matches ? undefined : {left: 500}}
                            >
                                <TileLayer
                                    attribution="&copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                    // url="http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg"
                                    url="https://api.mapbox.com/styles/v1/mgomezlucero/cjvp9zm9114591cn8cictke9e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA"
                                />
                            </TKUIMapView>
                        }
                    </MediaQuery>
                </div>
                <TKUIFeedbackBtn/>
                {sideBar}
                {settings}
                {locationDetailView}
                {favouritesView}
                {routingResultsView}
                {tripDetailView}
                {departuresView}
                {serviceDetailView}
                {/*<TKUISlideUp>*/}
                    {/*<div style={{*/}
                        {/*background: 'lightblue',*/}
                        {/*...genStyles.grow*/}
                    {/*}}/>*/}
                {/*</TKUISlideUp>*/}
            </div>
        );
    }

    public componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (prevProps.query.from !== this.props.query.from && this.props.query.from && this.props.query.from.class === "StopLocation") {
            this.props.onStopChange(this.props.query.from as StopLocation);
        }
    }
}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingResultsContext: IRoutingResultsContext) =>
                <ServiceResultsContext.Consumer>
                    {(serviceContext: IServiceResultsContext) => (
                        props.children!({...routingResultsContext, ...serviceContext})
                    )}
                </ServiceResultsContext.Consumer>
            }
        </RoutingResultsContext.Consumer>
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