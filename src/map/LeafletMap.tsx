import * as React from "react";
import "./LeafletMap.css";
import {Map as RLMap, Marker, Popup, ZoomControl, PolylineProps} from "react-leaflet";
import NetworkUtil from "../util/NetworkUtil";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
import Constants from "../util/Constants";
import L, {FitBoundsOptions} from "leaflet";
import BBox from "../model/BBox";
import LeafletUtil from "../util/LeafletUtil";
import Trip from "../model/trip/Trip";
import MapTripSegment from "./MapTripSegment";
import Segment from "../model/trip/Segment";
import Util from "../util/Util";
import {MapLocationType, mapLocationTypeToGALabel, values as locTypeValues} from "../model/location/MapLocationType";
import LocationsData from "../data/LocationsData";
import LocationsResult from "../model/location/LocationsResult";
import OptionsData from "../data/OptionsData";
import LocationUtil from "../util/LocationUtil";
import Options from "../model/Options";
import GATracker from "../analytics/GATracker";
import MapLocationPopup from "./MapLocationPopup";
import {Visibility} from "../model/trip/SegmentTemplate";
import TransportPinIcon from "./TransportPinIcon";
import {default as SegmentPopup} from "./SegmentPopup";
import Street from "../model/trip/Street";
import ServiceShape from "../model/trip/ServiceShape";
import {default as ServiceStopPopup} from "./ServiceStopPopup";
import IconServiceStop from "-!svg-react-loader!../images/ic-service-stop.svg";
import RegionsData from "../data/RegionsData";
import Region from "../model/region/Region";
import ServiceDeparture from "../model/service/ServiceDeparture";
import MapService from "./MapService";
import TransportUtil from "../trip/TransportUtil";
import ServiceStopLocation from "../model/ServiceStopLocation";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import MultiGeocoder from "../geocode/MultiGeocoder";
import ReactResizeDetector from "react-resize-detector";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import {MapUtil} from "../index";

interface ITKUIMapViewProps {
    showLocations?: boolean;
    viewport?: {center?: LatLng, zoom?: number};
    bounds?: BBox;
    // TODO: Put the following props inside config?
    attributionControl?: boolean;
    segmentRenderer?: (segment: Segment) => IMapSegmentRenderer;
    serviceRenderer?: (service: ServiceDeparture) => IMapSegmentRenderer;
}

interface IConnectionProps {
    from?: Location;
    to?: Location;
    trip?: Trip;
    service?: ServiceDeparture;
    onClick?: (latLng: LatLng) => void;
    onDragEnd?: (from: boolean, latLng: LatLng) => void;
    onViewportChange?: (viewport: {center?: LatLng, zoom?: number}) => void;
}

interface IProps extends ITKUIMapViewProps, IConnectionProps {}

interface IState {
    mapLayers: Map<MapLocationType, Location[]>;
    viewport: {center?: LatLng, zoom?: number};
}

interface IMapSegmentRenderer {
    renderPinIcon: () => JSX.Element;
    renderPopup?: () => JSX.Element;
    polylineOptions: PolylineProps | PolylineProps[];
    renderServiceStop: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element | undefined;
    renderServiceStopPopup: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element;
}

// class ReactMap<P extends MapProps & IProps> extends React.Component<P, {}> {
class LeafletMap extends React.Component<IProps, IState> {

    // private readonly ZOOM_ALL_LOCATIONS = 15;
    private readonly ZOOM_ALL_LOCATIONS = 0;    // Zoom all locations at any zoom.
    private readonly ZOOM_PARENT_LOCATIONS = 11;

    private leafletElement: L.Map;

    private wasDoubleClick = false;

    constructor(props: Readonly<IProps>) {
        super(props);
        this.state = {
            mapLayers: new Map<MapLocationType, Location[]>(),
            viewport: this.props.viewport ? this.props.viewport :
                {center: LatLng.createLatLng(-33.8674899,151.2048442), zoom: 13}
        };
        LocationsData.instance.addChangeListener((locResult: LocationsResult) => this.onLocationsChanged(locResult));
        OptionsData.instance.addChangeListener((update: Options, prev: Options) => {
            if (update.mapLayers !== prev.mapLayers) {
                this.refreshMapLocations();
            }
        });
        this.onMoveEnd = this.onMoveEnd.bind(this);
        this.onLocationsChanged = this.onLocationsChanged.bind(this);
    }

