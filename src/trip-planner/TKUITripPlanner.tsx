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
import LeafletMap, {TKUIMapView} from "../map/LeafletMap";
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
import {ClassNameMap} from "react-jss";
import {tKUITripPlannerDefaultStyle} from "./TKUITripPlanner.css";
import TKUIRoutingQueryInput from "query/TKUIRoutingQueryInput";
import { Carousel } from 'react-responsive-carousel';
import Trip from "../model/trip/Trip";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import TKUICardCarousel from "../card/TKUICardCarousel";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";
import TKUIProfileView from "../options/TKUIProfileView";
import {ITKUIComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {}

interface IConsumedProps extends IRoutingResultsContext, IServiceResultsContext {}

export interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export interface IStyle {
    queryPanel: CSSProps<IProps>;
}

export type TKUITKUITripPlannerProps = IProps;
export type TKUITKUITripPlannerStyle = IStyle;

const config: ITKUIComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITripPlanner {...props}/>,
    styles: tKUITripPlannerDefaultStyle,
    classNamePrefix: "TKUITripPlanner"
};

interface IState {
    mapView: boolean;
    showOptions: boolean;
    showTripDetail?: boolean;
}

    // TODO:
    // SEGUIR ACÁ
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

class TKUITripPlanner extends React.Component<IProps, IState> {

    private ref: any;
    private mapRef?: LeafletMap;

    constructor(props: IProps) {
        super(props);
        const userIpLocation = Util.global.userIpLocation;
        this.state = {
            mapView: false,
            showOptions: false,
            showTripDetail: false
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

        this.onShowOptions = this.onShowOptions.bind(this);
        this.onOptionsRequestedClose = this.onOptionsRequestedClose.bind(this);

        // For development:
        RegionsData.instance.requireRegions().then(()=> {
            // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200942")
            // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "AU_NSW_Sydney-Central Station Railway Square-bus")
            StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200070")
            // StopsData.instance.getStopFromCode("AU_ACT_Canberra", "AU_ACT_Canberra-P4937")
            // StopsData.instance.getStopFromCode("AU_ACT_Canberra", "P3418")
            // StopsData.instance.getStopFromCode("AU_NSW_Sydney", "200060") // Central Station
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
                <TKUIProfileView
                    onClose={this.onOptionsRequestedClose}
                    className={"app-style"}
                />
            </Modal> : null;

        const departuresView = this.props.stop && !this.props.trips ?
            <TKUITimetableView
                onRequestClose={() => {
                    this.props.onStopChange(undefined);
                }}
            /> : null;

        const serviceDetailView = this.props.selectedService ?
            <TKUIServiceView
                onRequestClose={() => this.props.onServiceSelection(undefined)}
            /> : null;

        const routingResultsView = this.props.trips && !(this.state.showTripDetail && this.props.selected) ?
            <TKUIResultsView
                className="gl-no-shrink"
                onDetailsClicked={() => {
                    this.setState({showTripDetail: true});
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
                 className={"mainViewPanel TripPlanner" +
                 (this.props.trips ? " TripPlanner-tripsView" : " TripPlanner-noTripsView") +
                 (this.state.mapView ? " TripPlanner-mapView" : " TripPlanner-noMapView") +
                 (this.props.selected ? " TripPlanner-tripSelected" : " TripPlanner-noTripSelected")}
                 ref={el => this.ref = el}
            >
                <div className={classes.queryPanel}>
                    <TKUIRoutingQueryInput
                        isTripPlanner={true}
                        onShowOptions={this.onShowOptions}
                        collapsable={true}
                    />
                </div>
                <div id="map-main" className="TripPlanner-mapMain avoidVerticalScroll gl-flex gl-grow gl-column">
                    <TKUIMapView
                        hideLocations={this.props.trips !== undefined || this.props.selectedService !== undefined}
                        refAdHoc={(ref: any) => {
                            return this.mapRef = ref;
                        }}
                        padding={{left: 500}}
                    >
                        <TileLayer
                            attribution="&copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                            // url="http://1.base.maps.cit.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=aYTqZORZ7FFwqoFZ7c4j&app_code=qUK5XVczkZcFESPnGPFKPg"
                            url="https://api.mapbox.com/styles/v1/mgomezlucero/cjvp9zm9114591cn8cictke9e/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWdvbWV6bHVjZXJvIiwiYSI6ImNqa3N3aTQ0cjAxZ3UzdnRnbWtyZDY4bXMifQ.mLGxFRgw2xvCmNa8DVrtxA"
                        />
                    </TKUIMapView>
                </div>
                <TKUIFeedbackBtn/>
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