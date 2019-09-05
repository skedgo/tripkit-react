import * as React from "react";
import './TripPlanner.css'
import '../css/app.css';
import RegionsData from "../data/RegionsData";
import LatLng from "../model/LatLng";
import {TKUIQueryInputView} from "../query/QueryInput";
import RoutingQuery from "../model/RoutingQuery";
import FavouriteList from "../favourite/FavouriteList";
import FavouriteTrip from "../model/FavouriteTrip";
import BBox from "../model/BBox";
import FavouriteBtn from "../favourite/FavouriteBtn";
import Modal from 'react-modal';
import Drawer from 'react-drag-drawer';
import {TKUIOptionsView} from "../options/OptionsView";
import Options from "../model/Options";
import OptionsData from "../data/OptionsData";
import Util from "../util/Util";
import FavouritesData from "../data/FavouritesData";
import IconMap from "-!svg-react-loader!../images/ic-map-marked.svg";
import IconTrips from "-!svg-react-loader!../images/ic-bars-solid.svg";
import IconFav from "-!svg-react-loader!../images/ic-star-solid.svg";
import {EventEmitter} from "fbemitter";
import Region from "../model/region/Region";
import WaiAriaUtil from "../util/WaiAriaUtil";
import {TRIP_ALT_PICKED_EVENT} from "../trip/ITripRowProps";
import ReactResizeDetector from "react-resize-detector";
import MapUtil from "../util/MapUtil";
import GATracker from "../analytics/GATracker";
import PlannedTripsTracker from "../analytics/PlannedTripsTracker";
import {JsonConvert} from "json2typescript";
import iconFeedback from "../images/ic-feedback.svg";
import copy from 'copy-to-clipboard';
import Tooltip from "rc-tooltip";
import Constants from "../util/Constants";
import ITripPlannerProps from "./ITripPlannerProps";
import TripGroup from "../model/trip/TripGroup";
import LeafletMap from "../map/LeafletMap";
import Location from "../model/Location";
import MultiGeocoder from "../geocode/MultiGeocoder";
import LocationUtil from "../util/LocationUtil";
import {TileLayer} from "react-leaflet";
import GeolocationData from "../geocode/GeolocationData";
import ServiceDepartureTable from "../service/ServiceDepartureTable";
import withServiceResults from "../api/WithServiceResults";
import IServiceDepartureRowProps from "../service/IServiceDepartureRowProps";
import ServiceDepartureRow from "../service/ServiceDepartureRow";
import StopLocation from "../model/StopLocation";
import ServiceDetailView from "../service/ServiceDetailView";
import ServiceDeparture from "../model/service/ServiceDeparture";
import {ITripSelectionContext, TripSelectionContext} from "./TripSelectionProvider";
import {TKUIResultsView, TKUIResultsViewConfig} from "../trip/TripsView";
import {RoutingResultsContext} from "./RoutingResultsProvider";
import TripDetail, {TKUITripDetailConfig} from "../trip/TripDetail";
import Trip from "../model/trip/Trip";

interface IState {
    mapView: boolean;
    showOptions: boolean;
    region?: Region;    // Once regions arrive region gets instantiated (with a valid region), and never becomes undefined.
    preFrom?: Location;
    preTo?: Location;
    queryTimePanelOpen: boolean;
    feedbackTooltip: boolean;
    viewport: {center?: LatLng, zoom?: number};
    mapBounds?: BBox;
    showDepartures?: boolean;
    selectedDeparture?: ServiceDeparture;
    showTripDetail?: boolean;
}

    // TODO:
    // - Seguir desintegrando el TripPlanner, conectando cada componente, individualmente, con providers. Solo dejar
    // cuestiones de navegación y de layout y ocultar / mostrar en TripPlanner.
    // - hacer que en el onChange de TKUIResultsView muestre la vista de detalle de un trip.
    // - Render props pasadas a través de configuraciones, como TKUITripPlannerConfig o TKUIResultsViewConfig. Ver
    // Component-level customization en https://docs.google.com/document/d/1-TefPUgLV7RoK1qkr_j1XGSS9XSCUv0w9bMLk6__fUQ/edit#heading=h.s7sw7zyaie11
    // -------------------------------------------------------------------------------------------------------------
    // Acomodar código en tccs-react luego del cambio que hice.
    // Limpiar codigo luego de todos los cambios que hice
    // Mostrar / ocultar from / to / trips cuando se muestra un servicio. Ver todas las interacciones.