    private onMoveEnd() {
        const mapBounds = this.leafletElement.getBounds();
        if (mapBounds.getNorth() === 90) {  // Filter first bounds, which are like max possible bounds
            return;
        }
        this.refreshMapLocations();
    }

    private onLocationsChanged(locResult: LocationsResult) {
        if (this.leafletElement.getZoom() < this.ZOOM_PARENT_LOCATIONS || (this.leafletElement.getZoom() < this.ZOOM_ALL_LOCATIONS && locResult.level === 2)) {
            return;
        }
        const enabledMapLayers = OptionsData.instance.get().mapLayers;
        const updatedMapLayers = new Map(this.state.mapLayers);
        for (const locType of enabledMapLayers) {
        // for (const locType of values()) {
            if (locResult.getByType(locType) && enabledMapLayers.indexOf(locType) !== -1) {
                let uLayerLocs = updatedMapLayers.get(locType);
                uLayerLocs = uLayerLocs ? uLayerLocs.slice() : [];
                uLayerLocs = Util.addAllNoRep(uLayerLocs, locResult.getByType(locType), LocationUtil.equal);
                updatedMapLayers.set(locType, uLayerLocs);
            }
        }
        this.setState({ mapLayers: updatedMapLayers });
    }

    private refreshMapLocations() {
        const enabledMapLayers = OptionsData.instance.get().mapLayers;
        const showAny = this.props.showLocations && this.leafletElement.getZoom() >= this.ZOOM_ALL_LOCATIONS
            && enabledMapLayers.length > 0;
        if (showAny) { // TODO: replace by requesting just modes that correspond to selected location types.
            RegionsData.instance.getCloserRegionP(this.state.viewport!.center!).then((region: Region) => {
                LocationsData.instance.requestLocations(region.name, 1);
                if (this.leafletElement.getZoom() >= this.ZOOM_ALL_LOCATIONS
                    && this.leafletElement.getZoom() >= this.ZOOM_PARENT_LOCATIONS) { // To avoid crashing if ZOOM_ALL_LOCATIONS < ZOOM_PARENT_LOCATIONS
                    LocationsData.instance.requestLocations(region.name, 2, LeafletUtil.toBBox(this.leafletElement.getBounds()));
                }
            })
        }
    }

    private isShowLocType(type: MapLocationType): boolean {
        return !!this.props.showLocations && this.leafletElement && this.leafletElement.getZoom() >= this.ZOOM_ALL_LOCATIONS &&
            OptionsData.instance.get().mapLayers.indexOf(type) !== -1 && !!this.state.mapLayers.get(type);
    }

