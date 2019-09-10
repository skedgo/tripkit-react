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
import GATracker from "../analytics/GATracker";
import ITripPlannerProps from "./ITripPlannerProps";
import TripGroup from "../model/trip/TripGroup";
import LeafletMap, {TKUIMapView} from "../map/LeafletMap";
import {TileLayer} from "react-leaflet";
import GeolocationData from "../geocode/GeolocationData";
import {TKUIDeparturesView} from "../service/ServiceDepartureTable";
import IServiceDepartureRowProps from "../service/IServiceDepartureRowProps";
import ServiceDepartureRow from "../service/ServiceDepartureRow";
import {TKUIServiceView} from "../service/ServiceDetailView";
import {ITripSelectionContext} from "./TripSelectionProvider";
import {TKUIResultsView, TKUIResultsViewConfig} from "../trip/TripsView";
import TripDetail, {TKUITripDetailConfig} from "../trip/TripDetail";
import Trip from "../model/trip/Trip";
import {IServiceResultsContext} from "../service/ServiceResultsProvider";
import TKUIFeedbackBtn from "../feedback/FeedbackBtn";

interface IState {
    mapView: boolean;
    showOptions: boolean;
    queryTimePanelOpen: boolean;
    showDepartures?: boolean;
    showTripDetail?: boolean;
    viewport: {center?: LatLng, zoom?: number};
    region?: Region;    // Once regions arrive region gets instantiated (with a valid region), and never becomes undefined.
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

class TripPlanner extends React.Component<ITripPlannerProps & ITripSelectionContext & IServiceResultsContext, IState> {

    public static defaultProps: Partial<ITripPlannerProps> = {
        config: new TKUITripPlannerConfig()
    };

    private eventBus: EventEmitter = new EventEmitter();
    private ref: any;
    private mapRef: LeafletMap;

    constructor(props: ITripPlannerProps & ITripSelectionContext & IServiceResultsContext) {
        super(props);
        const userIpLocation = Util.global.userIpLocation;
        this.state = {
            mapView: false,
            showOptions: false,
            queryTimePanelOpen: false,
            showDepartures: true,
            viewport: {center: userIpLocation ? LatLng.createLatLng(userIpLocation[0], userIpLocation[1]) : LatLng.createLatLng(-33.8674899,151.2048442), zoom: 13}
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

        this.onQueryChange = this.onQueryChange.bind(this);
        this.onFavClicked = this.onFavClicked.bind(this);
        this.onShowOptions = this.onShowOptions.bind(this);
        this.onModalRequestedClose = this.onModalRequestedClose.bind(this);

        // For development:
        RegionsData.instance.requireRegions().then(()=> {
            // StopsData.instance.getStopFromCode("AU_ACT_Canberra", "AU_ACT_Canberra-P4937")
            // StopsData.instance.getStopFromCode("AU_ACT_Canberra", "P3418")
            // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200060")
            // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200942")
            //     .then((stop: StopLocation) => {
            //             this.onQueryChange(Util.iAssign(this.props.query, {
            //                 from: stop
            //             }));
            //             this.props.onStopChange(stop);
            //         }
            //     )
        });
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

    private onShowOptions() {
        GATracker.instance.send('query input', 'click', 'options button');
        RegionsData.instance.requireRegions().then(() => this.setState({showOptions: true}));
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
        const departuresView = this.props.stop ?
            <Drawer
                open={this.props.stop}
                containerElementClass="TripPlanner-serviceModal"
                modalElementClass="TripPlanner-serviceModalContainer app-style"
                allowClose={false}
                dontApplyListeners={true}
            >
                <TKUIDeparturesView
                    renderDeparture={<P extends IServiceDepartureRowProps>(props: P) =>
                        <ServiceDepartureRow {...props}/>
                    }
                    onRequestClose={() => {
                        this.props.onStopChange(undefined);
                    }}
                />
            </Drawer> : null;
        const serviceDetailView = this.props.selectedService ?
            <Drawer
                open={this.props.selectedService}
                containerElementClass="TripPlanner-serviceModal"
                modalElementClass="TripPlanner-serviceModalContainer app-style"
                allowClose={false}
                dontApplyListeners={true}
            >
                <TKUIServiceView
                    renderDeparture={
                        <P extends IServiceDepartureRowProps>(props: P) =>
                            <ServiceDepartureRow {...props}/>
                    }
                    onRequestClose={() => this.props.onServiceSelection(undefined)}
                    eventBus={this.eventBus}
                />
            </Drawer> : null;
        const region = this.state.region;
        const queryInputBounds = region ? region.bounds : undefined;
        const queryInputFocusLatLng = region ? (region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()) : undefined;
        return (
            <div id="mv-main-panel"
                 className={"mainViewPanel TripPlanner" +
                 (this.props.trips ? " TripPlanner-tripsView" : " TripPlanner-noTripsView") +
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
                                    ( this.props.trips ? <IconTrips className="TripPlanner-iconMap gl-charSpace" focusable="false"/> : <IconFav className="TripPlanner-iconMap gl-charSpace" focusable="false"/> ) :
                                    <IconMap className="TripPlanner-iconMap gl-charSpace" focusable="false"/> }
                                { this.state.mapView ?
                                    ( this.props.trips ? "Show trips" : "Show favourites" ) :
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
                                <TKUIMapView
                                    viewport={this.state.viewport}
                                    onViewportChanged={(viewport: { center?: LatLng, zoom?: number }) => {
                                        this.setState({viewport: viewport});
                                    }}
                                    showLocations={true}
                                    eventBus={this.eventBus}
                                    refAdHoc={(ref: any) => {
                                        return this.mapRef = ref;
                                    }}
                                >
                                    <TileLayer
                                        attribution="&copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                        url="http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg"
                                    />
                                </TKUIMapView>
                            </div>
                            <TKUIFeedbackBtn/>
                        </div>
                    </div>
                </div>
                {optionsDialog}
                {departuresView}
                {serviceDetailView}
            </div>
        );
    }

    private onModalRequestedClose() {
        this.setState({showOptions: false});
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