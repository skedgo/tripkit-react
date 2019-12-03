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
import {MapLocationType} from "../model/location/MapLocationType";
import OptionsData from "../data/OptionsData";
import LocationUtil from "../util/LocationUtil";
import GATracker from "../analytics/GATracker";
import {Visibility} from "../model/trip/SegmentTemplate";
import TransportPinIcon from "./TransportPinIcon";
import {default as SegmentPopup} from "./SegmentPopup";
import Street from "../model/trip/Street";
import ServiceShape from "../model/trip/ServiceShape";
import {default as ServiceStopPopup} from "./ServiceStopPopup";
import {ReactComponent as IconServiceStop} from "../images/ic-service-stop.svg";
import ServiceDeparture from "../model/service/ServiceDeparture";
import MapService from "./MapService";
import TransportUtil from "../trip/TransportUtil";
import ServiceStopLocation from "../model/ServiceStopLocation";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import MultiGeocoder from "../geocode/MultiGeocoder";
import ReactResizeDetector from "react-resize-detector";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import MapUtil from "../util/MapUtil";
import StopLocation from "../model/StopLocation";
import {renderToStaticMarkup} from "react-dom/server";
import TKUIMapLocations from "./TKUIMapLocations";
import {tKUIFriendlinessColors} from "../trip/TKUIWCSegmentInfo.css";

interface ITKUIMapViewProps {
    hideLocations?: boolean;
    bounds?: BBox;
    padding?: {top?: number, right?: number, bottom?: number, left?: number}
    children: any;
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
    viewport?: {center?: LatLng, zoom?: number};
    onViewportChange?: (viewport: {center?: LatLng, zoom?: number}) => void;
    onStopChange: (stop?: StopLocation) => void;
    directionsView?: boolean;
}

interface IProps extends ITKUIMapViewProps, IConnectionProps {}

interface IState {
    mapLayers: Map<MapLocationType, Location[]>;
}

export interface IMapSegmentRenderer {
    renderPinIcon: () => JSX.Element;
    renderPopup?: () => JSX.Element;
    polylineOptions: PolylineProps | PolylineProps[];
    renderServiceStop: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element | undefined;
    renderServiceStopPopup: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element;
}

// class ReactMap<P extends MapProps & IProps> extends React.Component<P, {}> {
class LeafletMap extends React.Component<IProps, IState> {

    private leafletElement?: L.Map;

    private wasDoubleClick = false;

    constructor(props: Readonly<IProps>) {
        super(props);
        this.state = {
            mapLayers: new Map<MapLocationType, Location[]>(),
        };
        this.onMoveEnd = this.onMoveEnd.bind(this);
    }

    private onMoveEnd() {
        const mapBounds = this.leafletElement!.getBounds();
        if (mapBounds.getNorth() === 90) {  // Filter first bounds, which are like max possible bounds
            return;
        }
    }