    private getLocMarker(mapLocType: MapLocationType, loc: Location): React.ReactNode {
        const popup = <Popup
            offset={[0, 0]}
            closeButton={false}
            className="LeafletMap-mapLocPopup"
        >
            <MapLocationPopup value={loc}/>
        </Popup>;
        switch (mapLocType) {
            case MapLocationType.BIKE_POD:
                return <Marker
                    position={loc}
                    icon={L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-bikeShare.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })}
                    onpopupopen={() => GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType))}>
                    {popup}
                </Marker>;
            case MapLocationType.MY_WAY_FACILITY:
                return <Marker
                    position={loc}
                    icon={L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-myway.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })}
                    onpopupopen={() => GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType))}>
                    {popup}
                </Marker>;
            case MapLocationType.PARK_AND_RIDE_FACILITY:
                return <Marker
                    position={loc}
                    icon={L.icon({
                        iconUrl: Constants.absUrl("/images/modeicons/ic-parkAndRide.svg"),
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    })}
                    onpopupopen={() => GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType))}>
                    {popup}
                </Marker>;
            default:
                return <Marker position={loc}/>;
        }
    }

    private streetsRenderer(streets: Street[], color: string) {
        return streets.map((street: Street) => {
            return {
                positions: street.waypoints,
                weight: 9,
                color: "black",
                // opacity: !this.segment.isBicycle() || street.safe ? 1 : .3
                opacity: 1  // Disable safe distinction for now
            } as PolylineProps
        }).concat(streets.map((street: Street) => {
            return {
                positions: street.waypoints,
                weight: 7,
                color: color,
                // opacity: !this.segment.isBicycle() || street.safe ? 1 : .3
                opacity: 1  // Disable safe distinction for now
            } as PolylineProps
        }));
    }

    private shapesRenderer(shapes: ServiceShape[], color: string): PolylineProps | PolylineProps[] {
        return shapes.map((shape: ServiceShape) => {
            return {
                positions: shape.waypoints,
                weight: 9,
                color: shape.travelled ? "black" : "lightgray",
                opacity: shape.travelled ? 1 : .5,
            } as PolylineProps
        }).concat(shapes.map((shape: ServiceShape) => {
            return {
                positions: shape.waypoints,
                weight: 7,
                color: shape.travelled ? color : "grey",
                opacity: shape.travelled ? 1 : .5,
            } as PolylineProps
        }));
    }

    private checkFitLocation(oldLoc?: Location | null, loc?: Location | null): boolean {
        return !!(oldLoc !== loc && loc && loc.isResolved());
    }

    private fitMap(from: Location | null, to: Location | null) {
        const fromLoc = from;
        const toLoc = to;
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
            this.setViewport(Util.iAssign(this.state.viewport, {center: fitSet[0]}), true);
            return;
        }
        this.fitBounds(BBox.createBBoxArray(fitSet));
    }

    private setViewport(viewport: {center?: LatLng, zoom?: number}, fireEvents: boolean = false) {
        this.setState({viewport: viewport});
        if (fireEvents && this.props.onViewportChange) {
            this.props.onViewportChange(viewport);
        }
    }

    public render(): React.ReactNode {
        const segmentRenderer = this.props.segmentRenderer ? this.props.segmentRenderer :
            (segment: Segment) => {
                const color = segment.getColor();
                return {
                    renderPinIcon: () => TransportPinIcon.createForSegment(segment),
                    renderPopup: () => <SegmentPopup segment={segment}/>,
                    polylineOptions: segment.shapes ? this.shapesRenderer(segment.shapes, color) :
                        segment.streets ? this.streetsRenderer(segment.streets, color) : [],
                    renderServiceStop: (stop: ServiceStopLocation, shape: ServiceShape) =>
                        <IconServiceStop style={{
                            color: shape.travelled ? color : "grey",
                            opacity: shape.travelled ? 1 : .5
                        }}/>,
                    renderServiceStopPopup: (stop: ServiceStopLocation, shape: ServiceShape) =>
                        <ServiceStopPopup stop={stop} shape={shape}/>

                }
            };
        const serviceRenderer = this.props.serviceRenderer ? this.props.serviceRenderer :
            (service: ServiceDeparture) => {
                let color = TransportUtil.getTransportColor(service.modeInfo);
                if (!color) {
                    color = "black";
                }
                return {
                    renderPinIcon: () => TransportPinIcon.createForService(service),
                    polylineOptions: service.serviceDetail && service.serviceDetail.shapes ?
                        this.shapesRenderer(service.serviceDetail.shapes, color) : [],
                    renderServiceStop: (stop: ServiceStopLocation, shape: ServiceShape) =>
                        <IconServiceStop style={{
                            color: shape.travelled ? color : "grey",
                            opacity: shape.travelled ? 1 : .5
                        }}/>,
                    renderServiceStopPopup: (stop: ServiceStopLocation, shape: ServiceShape) =>
                        <ServiceStopPopup stop={stop} shape={shape}/>
                }
            };
        let tripSegments;
        if (this.props.trip) {
            tripSegments = this.props.trip.segments.concat([this.props.trip.arrivalSegment]);
        }
        return (
            <div className={"gl-flex gl-grow"}>
                <RLMap
                    className="map-canvas avoidVerticalScroll gl-flex gl-grow"
                    viewport={this.state.viewport}
                    boundsOptions={{padding: [20, 20]}}
                    maxBounds={L.latLngBounds([-90, -180], [90, 180])} // To avoid lngs greater than 180.
                    onViewportChanged={(viewport: {center?: [number, number], zoom?: number}) => {
                        this.setViewport({
                            center: viewport.center ? LatLng.createLatLng(viewport.center[0], viewport.center[1]) : undefined,
                            zoom: viewport.zoom
                        }, true);
                    }}
                    onclick={(event: L.LeafletMouseEvent) => {
                        if (this.props.onClick) {
                            setTimeout(() => {
                                if (this.wasDoubleClick) {
                                    this.wasDoubleClick = false;
                                    return;
                                }
                                if (this.props.onClick) {
                                    this.props.onClick(LatLng.createLatLng(event.latlng.lat, event.latlng.lng));
                                }
                            })
                        }
                    }}
                    onmoveend={this.onMoveEnd}
                    ref={(ref: any) => {
                        if (ref) {
                            this.leafletElement = ref.leafletElement;
                        }
                    }}
                    zoomControl={false}
                    attributionControl={this.props.attributionControl !== false}
                >
                    <ZoomControl position={"topright"}/>
                    {this.props.from && this.props.from.isResolved() &&
                    <Marker position={this.props.from!}
                            icon={L.icon({
                                iconUrl: Constants.absUrl("/images/map/ic-map-pin-from.svg"),
                                iconSize: [35, 35],
                                iconAnchor: [17, 35],
                                className: "LeafletMap-pinFrom"
                            })}
                            draggable={true}
                            riseOnHover={true}
                            ondragend={(event: L.DragEndEvent) => {
                                if (this.props.onDragEnd) {
                                    const latLng = event.target.getLatLng();
                                    this.props.onDragEnd(true, LatLng.createLatLng(latLng.lat, latLng.lng));
                                }
                            }}/>}
                    {this.props.to && this.props.to.isResolved() &&
                    <Marker position={this.props.to!}
                            icon={L.icon({
                                iconUrl: Constants.absUrl("/images/map/ic-map-pin.svg"),
                                iconSize: [35, 35],
                                iconAnchor: [17, 35],
                                className: "LeafletMap-pinTo"
                            })}
                            draggable={true}
                            riseOnHover={true}
                            ondragend={(event: L.DragEndEvent) => {
                                if (this.props.onDragEnd) {
                                    const latLng = event.target.getLatLng();
                                    this.props.onDragEnd(false, LatLng.createLatLng(latLng.lat, latLng.lng));
                                }
                            }}
                    />}
                    {locTypeValues().map((locType: MapLocationType) =>
                        this.isShowLocType(locType) &&
                        this.state.mapLayers.get(locType)!.map((loc: Location) =>
                            this.getLocMarker(locType, loc)
                        )
                    )}
                    {tripSegments && tripSegments.map((segment: Segment, i: number) => {
                        return <MapTripSegment segment={segment}
                                               ondragend={(segment.isFirst(Visibility.IN_SUMMARY) || segment.arrival) && this.props.onDragEnd ?
                                                   (latLng: LatLng) => this.props.onDragEnd!(segment.isFirst(Visibility.IN_SUMMARY), latLng) : undefined}
                                               renderer={segmentRenderer(segment)}
                                               key={i}/>;
                    })}
                    {this.props.service &&
                    <MapService
                        serviceDeparture={this.props.service}
                        renderer={serviceRenderer(this.props.service)}
                    />
                    }
                    {this.props.children}
                </RLMap>
                <ReactResizeDetector handleWidth={true} handleHeight={true}
                                     onResize={() => this.onResize()}
                />
            </div>
        )
    }

    public componentWillMount(): void {
        NetworkUtil.loadCss("https://unpkg.com/leaflet@1.3.4/dist/leaflet.css");
    }


    public componentDidMount(): void {
        this.refreshMapLocations();
        this.leafletElement.on("dblclick", event1 => {
            this.wasDoubleClick = true;
        });

        // TODO Delete:
        setTimeout(() => this.onResize(), 5000);
    }

    public componentDidUpdate(prevProps: IProps): void {
        if (this.checkFitLocation(prevProps.from, this.props.from) || this.checkFitLocation(prevProps.to, this.props.to)) {
            // TODO: avoid switching from undefined to null, use one or the other.
            this.fitMap(this.props.from ? this.props.from : null, this.props.to ? this.props.to : null);
        }
        if (this.props.viewport && (prevProps.viewport !== this.props.viewport)) {
            this.setViewport(this.props.viewport, true);
        }
        // TODO: check that this is used to fit the map when comming from query input widget.
        // TODO: check is the change done to fit favourites will cause other undesired fits.
        // if (!prevProps.from && !prevProps.to &&
        if (this.props.from !== prevProps.from && this.props.to !== prevProps.to &&
            this.props.from && this.props.from.isResolved() && this.props.to && this.props.to.isResolved()) {
            this.fitBounds(BBox.createBBoxArray([this.props.from, this.props.to]));
        }
        const trip = this.props.trip;
        if (trip !== prevProps.trip && trip) {
            const fitBounds = MapUtil.getTripBounds(trip);
            if (!this.alreadyFits(fitBounds)) {
                this.fitBounds(fitBounds);
            }
        }
        const service = this.props.service;
        if (service !== prevProps.service) {
            if (service && service.serviceDetail && service.serviceDetail.shapes) {
                const fitBounds = MapUtil.getShapesBounds(service.serviceDetail.shapes);
                if (!this.alreadyFits(fitBounds)) {
                    this.fitBounds(fitBounds);
                }
            }
        }
    }

    public fitBounds(bounds: BBox) {
        if (this.leafletElement) {
            const options = {padding: [20, 20]} as FitBoundsOptions;
            this.leafletElement.fitBounds(L.latLngBounds([bounds.sw, bounds.ne]), options);
        }
    }

    public alreadyFits(bounds: BBox): boolean {
        return this.leafletElement ? this.leafletElement.getBounds().contains(LeafletUtil.fromBBox(bounds)) : false;
    }

    public onResize() {
        this.leafletElement.invalidateSize();
    }
}

