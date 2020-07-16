import * as React from "react";
import {Map as RLMap, Marker, Popup, ZoomControl, PolylineProps, Viewport, TileLayerProps} from "react-leaflet";
import L, {FitBoundsOptions} from "leaflet";
import NetworkUtil from "../util/NetworkUtil";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
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
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIMapViewDefaultStyle} from "./TKUIMapView.css";
import "./TKUIMapViewCss.css";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import classNames from "classnames";
import {TKUIViewportUtilProps, TKUIViewportUtil} from "../util/TKUIResponsiveUtil";
import TKUIMapPopup from "./TKUIMapPopup";
import TKUIMapLocationIcon from "./TKUIMapLocationIcon";
import TKUIMyLocationMapIcon from "./TKUIMyLocationMapIcon";
import GeolocationData from "../geocode/GeolocationData";
import {ReactComponent as IconCurrentLocation} from "../images/location/ic-curr-loc.svg";
import TKUIRealtimeVehicle from "./TKUIRealtimeVehicle";
import DateTimeUtil from "../util/DateTimeUtil";
import RealTimeVehicle from "../model/service/RealTimeVehicle";
import TKUIRealtimeVehiclePopup from "./TKUIRealtimeVehiclePopup";
import {TKUIConfigContext, default as TKUIConfigProvider} from "../config/TKUIConfigProvider";
import {ERROR_GEOLOC_DENIED, TKUserPosition} from "../util/GeolocationUtil";
import {tKUIColors} from "../index";
import TKUITooltip from "../card/TKUITooltip";
import TKErrorHelper from "../error/TKErrorHelper";
import {TileLayer} from "react-leaflet";
import MultiGeocoderOptions from "../geocode/MultiGeocoderOptions";
import IGeocoder from "../geocode/IGeocoder";
import {MapboxGlLayer} from '@mongodb-js/react-mapbox-gl-leaflet/lib/react-mapbox-gl-leaflet';
import Color from "../model/trip/Color";

export type TKUIMapPadding = {top?: number, right?: number, bottom?: number, left?: number};

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    hideLocations?: boolean;
    bounds?: BBox;
    padding?: TKUIMapPadding
    // TODO: Put the following props inside config?
    attributionControl?: boolean;
    segmentRenderer?: (segment: Segment) => IMapSegmentRenderer;
    serviceRenderer?: (service: ServiceDeparture) => IMapSegmentRenderer;
    onLocAction?: (locType: MapLocationType, loc: Location) => void;
}

export interface IStyle {
    main: CSSProps<IProps>;
    leaflet: CSSProps<IProps>;
    menuPopup: CSSProps<IProps>;
    menuPopupContent: CSSProps<IProps>;
    menuPopupItem: CSSProps<IProps>;
    menuPopupBelow: CSSProps<IProps>;
    menuPopupAbove: CSSProps<IProps>;
    menuPopupLeft: CSSProps<IProps>;
    menuPopupRight: CSSProps<IProps>;
    currentLocMarker: CSSProps<IProps>;
    currentLocBtn: CSSProps<IProps>;
    currentLocBtnLandscape: CSSProps<IProps>;
    currentLocBtnPortrait: CSSProps<IProps>;
    resolvingCurrLoc: CSSProps<IProps>;
    vehicle: CSSProps<IProps>;
    segmentIconClassName: CSSProps<IProps>;
    vehicleClassName: CSSProps<IProps>;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    from?: Location;
    to?: Location;
    trip?: Trip;
    service?: ServiceDeparture;
    onClick?: (latLng: LatLng) => void;
    onDragEnd?: (from: boolean, latLng: LatLng) => void;
    viewport?: {center?: LatLng, zoom?: number};
    onViewportChange?: (viewport: {center?: LatLng, zoom?: number}) => void;
    directionsView?: boolean;
    onDirectionsFrom: (latLng: LatLng) => void;
    onDirectionsTo: (latLng: LatLng) => void;
    onWhatsHere: (latLng: LatLng) => void;
    config: TKUIConfig;
}