class TKUITripPlannerConfig {
    public resultsViewConfig: TKUIResultsViewConfig = new TKUIResultsViewConfig();
    public tripDetailConfig: TKUITripDetailConfig = new TKUITripDetailConfig();
}

class TripPlanner extends React.Component<ITripPlannerProps & ITripSelectionContext, IState> {

    public static defaultProps: Partial<ITripPlannerProps> = {
        config: new TKUITripPlannerConfig()
    };

    private eventBus: EventEmitter = new EventEmitter();
    private ref: any;
    private mapRef: LeafletMap;
    private geocodingData: MultiGeocoder;
    private DepartureTableWithData = withServiceResults(ServiceDepartureTable);

    constructor(props: ITripPlannerProps & ITripSelectionContext) {
        super(props);
        const userIpLocation = Util.global.userIpLocation;
        this.state = {
            mapView: false,
            showOptions: false,
            queryTimePanelOpen: false,
            feedbackTooltip: false,
            viewport: {center: userIpLocation ? LatLng.createLatLng(userIpLocation[0], userIpLocation[1]) : LatLng.createLatLng(-33.8674899,151.2048442), zoom: 13},
            showDepartures: true
        };
        if (!userIpLocation) {
            GeolocationData.instance.requestCurrentLocation(true).then((userLocation: LatLng) => {
                RegionsData.instance.getCloserRegionP(userLocation).then((region: Region) => {
                    this.setState({viewport: {center: region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()}});
                })
            });
        }
        // Trigger regions request asap
        RegionsData.instance.requireRegions();
        this.eventBus.addListener("onChangeView", (view: string) => {
            if (view === "mapView") {
                this.setState({ mapView: true });
            }
        });

        this.eventBus.addListener(TRIP_ALT_PICKED_EVENT, (orig: TripGroup, update: TripGroup) => {
            this.props.onAlternativeChange(orig, update.getSelectedTrip());
        });

        WaiAriaUtil.addTabbingDetection();

        this.geocodingData = new MultiGeocoder();

        this.onQueryChange = this.onQueryChange.bind(this);
        this.onFavClicked = this.onFavClicked.bind(this);
        this.onOptionsChange = this.onOptionsChange.bind(this);
        this.onShowOptions = this.onShowOptions.bind(this);
        this.onModalRequestedClose = this.onModalRequestedClose.bind(this);
        this.onMapLocChanged = this.onMapLocChanged.bind(this);

        // For development:
        // RegionsData.instance.requireRegions().then(()=> {
        //     StopsData.instance.getStopFromCode("AU_ACT_Canberra", "AU_ACT_Canberra-P4937")
            // StopsData.instance.getStopFromCode("AU_ACT_Canberra", "P3418")
            // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200060")
            //     .then((stop: StopLocation) =>
            //         this.onQueryChange(Util.iAssign(this.props.query, {
            //             from: stop
            //         }))
            //     )
        // });
    }

    public onQueryChange(query: RoutingQuery) {
        const prevQuery = this.props.query;
        this.props.onQueryChange(query);
        if (query.isComplete(true) &&
            (JSON.stringify(query.from) !== JSON.stringify(prevQuery.from)
                || JSON.stringify(query.to) !== JSON.stringify(prevQuery.to))) {
            FavouritesData.recInstance.add(FavouriteTrip.create(query.from!, query.to!));
        }
    }

    private onFavClicked(favourite: FavouriteTrip) {
        const query = RoutingQuery.create(favourite.from, favourite.to);
        if (favourite.options) {
            const favOptions = Util.iAssign(OptionsData.instance.get(), FavouritesData.getFavOptionsPart(favourite.options));
            OptionsData.instance.save(favOptions);
        }
        this.onQueryChange(query);
        if (this.mapRef && favourite.from.isResolved() && favourite.to.isResolved()) {
            this.mapRef.fitBounds(BBox.createBBoxArray([favourite.from, favourite.to]));
        }
    }

    private onOptionsChange(update: Options) {
        OptionsData.instance.save(update);
        this.onQueryChange(Util.iAssign(this.props.query, {options: update}));
    }

    private onShowOptions() {
        GATracker.instance.send('query input', 'click', 'options button');
        RegionsData.instance.requireRegions().then(() => this.setState({showOptions: true}));
    }

