import * as React from "react";
import './TripPlanner.css'
import '../css/app.css';
import RegionsData from "../data/RegionsData";
import LatLng from "../model/LatLng";
import {TKUIQueryInputView} from "../query/QueryInput";
import {TKUIFavouritesView} from "../favourite/FavouriteList";
import {TKUIFavQueryBtn} from "../favourite/FavouriteBtn";
import Modal from 'react-modal';
import {TKUIOptionsView} from "../options/OptionsView";
import Util from "../util/Util";
import {ReactComponent as IconMap} from "../images/ic-map-marked.svg";
import {ReactComponent as IconTrips} from "../images/ic-bars-solid.svg";
import {ReactComponent as IconFav} from "../images/ic-star-solid.svg";
import Region from "../model/region/Region";
import WaiAriaUtil from "../util/WaiAriaUtil";
import GATracker from "../analytics/GATracker";
import ITripPlannerProps from "./ITripPlannerProps";
import LeafletMap, {TKUIMapView} from "../map/LeafletMap";
import {TileLayer} from "react-leaflet";
import GeolocationData from "../geocode/GeolocationData";
import {TKUIDeparturesView} from "../service/ServiceDepartureTable";
import IServiceDepartureRowProps from "../service/IServiceDepartureRowProps";
import ServiceDepartureRow from "../service/ServiceDepartureRow";
import {TKUIServiceView} from "../service/ServiceDetailView";
import {TKUIResultsView, TKUIResultsViewConfig} from "../trip/TripsView";
import TripDetail, {TKUITripDetailConfig} from "../trip/TripDetail";
import {IServiceResultsContext} from "../service/ServiceResultsProvider";
import TKUIFeedbackBtn from "../feedback/FeedbackBtn";
import StopsData from "../data/StopsData";
import StopLocation from "../model/StopLocation";

interface IState {
    mapView: boolean;
    showOptions: boolean;
    showTripDetail?: boolean;
    viewport: {center?: LatLng, zoom?: number};
}

    // TODO:
    // - Finish disintegrating TripPlanner, connecting each component individually with providers: TripDetail
    // - Integrate carousel widget (did I used any) to be used with TripDetail.
    // - Style customizations: see if allow passing classes or style objects.
    // - Migrate to newer version of CRA typescript to get css modules. Add (at least) genStyles as modules. The other
    // depends on approach to get customization.
    // - Move client sample consumers to a connector for TripPlanner (as the other classes) and export TKUITripPlanner.
    // - Create a TKQueryProvider that encapsulates this part of the state (next five props), and that are passed to
    // - Improve the way components are connected, so tripkit-react clients can easily connect their own custom
    // component implementations.
    // - Maybe group different providers in unique comosite provider. Analyze. Make all the changes grounded on expected
    // use cases.
    // - Configuration points: provide all tripkit-iOS customization points. Then add more.
    //     - Render props passed along configurations, like TKUITripPlannerConfig or TKUIResultsViewConfig. Ver
    //     - Component-level customization en https://docs.google.com/document/d/1-TefPUgLV7RoK1qkr_j1XGSS9XSCUv0w9bMLk6__fUQ/edit#heading=h.s7sw7zyaie11
    // -------------------------------------------------------------------------------------------------------------
    // Acomodar código en tccs-react luego del cambio que hice.
    // Limpiar codigo luego de todos los cambios que hice
    // Mostrar / ocultar from / to / trips cuando se muestra un servicio. Ver todas las interacciones.

class TKUITripPlannerConfig {
    public resultsViewConfig: TKUIResultsViewConfig = new TKUIResultsViewConfig();
    public tripDetailConfig: TKUITripDetailConfig = new TKUITripDetailConfig();
}

class TripPlanner extends React.Component<ITripPlannerProps & IServiceResultsContext, IState> {

    public static defaultProps: Partial<ITripPlannerProps> = {
        config: new TKUITripPlannerConfig()
    };

    private ref: any;
    private mapRef?: LeafletMap;

    constructor(props: ITripPlannerProps & IServiceResultsContext) {
        super(props);
        const userIpLocation = Util.global.userIpLocation;
        this.state = {
            mapView: false,
            showOptions: false,
            viewport: {center: userIpLocation ? LatLng.createLatLng(userIpLocation[0], userIpLocation[1]) : LatLng.createLatLng(-33.8674899,151.2048442), zoom: 13}
        };
        if (!userIpLocation) {
            GeolocationData.instance.requestCurrentLocation(true).then((userLocation: LatLng) => {
                RegionsData.instance.getCloserRegionP(userLocation).then((region: Region) => {
                    this.props.onViewportChange({center: region.cities.length !== 0 ? region.cities[0] : region.bounds.getCenter()});
                })
            });
        }

        WaiAriaUtil.addTabbingDetection();

        this.onShowOptions = this.onShowOptions.bind(this);
        this.onOptionsRequestedClose = this.onOptionsRequestedClose.bind(this);

        // For development:
        RegionsData.instance.requireRegions().then(()=> {
            StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200942")
            // StopsData.instance.getStopFromCode("AU_ACT_Canberra", "AU_ACT_Canberra-P4937")
            // StopsData.instance.getStopFromCode("AU_ACT_Canberra", "P3418")
            // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200060")
                .then((stop: StopLocation) => {
                        this.props.onStopChange(stop);
                    }
                )
        });
    }