interface MapboxGLLayerProps {
    accessToken: string;
    style: string;
    attribution: string;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {
    tileLayerProps?: TileLayerProps;
    mapboxGlLayerProps?: MapboxGLLayerProps;
}

export type TKUIMapViewProps = IProps;
export type TKUIMapViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMapView {...props}/>,
    styles: tKUIMapViewDefaultStyle,
    classNamePrefix: "TKUIMapView",
    props: {
        tileLayerProps: {
            attribution: "&copy <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
            url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
    }
};

interface IState {
    mapLayers: Map<MapLocationType, Location[]>;
    menuPopupPosition?: L.LeafletMouseEvent;
    userLocation?: TKUserPosition;
    userLocationTooltip?: string;
    refreshTiles?: boolean;
}

export interface IMapSegmentRenderer {
    renderPopup?: () => JSX.Element;
    polylineOptions: PolylineProps | PolylineProps[];
    renderServiceStop: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element | undefined;
    renderServiceStopPopup: (stop: ServiceStopLocation, shape: ServiceShape) => JSX.Element;
}

class TKUIMapView extends React.Component<IProps, IState> {

    private leafletElement?: L.Map;
    private wasDoubleClick = false;
    private userLocTooltipRef?: any;
    private mapboxGlMap?: any;

    constructor(props: Readonly<IProps>) {
        super(props);
        this.state = {
            mapLayers: new Map<MapLocationType, Location[]>()
        };
        this.onMoveEnd = this.onMoveEnd.bind(this);
        this.onTrackUserLocation = this.onTrackUserLocation.bind(this);
        this.showUserLocTooltip = this.showUserLocTooltip.bind(this);
        NetworkUtil.loadCss("https://unpkg.com/leaflet@1.3.4/dist/leaflet.css");
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
        return !!(oldLoc !== loc && loc && loc.isResolved()) && JSON.stringify(Util.transerialize(loc, LatLng)) !== JSON.stringify(avoidFitLatLng);
    }

    private fitMap(from: Location | null, to: Location | null) {
        const fromLoc = from;
        const toLoc = to;
        const fitSet: Location[] = [];
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
            // To avoid wrong calculation in movePointInPixels due to special case of initial bounds.
            const boundsEstablished = this.props.viewport &&
                JSON.stringify(this.props.viewport.center) !== JSON.stringify(MapUtil.worldCoords);
            const fitPoint = this.props.padding && this.props.padding.left && boundsEstablished ?
                MapUtil.movePointInPixels(fitSet[0], -this.props.padding.left/2, 0,
                    this.leafletElement!.getContainer().offsetWidth, this.leafletElement!.getContainer().offsetHeight,
                    LeafletUtil.toBBox(this.leafletElement!.getBounds())) : fitSet[0];
            this.onViewportChange(Util.iAssign(this.props.viewport || {},
                {center: fitPoint,
                    zoom: (this.props.viewport && this.props.viewport.zoom && this.props.viewport.zoom >= 10) ?
                        this.props.viewport.zoom : 13})); // zoom in if zoom < 10.
            return;
        }
        this.fitBounds(BBox.createBBoxArray(fitSet));
    }

    private onViewportChange(viewport: {center?: LatLng, zoom?: number}) {
        if (this.props.onViewportChange) {
            this.props.onViewportChange(viewport);
        }
    }

    private userLocationSubscription?: any;

    private onTrackUserLocation(fit: boolean = false, onError?: (error: Error) => void) {
        fit && this.state.userLocation && this.fitMap(Location.create(this.state.userLocation.latLng, "", "", ""), null);
        if (this.userLocationSubscription) {
            return;
        }
        this.userLocationSubscription = GeolocationData.instance.getCurrentLocObservable()
            .subscribe(
                (userPosition?: TKUserPosition) => {
                    this.setState((prev: IState) => {
                        fit && !prev.userLocation && userPosition && this.fitMap(Location.create(userPosition.latLng, "", "", ""), null);
                        return {userLocation: userPosition}
                    });
                },
                (error: Error) => {
                    this.userLocationSubscription && this.userLocationSubscription.unsubscribe();
                    this.userLocationSubscription = undefined;
                    this.setState({userLocation: undefined});
                    onError && onError(error);
                });
    }

    private showUserLocTooltip(text: string | undefined) {
        this.setState({userLocationTooltip: text});
        if (!text) {
            this.userLocTooltipRef && this.userLocTooltipRef.setVisibleFor(undefined);
        } else {
            this.userLocTooltipRef && this.userLocTooltipRef.setVisibleFor(10000);
        }
    }

    private currentLocation = Location.createCurrLoc();