    private onMapLocChanged(from: boolean, latLng: LatLng) {
        this.onQueryChange(Util.iAssign(this.props.query, {
            [from ? "from" : "to"]: Location.create(latLng, "Location", "", "")
        }));
        this.geocodingData.reverseGeocode(latLng, loc => {
            if (loc !== null) {
                this.onQueryChange(Util.iAssign(this.props.query,{[from ? "from" : "to"]: loc}));
            }
        });
    }

    private checkFitLocation(oldLoc?: Location | null, loc?: Location | null): boolean {
        return !!(oldLoc !== loc && loc && loc.isResolved());
    }

    private fitMap(query: RoutingQuery, preFrom?: Location | null, preTo?: Location | null) {
        const fromLoc = preFrom ? preFrom : query.from;
        const toLoc = preTo ? preTo : query.to;
        const fitSet = [];
        if (fromLoc && fromLoc.isResolved()) {
            fitSet.push(fromLoc);
        }
        if (toLoc && toLoc.isResolved() && !fitSet.find((loc) => LocationUtil.equal(loc, toLoc))) {
            fitSet.push(toLoc);
        }
        if (fitSet.length === 0) {
            return;
        }
        if (fitSet.length === 1) {
            this.setState({viewport: {center: fitSet[0]}});
            return;
        }
        // this.setState({mapBounds: BBox.createBBoxArray(fitSet)})
        if (this.mapRef) {
            this.mapRef.fitBounds(BBox.createBBoxArray(fitSet));
        }
    }