const geocodingData: MultiGeocoder = new MultiGeocoder();

const Connector: React.SFC<{children: (props: Partial<IProps>) => React.ReactNode}> = (props: {children: (props: Partial<IProps>) => React.ReactNode}) => {
    return (
        <RoutingResultsContext.Consumer>
            {(routingContext: IRoutingResultsContext) =>
                <ServiceResultsContext.Consumer>
                    {(serviceContext: IServiceResultsContext) =>
                        <OptionsContext.Consumer>
                            {(optionsContext: IOptionsContext) => {
                                const from = routingContext.preFrom ? routingContext.preFrom :
                                    (routingContext.query.from ? routingContext.query.from : undefined);
                                const to = routingContext.preTo ? routingContext.preTo :
                                    (routingContext.query.to ? routingContext.query.to : undefined);
                                const onMapLocChanged = (isFrom: boolean, latLng: LatLng) => {
                                    routingContext.onQueryChange(Util.iAssign(routingContext.query, {
                                        [isFrom ? "from" : "to"]: Location.create(latLng, "Location", "", "")
                                    }));
                                    geocodingData.reverseGeocode(latLng, loc => {
                                        if (loc !== null) {
                                            routingContext.onQueryChange(Util.iAssign(routingContext.query, {[isFrom ? "from" : "to"]: loc}));
                                        }
                                    })
                                };
                                const consumerProps: Partial<IProps> = {
                                    from: from,
                                    to: to,
                                    trip: routingContext.selected,
                                    onDragEnd: onMapLocChanged,
                                    onClick: (clickLatLng: LatLng) => {
                                        if (!from || !to) {
                                            onMapLocChanged(!from, clickLatLng);
                                            GATracker.instance.send("query input", "pick location", "drop pin");
                                        }
                                    },
                                    service: serviceContext.selectedService && serviceContext.selectedService.serviceDetail ?
                                        serviceContext.selectedService : undefined,
                                    onViewportChange: routingContext.onViewportChange
                                };
                                return (
                                    props.children!(consumerProps)
                                );
                            }}
                        </OptionsContext.Consumer>
                    }
                </ServiceResultsContext.Consumer>
            }
        </RoutingResultsContext.Consumer>
    );
};

export const TKUIMapView = (props: ITKUIMapViewProps & {refAdHoc: (ref: any) => void}) =>
    <Connector>
        {(cProps: IConnectionProps) => <LeafletMap {...props} {...cProps}
                                                   ref={(ref: any) => props.refAdHoc(ref)}/>}
    </Connector>;

export default LeafletMap;
export {IMapSegmentRenderer};