    private onShowOptions() {
        GATracker.instance.send('query input', 'click', 'options button');
        RegionsData.instance.requireRegions().then(() => this.setState({showOptions: true}));
    }

    public render(): React.ReactNode {
        const optionsDialog = this.state.showOptions ?
            <Modal
                isOpen={this.state.showOptions}
                appElement={this.ref}
                onRequestClose={this.onOptionsRequestedClose}
            >
                <TKUIOptionsView
                    onClose={this.onOptionsRequestedClose}
                    className={"app-style"}
                />
            </Modal> : null;

        const departuresView = this.props.stop ?
            <TKUIDeparturesView
                renderDeparture={<P extends IServiceDepartureRowProps>(props: P) =>
                    <ServiceDepartureRow {...props}/>
                }
                onRequestClose={() => {
                    this.props.onStopChange(undefined);
                }}
            /> : null;

        const serviceDetailView = this.props.selectedService ?
            <TKUIServiceView
                renderDeparture={
                    <P extends IServiceDepartureRowProps>(props: P) =>
                        <ServiceDepartureRow {...props}/>
                }
                onRequestClose={() => this.props.onServiceSelection(undefined)}
            /> : null;

        const routingResultsView = this.props.trips ?
            <TKUIResultsView
                className="gl-no-shrink"
                config={this.props.config.resultsViewConfig}
                onClicked={() => this.setState({showTripDetail: true})}
            /> : null;

        const tripDetailView = this.state.showTripDetail && this.props.selected ?
            <TripDetail
                value={this.props.selected}
                config={this.props.config.tripDetailConfig}
                onRequestClose={() => {
                    this.setState({showTripDetail: false})
                }}
            /> : null;

        return (
            <div id="mv-main-panel"
                 className={"mainViewPanel TripPlanner" +
                 (this.props.trips ? " TripPlanner-tripsView" : " TripPlanner-noTripsView") +
                 (this.state.mapView ? " TripPlanner-mapView" : " TripPlanner-noMapView") +
                 (this.props.selected ? " TripPlanner-tripSelected" : " TripPlanner-noTripSelected")}
                 ref={el => this.ref = el}
            >
                <div className="avoidVerticalScroll gl-flex gl-grow gl-column">
                    <div className="TripPlanner-queryPanel gl-flex gl-column gl-no-shrink">
                        <TKUIQueryInputView
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
                        />
                        <div className={"TripPlanner-queryFooter gl-flex gl-column gl-no-shrink"}>
                            <div className={"TripPlanner-favsBtnPanel gl-flex gl-align-center gl-no-shrink"}>
                                <TKUIFavQueryBtn/>
                            </div>
                            <button className="TripPlanner-mapBtn gl-link gl-flex gl-align-center"
                                    onClick={() => this.setState(prevState => {
                                        if (!prevState.mapView && this.mapRef) {
                                            setTimeout(() => {this.mapRef && this.mapRef.onResize()}, 100)
                                        }
                                        return {mapView: !prevState.mapView}
                                    })}>
                                { this.state.mapView ?
                                    ( this.props.trips ? <IconTrips className="TripPlanner-iconMap gl-charSpace" focusable="false"/> : <IconFav className="TripPlanner-iconMap gl-charSpace" focusable="false"/> ) :
                                    <IconMap className="TripPlanner-iconMap gl-charSpace" focusable="false"/> }
                                { this.state.mapView ?
                                    ( this.props.trips ? "Show trips" : "Show favourites" ) : "Show map" }
                            </button>
                        </div>
                    </div>
                    <div className="gl-flex gl-grow TripPlanner-resultsAndMapPanel">
                        <div className="TripPlanner-subQueryPanel gl-flex gl-scrollable-y gl-column gl-space-between">
                            {!this.props.trips ?
                                <div className="gl-no-shrink">
                                    <TKUIFavouritesView
                                        recent={false}
                                        previewMax={3}
                                        title={"MY FAVOURITE JOURNEYS"}
                                        moreBtnClass={"gl-button"}
                                    />
                                    <TKUIFavouritesView
                                        recent={true}
                                        showMax={3}
                                        title={"MY RECENT JOURNEYS"}
                                        className="TripPlanner-recentList"
                                        moreBtnClass={"gl-button"}
                                    />
                                </div>
                                : null
                            }
                        </div>
                        <div className="sg-container gl-flex gl-grow" aria-hidden={true} tabIndex={-1}>
                            <div id="map-main" className="TripPlanner-mapMain avoidVerticalScroll gl-flex gl-grow gl-column">
                                <TKUIMapView
                                    viewport={this.state.viewport}
                                    showLocations={true}
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
                {routingResultsView}
                {tripDetailView}
                {optionsDialog}
                {departuresView}
                {serviceDetailView}
            </div>
        );
    }

    private onOptionsRequestedClose() {
        this.setState({showOptions: false});
    }
}

export default TripPlanner;
export {TKUITripPlannerConfig};