    public render(): React.ReactNode {
        const favourite = (this.props.query.from !== null && this.props.query.to !== null) ?
            FavouriteTrip.create(this.props.query.from, this.props.query.to) :
            null;
        const optionsDialog = this.state.showOptions ?
            <Modal
                isOpen={this.state.showOptions}
                appElement={this.ref}
                onRequestClose={this.onModalRequestedClose}
            >
                <TKUIOptionsView
                    region={this.state.region!}
                    onClose={this.onModalRequestedClose}
                    className={"app-style"}
                />
            </Modal>
            : null;
        const fromStop = this.props.query.from && this.props.query.from instanceof StopLocation ? this.props.query.from as StopLocation : undefined;
        const departuresView = fromStop ?
            <Drawer
                open={this.state.showDepartures}
                containerElementClass="TripPlanner-serviceModal"
                modalElementClass="TripPlanner-serviceModalContainer app-style"
                // onRequestClose={() => {
                //     this.setState({showDepartures: false});
                // }}
                allowClose={false}
                dontApplyListeners={true}
            >
                <this.DepartureTableWithData
                    renderDeparture={<P extends IServiceDepartureRowProps>(props: P) =>
                        <ServiceDepartureRow {...props}/>
                    }
                    startStop={fromStop}
                    onRequestClose={() => {
                        this.setState({showDepartures: false});
                    }}
                    onSelection={(departure: ServiceDeparture) =>
                        this.setState({
                            selectedDeparture: departure,
                            // showDepartures: false
                        })}
                />
            </Drawer> : null;
        const serviceDetailView = this.state.selectedDeparture ?
            <Drawer
                open={this.state.selectedDeparture}
                containerElementClass="TripPlanner-serviceModal"
                modalElementClass="TripPlanner-serviceModalContainer app-style"
                // onRequestClose={() => {
                //     this.setState({showDepartures: false});
                // }}
                allowClose={false}
                dontApplyListeners={true}
            >
                <ServiceDetailView
                    departure={this.state.selectedDeparture}
                    onDepartureUpdate={(departure: ServiceDeparture) => {
                        this.setState({selectedDeparture: departure});
                        if(this.mapRef && departure.serviceDetail && departure.serviceDetail.shapes) {
                            const fitBounds = MapUtil.getShapesBounds(departure.serviceDetail.shapes);
                            if (!this.mapRef.alreadyFits(fitBounds)) {
                                this.mapRef.fitBounds(fitBounds);
                            }
                        }
                    }
                    }
                    renderDeparture={
                        <P extends IServiceDepartureRowProps>(props: P) =>
                            <ServiceDepartureRow {...props}/>
                    }
                    onRequestClose={() => {
                        this.setState({
                            selectedDeparture: undefined,
                            // showDepartures: true
                        });
                    }}
                    eventBus={this.eventBus}
                />
            </Drawer> : null;
        const region = this.state.region;
        const queryInputBounds = region ? region.bounds : undefined;
        const queryInputFocusLatLng = region ? (region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()) : undefined;
        return (
            <div id="mv-main-panel"
                 className={"mainViewPanel TripPlanner" +
                 (this.props.trips !== null ? " TripPlanner-tripsView" : " TripPlanner-noTripsView") +
                 (this.state.mapView ? " TripPlanner-mapView" : " TripPlanner-noMapView") +
                 (this.props.selected ? " TripPlanner-tripSelected" : " TripPlanner-noTripSelected") +
                 (this.state.queryTimePanelOpen ? " TripPlanner-queryTimePanelOpen" : "")}
                 ref={el => this.ref = el}
            >
                <div className="avoidVerticalScroll gl-flex gl-grow gl-column">
                    <div className="TripPlanner-queryPanel gl-flex gl-column gl-no-shrink">
                        <TKUIQueryInputView
                                    // value={this.props.query}
                                    bounds={queryInputBounds}
                                    focusLatLng={queryInputFocusLatLng}
                                    onChange={(query: RoutingQuery) => {
                                        // TODO: Try to remove this onChange handler, improve connection / integration with map
                                        if (this.checkFitLocation(this.props.query.from, query.from)
                                            || this.checkFitLocation(this.props.query.to, query.to)) {
                                            this.fitMap(query, this.state.preFrom, this.state.preTo);
                                        }
                                    }}
                                    onPreChange={(from: boolean, location?: Location) => {
                                        if (from) {
                                            this.setState({preFrom: location})
                                        } else {
                                            this.setState({preTo: location})
                                        }
                                    }}
                                    className="TripPlanner-queryInput"
                                    isTripPlanner={true}
                                    bottomRightComponent={
                                        <button className="TripPlanner-optionsBtn gl-link"
                                                onClick={this.onShowOptions}
                                        >
                                            Options
                                        </button>
                                    }
                                    collapsable={true}
                                    onTimePanelOpen={(open: boolean) => this.setState({queryTimePanelOpen: open})}
                        />
                        <div className={"TripPlanner-queryFooter gl-flex gl-column gl-no-shrink"}>
                            <div className={"TripPlanner-favsBtnPanel gl-flex gl-align-center gl-no-shrink"}>
                                <FavouriteBtn favourite={favourite}/>
                            </div>
                            <button className="TripPlanner-mapBtn gl-link gl-flex gl-align-center"
                                    onClick={() => this.setState(prevState => {
                                        if (!prevState.mapView && this.mapRef) {
                                            setTimeout(() => {this.mapRef.onResize()}, 100)
                                        }
                                        return {mapView: !prevState.mapView}
                                    })}>
                                { this.state.mapView ?
                                    ( this.props.trips !== null ? <IconTrips className="TripPlanner-iconMap gl-charSpace" focusable="false"/> : <IconFav className="TripPlanner-iconMap gl-charSpace" focusable="false"/> ) :
                                    <IconMap className="TripPlanner-iconMap gl-charSpace" focusable="false"/> }
                                { this.state.mapView ?
                                    ( this.props.trips !== null ? "Show trips" : "Show favourites" ) :
                                    "Show map" }
                            </button>
                        </div>
                    </div>
                    <div className="gl-flex gl-grow TripPlanner-resultsAndMapPanel">
                        <div className="TripPlanner-subQueryPanel gl-flex gl-scrollable-y gl-column gl-space-between">
                            {!this.props.trips ?
                                <div className="gl-no-shrink">
                                    <FavouriteList recent={false}
                                                   previewMax={3}
                                                   onValueClicked={this.onFavClicked}
                                                   title={"MY FAVOURITE JOURNEYS"}
                                                   moreBtnClass={"gl-button"}
                                    />
                                    <FavouriteList recent={true}
                                                   onValueClicked={this.onFavClicked}
                                                   showMax={3}
                                                   title={"MY RECENT JOURNEYS"}
                                                   className="TripPlanner-recentList"
                                                   moreBtnClass={"gl-button"}
                                    />
                                </div>
                                :
                                (this.state.showTripDetail && this.props.selected ?
                                    <div>
                                        <button onClick={() => this.setState({showTripDetail: false})}>
                                            Routes
                                        </button>
                                        <TripDetail
                                            value={this.props.selected}
                                            config={this.props.config.tripDetailConfig}
                                        />
                                    </div>
                                    :
                                    <TKUIResultsView
                                        eventBus={this.eventBus}
                                        className="gl-no-shrink"
                                        config={this.props.config.resultsViewConfig}
                                        onChange={(value: Trip) => this.setState({showTripDetail: true})}
                                    />)
                            }
                        </div>
                        <div className="sg-container gl-flex gl-grow" aria-hidden={true} tabIndex={-1}>
                            <div id="map-main" className="TripPlanner-mapMain avoidVerticalScroll gl-flex gl-grow gl-column">
                                <RoutingResultsContext.Consumer>
                                    {(routingResultsContext: ITripPlannerProps) => (
                                        <TripSelectionContext.Consumer>
                                            { (tripSelectionContext: ITripSelectionContext) =>
                                                <LeafletMap
                                                    viewport={this.state.viewport}
                                                    onViewportChanged={(viewport: { center?: LatLng, zoom?: number }) => {
                                                        this.setState({viewport: viewport});
                                                    }}
                                                    from={this.state.preFrom ? this.state.preFrom :
                                                        (routingResultsContext.query.from ? routingResultsContext.query.from : undefined)}
                                                    to={this.state.preTo ? this.state.preTo :
                                                        (routingResultsContext.query.to ? routingResultsContext.query.to : undefined)}
                                                    trip={tripSelectionContext.selected}
                                                    service={this.state.selectedDeparture && this.state.selectedDeparture.serviceDetail ?
                                                        this.state.selectedDeparture : undefined}
                                                    ondragend={this.onMapLocChanged}
                                                    onclick={(clickLatLng: LatLng) => {
                                                        const from = routingResultsContext.query.from;
                                                        const to = routingResultsContext.query.to;
                                                        if (from === null || to === null) {
                                                            this.onMapLocChanged(from === null, clickLatLng);
                                                            GATracker.instance.send("query input", "pick location", "drop pin");
                                                        }
                                                    }}
                                                    bounds={this.state.mapBounds}
                                                    showLocations={true}
                                                    eventBus={this.eventBus}
                                                    ref={(ref: LeafletMap) => this.mapRef = ref}
                                                >
                                                    <TileLayer
                                                        attribution="&copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                                        // url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                                                        url="http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg"
                                                    />
                                                </LeafletMap>
                                            }
                                        </TripSelectionContext.Consumer>
                                    )}
                                </RoutingResultsContext.Consumer>
                            </div>
                            <Tooltip
                                overlay={"Feedback info copied to clipboard"}
                                placement={"left"}
                                overlayClassName="TripPlanner-feedbackTooltip"
                                visible={this.state.feedbackTooltip}
                            >
                                <img src={Constants.absUrl(iconFeedback)} className="TripPlanner-feedbackBtn"
                                     onClick={() => {
                                         copy(this.getFeedback());
                                         this.setState({feedbackTooltip: true});
                                         setTimeout(() => this.setState({feedbackTooltip: false}), 3000);
                                     }}
                                     aria-hidden={true}
                                     tabIndex={0}
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
                {optionsDialog}
                {departuresView}
                {serviceDetailView}
                <ReactResizeDetector handleWidth={true} handleHeight={true}
                                     onResize={() => { if (this.mapRef) {this.mapRef.onResize()}} }/>
            </div>
        );
    }