    /**
     * if color === null show friendliness (which makes sense for bicycle and wheelchair segments)
     */
    private streetsRenderer(streets: Street[], color: string | null) {
        return streets.map((street: Street) => {
            return {
                positions: street.waypoints,
                weight: 9,
                color: "black",
                opacity: 1  // Disable safe distinction for now
            } as PolylineProps
        }).concat(streets.map((street: Street) => {
            return {
                positions: street.waypoints,
                weight: 7,
                color: color ? color : street.safe ? tKUIFriendlinessColors.safe :
                    street.safe === false ? tKUIFriendlinessColors.unsafe :
                        street.dismount ? tKUIFriendlinessColors.dismount : tKUIFriendlinessColors.unknown,
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
            this.onViewportChange(Util.iAssign(this.props.viewport || {}, {center: fitSet[0]}));
            return;
        }
        this.fitBounds(BBox.createBBoxArray(fitSet));
    }

    private onViewportChange(viewport: {center?: LatLng, zoom?: number}) {
        if (this.props.onViewportChange) {
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
                        segment.streets ? this.streetsRenderer(segment.streets, segment.isBicycle() || segment.isWheelchair() ? null : color) : [],
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
                            color: shape.travelled ? color! : "grey",
                            opacity: shape.travelled ? 1 : .5
                        }}/>,
                    renderServiceStopPopup: (stop: ServiceStopLocation, shape: ServiceShape) =>
                        <ServiceStopPopup stop={stop} shape={shape}/>
                }
            };
        let tripSegments;
        if (this.props.trip) {
            tripSegments = this.props.trip.getSegments(Visibility.ON_MAP).concat([this.props.trip.arrivalSegment]);
        }
        const enabledMapLayers = OptionsData.instance.get().mapLayers;
        return (
            <div className={"gl-flex gl-grow"}>
                <RLMap
                    className="map-canvas avoidVerticalScroll gl-flex gl-grow"
                    viewport={this.props.viewport}
                    boundsOptions={{padding: [20, 20]}}
                    maxBounds={L.latLngBounds([-90, -180], [90, 180])} // To avoid lngs greater than 180.
                    onViewportChanged={(viewport: {center?: [number, number], zoom?: number}) => {
                        this.onViewportChange({
                            center: viewport.center ? LatLng.createLatLng(viewport.center[0], viewport.center[1]) : undefined,
                            zoom: viewport.zoom
                        });
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
                    {this.leafletElement && this.props.hideLocations !== true &&
                        <TKUIMapLocations
                            bounds={LeafletUtil.toBBox(this.leafletElement.getBounds())}
                            enabledMapLayers={enabledMapLayers}
                            zoom={this.leafletElement.getZoom()}
                            onLocAction={(locType: MapLocationType, loc: Location) => {
                                if (locType === MapLocationType.STOP) {
                                    this.props.onStopChange(loc as StopLocation);
                                }
                            }}
                        />
                    }
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
        this.leafletElement!.on("dblclick", event1 => {
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
            const padding = Object.assign({top: 20, right: 20, bottom: 20, left: 20}, this.props.padding);
            const options = {paddingTopLeft: [padding.left, padding.top], paddingBottomRight: [padding.right, padding.bottom]} as FitBoundsOptions;
            this.leafletElement.fitBounds(L.latLngBounds([bounds.sw, bounds.ne]), options);
        }
    }

    public alreadyFits(bounds: BBox): boolean {
        return this.leafletElement ? this.leafletElement.getBounds().contains(LeafletUtil.fromBBox(bounds)) : false;
    }

    public onResize() {
        this.leafletElement!.invalidateSize();
    }
}

let geocodingData: MultiGeocoder;

function getGeocodingData() {
    if (!geocodingData) {
        geocodingData = new MultiGeocoder();
    }
    return geocodingData;
}

const Connector: React.SFC<{children: (props: IConnectionProps) => React.ReactNode}> =
    (props: {children: (props: IConnectionProps) => React.ReactNode}) => {
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
                                            [isFrom ? "from" : "to"]:
                                                latLng instanceof StopLocation ? latLng as StopLocation :
                                                    Location.create(latLng, "Location", "", "")
                                        }));
                                        getGeocodingData().reverseGeocode(latLng, loc => {
                                            if (loc !== null) {
                                                routingContext.onQueryChange(Util.iAssign(routingContext.query, {[isFrom ? "from" : "to"]: loc}));
                                            }
                                        })
                                    };
                                    const consumerProps: IConnectionProps = {
                                        from: routingContext.directionsView ? from : undefined,
                                        to: to,
                                        trip: routingContext.selected,
                                        onDragEnd: onMapLocChanged,
                                        onClick: (clickLatLng: LatLng) => {
                                            if (routingContext.directionsView) {
                                                if (!from || !to) {
                                                    onMapLocChanged(!from, clickLatLng);
                                                    GATracker.instance.send("query input", "pick location", "drop pin");
                                                }
                                            } else {
                                                if (!to) {
                                                    onMapLocChanged(false, clickLatLng);
                                                }
                                            }
                                        },
                                        service: serviceContext.selectedService && serviceContext.selectedService.serviceDetail ?
                                            serviceContext.selectedService : undefined,
                                        viewport: routingContext.viewport,
                                        onViewportChange: routingContext.onViewportChange,
                                        onStopChange: serviceContext.onStopChange,
                                        directionsView: routingContext.directionsView
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