import * as React from "react";
import './TripPlanner.css'
import '../css/act-app.css';
import RegionsData from "../data/RegionsData";
import LatLng from "../model/LatLng";
// import Location from "../model/Location";
import QueryInput from "../query/QueryInput";
import RoutingQuery from "../model/RoutingQuery";
import FavouriteList from "../favourite/FavouriteList";
import FavouriteTrip from "../model/FavouriteTrip";
import BBox from "../model/BBox";
import TripsView from "../trip/TripsView";
import Trip from "../model/trip/Trip";
import FavouriteBtn from "../favourite/FavouriteBtn";
import Modal from 'react-modal';
import OptionsView from "../options/OptionsView";
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
import TripRow, {IProps as TripRowProps} from "../trip/TripRow";
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
import TripDetail from "../trip/TripDetail";
import ReactMap from "../map/ReactMap";
import Location from "../model/Location";
import MultiGeocoder from "../location_box/MultiGeocoder";
import LocationUtil from "../util/LocationUtil";
import {TileLayer} from "react-leaflet";

interface IState {
    tripsSorted: Trip[] | null;
    selected?: Trip;
    mapView: boolean;
    showOptions: boolean;
    queryInputBounds?: BBox;
    queryInputFocusLatLng?: LatLng;
    preFrom?: Location;
    preTo?: Location;
    queryTimePanelOpen: boolean;
    feedbackTooltip: boolean;
    viewport: {center?: LatLng, zoom?: number};
    mapBounds?: BBox;
}

class TripPlanner extends React.Component<ITripPlannerProps, IState> {

    private eventBus: EventEmitter = new EventEmitter();
    private ref: any;
    private mapRef: ReactMap;
    private geocodingData: MultiGeocoder;