    private onModalRequestedClose() {
        this.setState({showOptions: false});
    }

    private getFeedback(): string {
        const jsonConvert = new JsonConvert();
        const optionsJson = jsonConvert.serialize(OptionsData.instance.get());
        const location = window.location;
        const plannerUrl = location.protocol + "//" + location.hostname
            + (location.port ? ":" + location.port : "") + location.pathname;
        return "webapp url: " + encodeURI(this.props.query.getGoUrl(plannerUrl)) + "\n\n"
            + "options: " + JSON.stringify(optionsJson) + "\n\n"
            + "satapp url: " +  (this.props.selected ? this.props.selected.satappQuery : "") + "\n\n"
            + "trip url: " +  (this.props.selected ? this.props.selected.temporaryURL : "");
    }

    public componentDidMount(): void {
        this.refreshRegion();
        // TEST
        // this.onQueryChange(
            // RoutingQuery.create(
            //     Location.create(LatLng.createLatLng(-35.259895882885736,149.13169181963897),"Test Loc 1", "", ""),
            //     Location.create(LatLng.createLatLng(-35.39875861087259,149.08657349646094), "Test Loc 2", "", "")
            // )

            /* Stop map link on trip segment */
            // RoutingQuery.create(
            //     Location.create(LatLng.createLatLng(-35.2784371431124,149.1294023394585), "Northbourne Av Mantra", "", ""),
            //     Location.create(LatLng.createLatLng(-35.39875861087259,149.08657349646094), "Test Loc 2", "", "")
            // )

            /* Train */
            // RoutingQuery.create(
            //     Location.create(LatLng.createLatLng(-35.415468,149.069795), "McDonald's, Greenway, ACT, Australia", "", ""),
            //     Location.create(LatLng.createLatLng(-35.349614,149.241551), "McDonald's, Queanbeyan East, NSW", "", "")
            // )

            /* School bus */
            // RoutingQuery.create(
            //     Location.create(LatLng.createLatLng(-35.3152433,149.1244004), "Test Loc 1", "", ""),
            //     Location.create(LatLng.createLatLng(-35.3452326,149.08645239999998), "Test Loc 2", "", ""),
            //     TimePreference.LEAVE, DateTimeUtil.momentTZTime(1537851627000)
            // )

            /* Trips with many segments */
            // RoutingQuery.create(
            //     Location.create(LatLng.createLatLng(-35.20969535160483,149.12230642978102), "Gungaderra Creek, Harrison, ACT, Australia", "", ""),
            //     Location.create(LatLng.createLatLng(-35.40875434495638,149.12368361838165), "Test Loc 2", "", "")
            // )

            // RoutingQuery.create(
            //     Location.create(LatLng.createLatLng(-35.20969535160483,149.12230642978102), "Gungaderra Creek, Harrison, ACT, Australia", "", ""),
            //     Location.create(LatLng.createLatLng(-35.364709739050376,149.106717556715), "23 Jelbart Street, Mawson, ACT, Australia", "", "")
            // )
        // );
        // this.onShowOptions();
    }