    public render(): React.ReactNode {
        const segmentRenderer = this.props.segmentRenderer ? this.props.segmentRenderer :
            (segment: Segment) => {
                const color = segment.getColor();
                return {
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
                let color = TransportUtil.getServiceDepartureColor(service);
                if (!color) {
                    color = "black";
                }
                return {
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
            // Use Visibility.IN_DETAILS instead of Visibility.ON_MAP, since every segment visible in details
            // should show shapes on map. Then only segments with ON_MAP will show pins (e.g. continuation segments
            // won't), MapTripSegment will differentiate that.
            tripSegments = this.props.trip.getSegments(Visibility.IN_DETAILS).concat([this.props.trip.arrivalSegment]);
        }
        const enabledMapLayers = OptionsData.instance.get().mapLayers;
        const classes = this.props.classes;
        const popupHeight = 130; // Hardcoded for now
        const popupWidth = 88; // Hardcoded for now
        const menuPopupAbove = this.leafletElement && this.state.menuPopupPosition
            && this.state.menuPopupPosition.originalEvent.clientY + popupHeight > this.leafletElement.getContainer().clientHeight;
        const menuPopupLeft = this.leafletElement && this.state.menuPopupPosition
            && this.state.menuPopupPosition.originalEvent.clientX + popupWidth > this.leafletElement.getContainer().clientWidth;
        const popupLatLng = this.state.menuPopupPosition && this.state.menuPopupPosition.latlng;
        const menuPopup = this.state.menuPopupPosition &&
            <Popup
                position={this.state.menuPopupPosition.latlng}
                offset={[0, 0]}
                closeButton={false}
                className={classNames(classes.menuPopup,
                    menuPopupAbove ? classes.menuPopupAbove : classes.menuPopupBelow,
                    menuPopupLeft ? classes.menuPopupLeft : classes.menuPopupRight)}
                // TODO: disabled auto pan to fit popup on open since it messes with viewport. Fix it.
                autoPan={false}
                onClose={() => this.setState({menuPopupPosition: undefined})}
            >
                <div className={classes.menuPopupContent}>
                    <div className={classes.menuPopupItem}
                         onClick={() => {
                             this.props.onDirectionsFrom(LatLng.createLatLng(popupLatLng!.lat, popupLatLng!.lng));
                             this.setState({menuPopupPosition: undefined});
                         }}
                    >
                        Directions from here
                    </div>
                    <div className={classes.menuPopupItem}
                         onClick={() => {
                             this.props.onDirectionsTo(LatLng.createLatLng(popupLatLng!.lat, popupLatLng!.lng));
                             this.setState({menuPopupPosition: undefined});
                         }}
                    >
                        Directions to here
                    </div>
                    {!this.props.directionsView &&
                    <div className={classes.menuPopupItem}
                         onClick={() => {
                             this.props.onWhatsHere(LatLng.createLatLng(popupLatLng!.lat, popupLatLng!.lng));
                             this.setState({menuPopupPosition: undefined});
                         }}
                    >
                        What's here?
                    </div>}
                </div>
            </Popup>;
        const padding = Object.assign({top: 20, right: 20, bottom: 20, left: 20}, this.props.padding);
        const paddingOptions = {paddingTopLeft: [padding.left, padding.top], paddingBottomRight: [padding.right, padding.bottom]} as FitBoundsOptions;
        const service = this.props.service;
        const viewport = this.props.viewport;
        const leafletViewport = viewport ?
            {center: viewport.center ? [viewport.center.lat, viewport.center.lng] as [number, number] : undefined, zoom: viewport.zoom}
            : undefined;
        return (
            <div className={classes.main}>
                <RLMap
                    className={classes.leaflet}
                    viewport={leafletViewport}
                    // TODO: check I don't need to pass boundsOptios to fitBounds anymore
                    boundsOptions={paddingOptions}
                    maxBounds={L.latLngBounds([-90, -180], [90, 180])} // To avoid lngs greater than 180.
                    onViewportChanged={(viewport: Viewport) => {
                        this.onViewportChange({
                            center: viewport.center ? LatLng.createLatLng(viewport.center[0], viewport.center[1]) : undefined,
                            zoom: viewport.zoom ? viewport.zoom : undefined
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
                            });
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
                    oncontextmenu={(e: L.LeafletMouseEvent) => {
                        this.setState({menuPopupPosition: e});
                    }}
                    tap={true} // It should make a long tap to trigger oncontextmenu on iOS, but it doesn't work.
                    // Workaround: https://github.com/Leaflet/Leaflet/issues/6865
                    // Working example: https://www.mappite.org/tap/testTap2.html
                    // Leafet doc: https://leafletjs.com/reference-1.6.0.html#map-taptolerance
                    // To make this work with Pointer events experimental feature need to use leaflet > 1.6.0:
                    // https://github.com/Leaflet/Leaflet/issues/6817#issuecomment-554788008
                >
                    {this.props.mapboxGlLayerProps !== undefined ?
                        !this.state.refreshTiles &&
                        <MapboxGlLayer {...this.props.mapboxGlLayerProps}
                                       ref={(ref: any) => {
                                           if (ref && ref.leafletElement && ref.leafletElement.getMapboxMap) {
                                               this.mapboxGlMap = ref.leafletElement.getMapboxMap();
                                           }
                                           if (this.mapboxGlMap && !this.mapboxGlMap.getLayer(ROAD_PEDESTRIAN_HIGHLIGHT.id)) {
                                               setTimeout(() => !this.mapboxGlMap.getLayer(ROAD_PEDESTRIAN_HIGHLIGHT.id)
                                                   && this.mapboxGlMap.addLayer(ROAD_PEDESTRIAN_HIGHLIGHT)
                                                   && this.mapboxGlMap.addLayer(ROAD_PATH_HIGHLIGHT), 1000);

                                           }
                                       }}/> :
                        <TileLayer {...this.props.tileLayerProps!}/>}
                    {this.props.landscape && <ZoomControl position={"topright"}/>}
                    {this.state.userLocation &&
                    <Marker position={this.state.userLocation.latLng}
                            icon={L.divIcon({
                                html: renderToStaticMarkup(
                                    <TKUIConfigProvider config={this.props.config}>
                                        <TKUIMyLocationMapIcon/>
                                    </TKUIConfigProvider>
                                ),
                                iconSize: [20, 20],
                                iconAnchor: [10, 10],
                                className: classes.currentLocMarker
                            })}
                            riseOnHover={true}
                    >
                        {this.getLocationPopup(this.currentLocation)}
                    </Marker>}
                    {!this.props.trip && this.props.from && this.props.from.isResolved() &&
                    !(this.props.from.isCurrLoc() && this.state.userLocation) &&
                    <Marker position={this.props.from!}
                            icon={L.divIcon({
                                html: renderToStaticMarkup(
                                    <TKUIConfigProvider config={this.props.config}>
                                        <TKUIMapLocationIcon location={this.props.from!} from={true}/>
                                    </TKUIConfigProvider>
                                ),
                                iconSize: [26, 39],
                                iconAnchor: [13, 39],
                                className: "LeafletMap-pinTo"
                            })}
                            draggable={true}
                            riseOnHover={true}
                            ondragend={(event: L.DragEndEvent) => {
                                if (this.props.onDragEnd) {
                                    const latLng = event.target.getLatLng();
                                    this.props.onDragEnd(true, LatLng.createLatLng(latLng.lat, latLng.lng));
                                }
                            }}
                            onpopupclose={() => console.log("close")}
                    >
                        {this.getLocationPopup(this.props.from!)}
                    </Marker>}
                    {!this.props.trip && this.props.to && this.props.to.isResolved() && !service &&
                    <Marker position={this.props.to!}
                            icon={L.divIcon({
                                html: renderToStaticMarkup(
                                    <TKUIConfigProvider config={this.props.config}>
                                        <TKUIMapLocationIcon location={this.props.to!}/>
                                    </TKUIConfigProvider>
                                ),
                                iconSize: [26, 39],
                                iconAnchor: [13, 39],
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
                    >
                        {this.getLocationPopup(this.props.to!)}
                    </Marker>}
                    {this.leafletElement && this.props.hideLocations !== true &&
                    <TKUIMapLocations
                        bounds={LeafletUtil.toBBox(this.leafletElement.getBounds())}
                        enabledMapLayers={enabledMapLayers}
                        zoom={this.leafletElement.getZoom()}
                        onClick={(locType: MapLocationType, loc: Location) => {
                            if (locType === MapLocationType.STOP && this.props.onClick) {
                                this.props.onClick(loc as StopLocation);
                            }
                        }}
                        onLocAction={this.props.onLocAction}
                        omit={(this.props.from ? [this.props.from] : []).concat(this.props.to ? [this.props.to] : [])}
                        isDarkMode={this.props.theme.isDark}
                    />
                    }
                    {tripSegments && tripSegments.map((segment: Segment, i: number) => {
                        return <MapTripSegment segment={segment}
                                               ondragend={(segment.isFirst(Visibility.IN_SUMMARY) || segment.arrival) && this.props.onDragEnd ?
                                                   (latLng: LatLng) => this.props.onDragEnd!(segment.isFirst(Visibility.IN_SUMMARY), latLng) : undefined}
                                               renderer={segmentRenderer(segment)}
                                               segmentIconClassName={classes.segmentIconClassName}
                                               vehicleClassName={classes.vehicleClassName}
                                               key={i}/>;
                    })}
                    {service &&
                    <MapService
                        serviceDeparture={service}
                        renderer={serviceRenderer(service)}
                        segmentIconClassName={classes.segmentIconClassName}
                    />}
                    {service && service.realtimeVehicle &&
                    (DateTimeUtil.getNow().valueOf() / 1000 - service.realtimeVehicle.lastUpdate) < 120 &&
                    <Marker position={service.realtimeVehicle.location}
                            icon={L.divIcon({
                                html: renderToStaticMarkup(
                                    <TKUIConfigProvider config={this.props.config}>
                                        <TKUIRealtimeVehicle
                                            value={service.realtimeVehicle}
                                            label={service.serviceNumber}
                                            color={service.serviceColor}
                                        />
                                    </TKUIConfigProvider>
                                ),
                                iconSize: [40, 40],
                                iconAnchor: [20, 20],
                                className: classes.vehicle
                            })}
                            riseOnHover={true}
                    >
                        {TKUIMapView.getPopup(service.realtimeVehicle, service.modeInfo.alt + " " + service.serviceNumber)}
                    </Marker>}
                    {menuPopup}
                </RLMap>
                <ReactResizeDetector handleWidth={true} handleHeight={true}
                                     onResize={() => this.onResize()}
                />
                <TKUITooltip
                    overlayContent={this.state.userLocationTooltip}
                    arrowColor={this.props.theme.isLight ? tKUIColors.black2 : tKUIColors.black1}
                    visible={false}
                    placement={"right"}
                    reference={(ref: any) => this.userLocTooltipRef = ref}
                    onRequestClose={() => this.showUserLocTooltip(undefined)}
                >
                    <button className={classNames(classes.currentLocBtn,
                        this.props.landscape ? classes.currentLocBtnLandscape : classes.currentLocBtnPortrait,
                        this.userLocationSubscription && !this.state.userLocation && classes.resolvingCurrLoc)}
                            onClick={() => this.onTrackUserLocation(true, (error: Error) => {
                                if (TKErrorHelper.hasErrorCode(error, ERROR_GEOLOC_DENIED)) {
                                    this.showUserLocTooltip("Please allow this site to track your location");
                                } else {
                                    this.showUserLocTooltip("Could not get your location");
                                }
                            })}
                    >
                        <IconCurrentLocation/>
                    </button>
                </TKUITooltip>
            </div>
        )
    }

    public static getPopup(realTimeVehicle: RealTimeVehicle, title: string) {
        return <Popup
            offset={[0, 0]}
            closeButton={false}
            className="LeafletMap-mapLocPopup"
            autoPan={false}
        >
            <TKUIRealtimeVehiclePopup value={realTimeVehicle} title={title}/>
        </Popup>;
    }

    private getLocationPopup(location: Location) {
        return <Popup
            offset={location.isCurrLoc() ? [0, 0] : [0, -30]}
            closeButton={false}
            className="LeafletMap-mapLocPopup"
            // TODO: disabled auto pan to fit popup on open since it messes with viewport. Fix it.
            autoPan={false}
        >
            <TKUIMapPopup title={location.name || LocationUtil.getMainText(location)}
                          onAction={location instanceof StopLocation ?
                              () => this.props.onLocAction
                                  && this.props.onLocAction(MapLocationType.STOP, location) : undefined}/>
        </Popup>;
    }

    public componentDidMount(): void {
        this.leafletElement!.on("dblclick", event1 => {
            this.wasDoubleClick = true;
        });

        // TODO Delete: Can actually delete this? It causes an exception sometimes
        // setTimeout(() => this.onResize(), 5000);
    }

    public componentDidUpdate(prevProps: IProps): void {
        const paddingChanged = JSON.stringify(this.props.padding) !== JSON.stringify(prevProps.padding);
        if (this.checkFitLocation(prevProps.from, this.props.from) || this.checkFitLocation(prevProps.to, this.props.to)
            || paddingChanged) {
            // TODO: avoid switching from undefined to null, use one or the other.
            this.fitMap(this.props.from ? this.props.from : null, this.props.to ? this.props.to : null);
        }
        // TODO: check if need to reset avoidFitLatLng, maybe with a timer after a second.
        // avoidFitLatLng = undefined;
        // TODO: check that this is used to fit the map when comming from query input widget.
        // TODO: check if the change done to fit favourites will cause other undesired fits.
        // if (!prevProps.from && !prevProps.to &&
        if (this.props.from !== prevProps.from && this.props.to !== prevProps.to &&
            this.props.from && this.props.from.isResolved() && this.props.to && this.props.to.isResolved()) {
            this.fitBounds(BBox.createBBoxArray([this.props.from, this.props.to]));
        }

        // If computing trips from user location then show it on map.
        if (
            this.props.from && this.props.from.isCurrLoc() && this.props.from.isResolved() && !this.userLocationSubscription) {
            this.onTrackUserLocation();
            // This line is to display user location spot immediately, and avoid green pin showing first to be replaced
            // by user location spot. Alternatively can make this.onTrackUserLocation() to use cached user position
            // the first time, so spot also should show immediately.
            this.setState({userLocation: {latLng: this.props.from}});
        }

        const trip = this.props.trip;
        if ((trip !== prevProps.trip || paddingChanged) && trip) {
            const fitBounds = MapUtil.getTripBounds(trip);
            // TODO: analize better when to force fit bounds.
            if (!this.alreadyFits(fitBounds) || paddingChanged) {
                this.fitBounds(fitBounds);
            }
        }
        const service = this.props.service;
        if (service !== prevProps.service) {
            if (service && service.serviceDetail && service.serviceDetail.shapes) {
                const fitBounds = MapUtil.getShapesBounds(service.serviceDetail.shapes);
                if (!this.alreadyFits(fitBounds) || paddingChanged
                    || (this.leafletElement && this.leafletElement.getZoom() < 10)) {
                    this.fitBounds(fitBounds);
                }
            }
        }

        // Need to re-inject styles so css properties based on portrait / landscape take effect.
        // TODO: disable since it triggers the re-construction of TKUITripPlanner, which causes some issues.
        // See comment on StyleHelper.onRefreshStyles
        // if (prevProps.landscape !== this.props.landscape) {
        //     this.props.refreshStyles()
        // }

        // Need this to force a tiles refresh on mapbox gl style change (e.g. when switching appearance between dark
        // and light).
        if (this.props.mapboxGlLayerProps && prevProps.mapboxGlLayerProps &&
            this.props.mapboxGlLayerProps.style !== prevProps.mapboxGlLayerProps.style) {
            this.setState({refreshTiles: true});
            setTimeout(() => this.setState({refreshTiles: undefined}));
        }

        // Highlight walk paths for walking only trips.
        if ((trip !== prevProps.trip)) {
            const isWalkTrip = trip && trip.isWalkTrip();
            this.mapboxGlMap && this.mapboxGlMap.setLayoutProperty(ROAD_PEDESTRIAN_HIGHLIGHT.id, 'visibility', isWalkTrip ? 'visible' : 'none');
            this.mapboxGlMap && this.mapboxGlMap.setLayoutProperty(ROAD_PATH_HIGHLIGHT.id, 'visibility', isWalkTrip ? 'visible' : 'none');

            // this.mapboxGlMap.setLayoutProperty('road-path', 'visibility', 'none');
            // this.mapboxGlMap.setPaintProperty('road-path', 'line-color', '#ff0000');
            // this.mapboxGlMap.setPaintProperty('road-pedestrian', 'line-color', 'rgba(255,0,0,.5)');
        }
    }

    public fitBounds(bounds: BBox) {
        if (this.leafletElement) {
            const padding = Object.assign({top: 20, right: 20, bottom: 20, left: 20}, this.props.padding);
            const options = {paddingTopLeft: [padding.left, padding.top], paddingBottomRight: [padding.right, padding.bottom]} as FitBoundsOptions;
            try {
                this.leafletElement.fitBounds(L.latLngBounds([bounds.sw, bounds.ne]), options);
            } catch(error) {
                // TODO: fix it
                console.log("Prevent bounds exception : ");
                console.error(error);
            }
        }
    }

    public alreadyFits(bounds: BBox): boolean {
        const padding = Object.assign({top: 0, right: 0, bottom: 0, left: 0}, this.props.padding);
        return this.leafletElement ?
            MapUtil.alreadyFits(LeafletUtil.toBBox(this.leafletElement.getBounds()), padding, bounds,
                this.leafletElement.getContainer().offsetWidth, this.leafletElement.getContainer().offsetHeight)
            : false;
    }

    public onResize() {
        this.leafletElement!.invalidateSize();
    }
}

let geocodingData: MultiGeocoder;

function getGeocodingData(customGeocoders?: IGeocoder[]) {
    if (!geocodingData) {
        geocodingData = new MultiGeocoder(MultiGeocoderOptions.default(true, customGeocoders));
    }
    return geocodingData;
}

let avoidFitLatLng: LatLng | undefined;

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> =
    (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
        return (
            <TKUIConfigContext.Consumer>
                {(config: TKUIConfig) =>
                    <TKUIViewportUtil>
                        {(viewportProps: TKUIViewportUtilProps) =>
                            <RoutingResultsContext.Consumer>
                                {(routingContext: IRoutingResultsContext) =>
                                    <ServiceResultsContext.Consumer>
                                        {(serviceContext: IServiceResultsContext) => {
                                            const from = routingContext.preFrom ? routingContext.preFrom :
                                                (routingContext.query.from ? routingContext.query.from : undefined);
                                            const to = routingContext.preTo ? routingContext.preTo :
                                                (routingContext.query.to ? routingContext.query.to : undefined);
                                            const onMapLocChanged = (isFrom: boolean, latLng: LatLng) => {
                                                const mapLocation = latLng instanceof StopLocation ? latLng as StopLocation :
                                                    Location.createDroppedPin(latLng);
                                                routingContext.onQueryUpdate(Util.iAssign(routingContext.query, {
                                                    [isFrom ? "from" : "to"]: mapLocation
                                                }));
                                                if (mapLocation.isDroppedPin()) {
                                                    getGeocodingData(config.geocoding && config.geocoding.customGeocoders)
                                                        .reverseGeocode(latLng, loc => {
                                                            if (loc !== null) {
                                                                // Need to use onQueryUpdate instead of onQueryChange since
                                                                // routingContext.query can be outdated at the time this callback is
                                                                // executed. OnQueryUpdate always use the correct query (the one on
                                                                // WithRoutingResults state, the source of truth).
                                                                routingContext.onQueryUpdate({[isFrom ? "from" : "to"]: loc});
                                                                // setTimeout(() => routingContext.onQueryUpdate( {[isFrom ? "from" : "to"]: loc}), 3000);
                                                            }
                                                        })
                                                }
                                            };
                                            const consumerProps: IConsumedProps = {
                                                from: routingContext.directionsView ? from : undefined,
                                                to: to,
                                                trip: routingContext.selectedTrip,
                                                onDragEnd: onMapLocChanged,
                                                onClick: (clickLatLng: LatLng) => {
                                                    if (routingContext.directionsView) {
                                                        if (!from || !to || clickLatLng instanceof StopLocation) {
                                                            if (!from && !to) {
                                                                // Avoid fit bounds when setting first location on
                                                                // directions view.
                                                                avoidFitLatLng = clickLatLng
                                                            }
                                                            // Do nothing if the location is already the from or to.
                                                            if (from && from.equals(clickLatLng) || to && to.equals(clickLatLng)) {
                                                                return;
                                                            }
                                                            const isFrom = !from;
                                                            onMapLocChanged(isFrom, clickLatLng);
                                                            GATracker.event({
                                                                category: "query input",
                                                                action: isFrom ? "pick from location" : "pick to location",
                                                                label: "drop to"
                                                            });
                                                        }
                                                    } else {
                                                        if (!to || clickLatLng instanceof StopLocation) {
                                                            onMapLocChanged(false, clickLatLng);
                                                        }
                                                    }
                                                },
                                                service: serviceContext.selectedService && serviceContext.selectedService.serviceDetail ?
                                                    serviceContext.selectedService : undefined,
                                                viewport: routingContext.viewport,
                                                onViewportChange: routingContext.onViewportChange,
                                                directionsView: routingContext.directionsView,
                                                onDirectionsFrom: (latLng: LatLng) => {
                                                    onMapLocChanged(true, latLng);
                                                    routingContext.onDirectionsView(true);
                                                },
                                                onDirectionsTo: (latLng: LatLng) => {
                                                    onMapLocChanged(false, latLng);
                                                    routingContext.onDirectionsView(true);
                                                },
                                                onWhatsHere: (latLng: LatLng) => {
                                                    onMapLocChanged(false, latLng);
                                                },
                                                ...viewportProps,
                                                config: config
                                            };
                                            return (
                                                props.children!(consumerProps)
                                            );
                                        }}
                                    </ServiceResultsContext.Consumer>
                                }
                            </RoutingResultsContext.Consumer>
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

export default connect((config: TKUIConfig) => config.TKUIMapView, config, Mapper);
export {TKUIMapView as TKUIMapViewClass};

const WALK_PATH_COLOR = "rgb(0, 220, 0)";

const ROAD_PEDESTRIAN_HIGHLIGHT =
    {
        "id": "road-pedestrian-highlight",
        "type": "line",
        "source": "composite",
        "source-layer": "road",
        "minzoom": 12,
        "filter": [
            "all",
            [
                "==",
                [
                    "get",
                    "class"
                ],
                "pedestrian"
            ],
            [
                "match",
                [
                    "get",
                    "structure"
                ],
                [
                    "none",
                    "ford"
                ],
                true,
                false
            ],
            [
                "==",
                [
                    "geometry-type"
                ],
                "LineString"
            ]
        ],
        "layout": {
            "line-join": [
                "step",
                [
                    "zoom"
                ],
                "miter",
                14,
                "round"
            ],
            "visibility": "none"
        },
        "paint": {
            "line-width": [
                "interpolate",
                [
                    "exponential",
                    1.5
                ],
                [
                    "zoom"
                ],
                14,
                0.5,
                18,
                12
            ],
            "line-color": Color.createFromRGB(WALK_PATH_COLOR).toRGBA(.5),
            "line-dasharray": [
                "step",
                [
                    "zoom"
                ],
                [
                    "literal",
                    [
                        1,
                        0
                    ]
                ],
                15,
                [
                    "literal",
                    [
                        1.5,
                        0.4
                    ]
                ],
                16,
                [
                    "literal",
                    [
                        1,
                        0.2
                    ]
                ]
            ]
        },
        "metadata": {
            "mapbox:featureComponent": "walking-cycling",
            "mapbox:group": "Walking, cycling, etc., surface"
        }
    };

const ROAD_PATH_HIGHLIGHT =
    {
        "id": "road-path-highlight",
        "type": "line",
        "source": "composite",
        "source-layer": "road",
        "minzoom": 12,
        "filter": [
            "all",
            [
                "==",
                [
                    "get",
                    "class"
                ],
                "path"
            ],
            [
                "step",
                [
                    "zoom"
                ],
                [
                    "!",
                    [
                        "match",
                        [
                            "get",
                            "type"
                        ],
                        [
                            "steps",
                            "sidewalk",
                            "crossing"
                        ],
                        true,
                        false
                    ]
                ],
                16,
                [
                    "!=",
                    [
                        "get",
                        "type"
                    ],
                    "steps"
                ]
            ],
            [
                "match",
                [
                    "get",
                    "structure"
                ],
                [
                    "none",
                    "ford"
                ],
                true,
                false
            ],
            [
                "==",
                [
                    "geometry-type"
                ],
                "LineString"
            ]
        ],
        "layout": {
            "line-join": [
                "step",
                [
                    "zoom"
                ],
                "miter",
                14,
                "round"
            ]
        },
        "paint": {
            "line-width": [
                "interpolate",
                [
                    "exponential",
                    1.5
                ],
                [
                    "zoom"
                ],
                13,
                0.5,
                14,
                1,
                15,
                1,
                18,
                4
            ],
            "line-color": Color.createFromRGB(WALK_PATH_COLOR).toRGBA(1),
            "line-dasharray": [
                "step",
                [
                    "zoom"
                ],
                [
                    "literal",
                    [
                        1,
                        0
                    ]
                ],
                15,
                [
                    "literal",
                    [
                        1.75,
                        1
                    ]
                ],
                16,
                [
                    "literal",
                    [
                        1,
                        0.75
                    ]
                ],
                17,
                [
                    "literal",
                    [
                        1,
                        0.5
                    ]
                ]
            ]
        },
        "metadata": {
            "mapbox:featureComponent": "walking-cycling",
            "mapbox:group": "Walking, cycling, etc., surface"
        }
    };