    constructor(props: ITripPlannerProps) {
        super(props);
        this.state = {
            tripsSorted: this.props.trips ? TripsView.sortTrips(this.props.trips) : this.props.trips,
            selected: undefined,
            mapView: false,
            showOptions: false,
            // TODO: Hardcode ACT bounding box to initalize, but not necessary (can leave undefined)
            queryInputBounds: BBox.createBBox(LatLng.createLatLng(-34.37701,149.852),
                LatLng.createLatLng(-35.975,148.674)),
            queryInputFocusLatLng: LatLng.createLatLng(-35.3, 149.1),
            queryTimePanelOpen: false,
            feedbackTooltip: false,
            viewport: {center: LatLng.createLatLng(-35.2816099,149.1264842), zoom: 13}
        };
        // Trigger regions request asap
        RegionsData.instance.getRegionP(new LatLng()); // TODO improve
        this.eventBus.addListener("onChangeView", (view: string) => {
            if (view === "mapView") {
                this.setState({ mapView: true });
            }
        });

        this.eventBus.addListener(TripRow.TRIP_ALT_PICKED_EVENT, (orig: TripGroup, update: TripGroup) => {
            this.setState(prevState => {
                if (prevState.tripsSorted) {
                    const tripsUpdate = prevState.tripsSorted.slice();
                    tripsUpdate[prevState.tripsSorted.indexOf(orig)] = update;
                    return {tripsSorted: tripsUpdate};
                }
                return null;
            })
        });

        WaiAriaUtil.addTabbingDetection();

        this.geocodingData = new MultiGeocoder(true);

        this.onQueryChange = this.onQueryChange.bind(this);
        this.onFavClicked = this.onFavClicked.bind(this);
        this.onOptionsChange = this.onOptionsChange.bind(this);
        this.onShowOptions = this.onShowOptions.bind(this);
        this.onModalRequestedClose = this.onModalRequestedClose.bind(this);
        this.onMapLocChanged = this.onMapLocChanged.bind(this);
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
            const favOptions = Util.iAssign(query.options, FavouritesData.getFavOptionsPart(favourite.options));
            OptionsData.instance.save(favOptions);
            query.options = favOptions;
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
        RegionsData.instance.getRegionP(new LatLng())
            .then(() => this.setState({showOptions: true}));
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
                <OptionsView value={this.props.query.options}
                             region={RegionsData.instance.getRegion(new LatLng())!}
                             onChange={this.onOptionsChange}
                             onClose={this.onModalRequestedClose}
                             className="app-style"
                />
            </Modal>
            : null;
        return (
            <div id="mv-main-panel"
                 className={"mainViewPanel TripPlanner" +
                 (this.props.trips !== null ? " TripPlanner-tripsView" : " TripPlanner-noTripsView") +
                 (this.state.mapView ? " TripPlanner-mapView" : " TripPlanner-noMapView") +
                 (this.state.selected ? " TripPlanner-tripSelected" : " TripPlanner-noTripSelected") +
                 (this.state.queryTimePanelOpen ? " TripPlanner-queryTimePanelOpen" : "")}
                 ref={el => this.ref = el}
            >
                <div className="avoidVerticalScroll gl-flex gl-grow gl-column">
                    <div className="TripPlanner-queryPanel gl-flex gl-column gl-no-shrink">
                        <QueryInput value={this.props.query}
                                    bounds={this.state.queryInputBounds}
                                    focusLatLng={this.state.queryInputFocusLatLng}
                                    onChange={(query: RoutingQuery) => {
                                        if (this.checkFitLocation(this.props.query.from, query.from)
                                            || this.checkFitLocation(this.props.query.to, query.to)) {
                                            this.fitMap(query, this.state.preFrom, this.state.preTo);
                                        }
                                        this.onQueryChange(query);
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
                            {this.state.tripsSorted === null ?
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
                                <TripsView values={this.state.tripsSorted}
                                           value={this.state.selected}
                                           onChange={(value: Trip) => this.setState({selected: value})}
                                           waiting={this.props.waiting}
                                           eventBus={this.eventBus}
                                           className="gl-no-shrink"
                                           renderTrip={<P extends TripRowProps>(props: P) =>
                                               <div key={(props as any).key}>
                                                   <TripRow {...props}/>
                                                   <TripDetail value={props.value}/>
                                               </div>
                                           }
                                />
                            }
                        </div>
                        <div className="sg-container gl-flex gl-grow" aria-hidden={true} tabIndex={-1}>
                            <div id="map-main" className="TripPlanner-mapMain avoidVerticalScroll gl-flex gl-grow gl-column">
                                <ReactMap
                                    viewport={this.state.viewport}
                                    onViewportChanged={(viewport: {center?: LatLng, zoom?: number}) => {
                                        this.setState({viewport: viewport});
                                    }}
                                    from={this.state.preFrom ? this.state.preFrom :
                                        (this.props.query.from ? this.props.query.from : undefined)}
                                    to={this.state.preTo ? this.state.preTo :
                                        (this.props.query.to ? this.props.query.to : undefined)}
                                    trip={this.state.selected}
                                    ondragend={this.onMapLocChanged}
                                    onclick={(clickLatLng: LatLng) => {
                                        const from = this.props.query.from;
                                        const to = this.props.query.to;
                                        if (from === null || to === null) {
                                            this.onMapLocChanged(from === null, clickLatLng);
                                            GATracker.instance.send("query input", "pick location", "drop pin");
                                        }
                                    }}
                                    bounds={this.state.mapBounds}
                                    showLocations={true}
                                    ref={(ref: ReactMap) => this.mapRef = ref}
                                >
                                    <TileLayer
                                        attribution="&copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                        // url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                                        url="http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg"
                                    />
                                </ReactMap>
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
        const optionsJson = jsonConvert.serialize(this.props.query.options);
        return "webapp url: " + encodeURI(this.props.query.getGoUrl("https://www.transport.act.gov.au/journey-planner/map")) + "\n\n"
            + "options: " + JSON.stringify(optionsJson) + "\n\n"
            + "satapp url: " +  (this.state.selected ? this.state.selected.satappQuery : "") + "\n\n"
            + "trip url: " +  (this.state.selected ? this.state.selected.temporaryURL : "");
    }

    public componentDidMount(): void {
        RegionsData.instance.getRegionP(new LatLng()).then((region: Region) => {
            this.setState({ queryInputBounds: region.bounds });
        });

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


    public componentDidUpdate(prevProps: Readonly<ITripPlannerProps>, prevState: Readonly<IState>, snapshot?: any): void {
        // Clear selected
        if (prevProps.trips !== this.props.trips) {
            this.setState({
                tripsSorted: this.props.trips ? TripsView.sortTrips(this.props.trips) : this.props.trips
            });
            if (!this.props.trips || this.props.trips.length === 0) {
                this.setState({
                    selected: undefined
                });
            }
        }
        // If first group of trips arrived
        if (!this.state.selected && prevState.tripsSorted !== null && prevState.tripsSorted.length === 0 && this.state.tripsSorted !== null && this.state.tripsSorted.length > 0) {
            setTimeout(() => {
                this.setState(
                    {selected: this.state.tripsSorted !== null && this.state.tripsSorted.length > 0 ?
                            this.state.tripsSorted[0] : undefined})
            }, 2000);
        }
        if (this.state.selected !== prevState.selected) {
            if (this.state.selected && this.mapRef) {
                const fitBounds = MapUtil.getTripBounds(this.state.selected);
                if (!this.mapRef.alreadyFits(fitBounds)) {
                    this.mapRef.fitBounds(fitBounds);
                }
            }
            PlannedTripsTracker.instance.selected = this.state.selected;
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
    }
}

export default TripPlanner;