    public componentDidUpdate(prevProps: Readonly<ITripPlannerProps & ITripSelectionContext>, prevState: Readonly<IState>, snapshot?: any): void {
        if (prevState.viewport !== this.state.viewport
            || prevProps.query.from !== this.props.query.from || prevProps.query.to !== this.props.query.to) {
            this.refreshRegion();
        }
        // Clear selected
        if (prevProps.trips !== this.props.trips) {
            if (!this.props.trips || this.props.trips.length === 0) {
                this.props.onChange(undefined);
            }
        }

        if (this.props.selected !== prevProps.selected) {
            if (this.props.selected && this.mapRef) {
                const fitBounds = MapUtil.getTripBounds(this.props.selected);
                if (!this.mapRef.alreadyFits(fitBounds)) {
                    this.mapRef.fitBounds(fitBounds);
                }
            }
            PlannedTripsTracker.instance.selected = this.props.selected;
            PlannedTripsTracker.instance.scheduleTrack(true);
        }

        if (this.props.trips !== prevProps.trips) {
            PlannedTripsTracker.instance.trips = this.props.trips;
        }
        if (prevProps.query.isEmpty() && this.props.query.isComplete(true)) {
            this.mapRef.fitBounds(BBox.createBBoxArray([this.props.query.from!, this.props.query.to!]));
        }
        if (this.checkFitLocation(prevState.preFrom , this.state.preFrom) || this.checkFitLocation(prevState.preTo, this.state.preTo)) {
            this.fitMap(this.props.query, this.state.preFrom, this.state.preTo);
        }
        if (prevProps.query.from !== this.props.query.from && !this.state.showDepartures) {
            this.setState({showDepartures: true});
        }
    }

    private refreshRegion() {
        const query = this.props.query;
        const referenceLatLng = query.from && query.from.isResolved() ? query.from :
            (query.to && query.to.isResolved() ? query.to : this.state.viewport.center);
        if (referenceLatLng) {
            RegionsData.instance.getCloserRegionP(referenceLatLng).then((region: Region) => {
                if (region.polygon === "") {
                    console.log("empty region");
                }
                this.setState({region: region});
            });
        }
    }
}

export default TripPlanner;
export {TKUITripPlannerConfig};