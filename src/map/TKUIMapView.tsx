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
import LocationUtil from "../util/LocationUtil";
import GATracker from "../analytics/GATracker";
import {Visibility} from "../model/trip/SegmentTemplate";
import ServiceShape from "../model/trip/ServiceShape";
import ServiceDeparture from "../model/service/ServiceDeparture";
import MapService from "./MapService";
import ServiceStopLocation from "../model/ServiceStopLocation";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import MultiGeocoder from "../geocode/MultiGeocoder";
import ReactResizeDetector from "react-resize-detector";
import {IServiceResultsContext, ServiceResultsContext} from "../service/ServiceResultsProvider";
import MapUtil from "../util/MapUtil";
import StopLocation from "../model/StopLocation";
import {renderToStaticMarkup} from "react-dom/server";
import TKUIMapLocations from "./TKUIMapLocations";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIMapViewDefaultStyle} from "./TKUIMapView.css";
import "./TKUIMapViewCss.css";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import classNames from "classnames";
import {TKUIViewportUtilProps, TKUIViewportUtil} from "../util/TKUIResponsiveUtil";
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
import TKGeocodingOptions, {getGeocodingOptions} from "../geocode/TKGeocodingOptions";
import {MapboxGlLayer} from '@mongodb-js/react-mapbox-gl-leaflet/lib/react-mapbox-gl-leaflet';
import Color from "../model/trip/Color";
import Features from "../env/Features";
import WaiAriaUtil from "../util/WaiAriaUtil";
import ModeLocation from "../model/location/ModeLocation";
import TKTransportOptions from "../model/options/TKTransportOptions";
import {IOptionsContext, OptionsContext} from "../options/OptionsProvider";
import TKUIMapLocationPopup from "./TKUIMapLocationPopup";

export type TKUIMapPadding = {top?: number, right?: number, bottom?: number, left?: number};

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     * States if should hide map locations layer.
     * @default false
     */
    hideLocations?: boolean;

    /**
     * Map padding to be considered when fit map to a given set of locations or bounding box.
     * @default {top: 20, right: 20, bottom: 20, left: 20}
     */
    padding?: TKUIMapPadding

    /**
     * States if attribution banner should be displayed or not.
     * @deafult true
     */
    attributionControl?: boolean;

    /**
     * Function that will run when a map location is clicked.
     * @ctype
     */
    locationActionHandler?: (loc: Location) => (() => void) | undefined;

    /**
     * Properties to be passed to react-leaflet [TileLayer component](https://react-leaflet.js.org/docs/en/components#tilelayer),
     * e.g. to specify raster tiles server url.
     * @ctype [TileLayerProps](https://react-leaflet.js.org/docs/en/components#tilelayer)
     */
    tileLayerProps?: TileLayerProps;

    /**
     * Properties to be passed to [react-mapbox-gl-leaflet](https://github.com/mongodb-js/react-mapbox-gl-leaflet)
     * MapboxGlLayer component, e.g. to specify a Mapbox vector tiles server url.
     * @ctype [MapboxGLLayerProps](https://github.com/mongodb-js/react-mapbox-gl-leaflet#usage)
     */
    mapboxGlLayerProps?: MapboxGLLayerProps;
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
    /**
     * Depart location.
     * @ctype
     * @default {@link TKState#query}.from
     */
    from?: Location;

    /**
     * Depart location change callback.
     * @ctype
     * @default Callback updating {@link TKState#query}.from
     */
    onFromChange?: (location: Location) => void;

    /**
     * Arrive location.
     * @ctype
     * @default {@link TKState#query}.to
     */
    to?: Location;

    /**
     * Arrive location change callback.
     * @ctype
     * @default Callback updating {@link TKState#query}.to
     */
    onToChange?: (location: Location) => void;

    /**
     * Trip to be displayed on map.
     * @ctype
     * @default {@link TKState#selectedTrip}
     */
    trip?: Trip;

    /**
     * Public transport service to be displayed on map.
     * @ctype
     * @default {@link TKState#selectedService}
     */
    service?: ServiceDeparture;

    /**
     * Map viewport expressed as center coordinates and zoom level.
     * @ctype
     * @default {@link TKState#viewport}
     */
    viewport?: {center?: LatLng, zoom?: number};

    /**
     * Map viewport change callback.
     * @ctype
     * @default {@link TKState#onViewportChange}
     */
    onViewportChange?: (viewport: {center?: LatLng, zoom?: number}) => void;

    /**
     * States if the environment is in _directions mode_, which implies that it automatically compute trips for
     * current query whenever from and to become specified (and refresh trips when from or to change.
     * @ctype
     * @default {@link TKState#directionsView}
     */
    directionsView?: boolean;

    /**
     * Directions view change callback.
     * @ctype
     * @default {@link TKState#onDirectionsView}
     */
    onDirectionsView: (directionsView: boolean) => void;

    /**
     * SDK config
     * @ctype
     * @default {@link TKState#config}
     */
    config: TKUIConfig;

    transportOptions: TKTransportOptions;
}

interface MapboxGLLayerProps {
    accessToken: string;
    style: string;
    attribution: string;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIMapViewProps = IProps;
export type TKUIMapViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMapView {...props}/>,
    styles: tKUIMapViewDefaultStyle,
    classNamePrefix: "TKUIMapView",
    props: {
        tileLayerProps: {
            attribution: "&copy <a href='http://osm.org/copyright' tabindex='-1'>OpenStreetMap</a> contributors",
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
        this.getLocationPopup = this.getLocationPopup.bind(this);
        NetworkUtil.loadCss("https://unpkg.com/leaflet@1.3.4/dist/leaflet.css");
    }

    private onMapLocChanged(isFrom: boolean, latLng: LatLng) {
        const mapLocation = latLng instanceof ModeLocation ? latLng as ModeLocation :
            Location.createDroppedPin(latLng);
        if (isFrom) {
            this.props.onFromChange && this.props.onFromChange(mapLocation);
        } else {
            this.props.onToChange && this.props.onToChange(mapLocation);
        }
        // routingContext.onQueryUpdate(Util.iAssign(routingContext.query, {
        //     [isFrom ? "from" : "to"]: mapLocation
        // }));
        if (mapLocation.isDroppedPin()) {
            getGeocodingData(this.props.config.geocoding)
                .reverseGeocode(latLng, loc => {
                    if (loc !== null) {
                        // Need to use onQueryUpdate instead of onQueryChange since
                        // routingContext.query can be outdated at the time this callback is
                        // executed. OnQueryUpdate always use the correct query (the one on
                        // WithRoutingResults state, the source of truth).
                        if (isFrom) {
                            this.props.onFromChange && this.props.onFromChange(loc);
                        } else {
                            this.props.onToChange && this.props.onToChange(loc);
                        }
                        // routingContext.onQueryUpdate({[isFrom ? "from" : "to"]: loc});
                    }
                })
        }
    };

    private onClick(clickLatLng: LatLng) {
        const from = this.props.from;
        const to = this.props.to;
        if (this.props.directionsView) {
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
                this.onMapLocChanged(isFrom, clickLatLng);
                GATracker.event({
                    category: "query input",
                    action: isFrom ? "pick from location" : "pick to location",
                    label: "drop to"
                });
            }
        } else {
            if (!to || clickLatLng instanceof ModeLocation) {
                this.onMapLocChanged(false, clickLatLng);
            }
        }
    }

    private onMoveEnd() {
        const mapBounds = this.leafletElement!.getBounds();
        if (mapBounds.getNorth() === 90) {  // Filter first bounds, which are like max possible bounds
            return;
        }
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
        let tripSegments;
        if (this.props.trip) {
            // Use Visibility.IN_DETAILS instead of Visibility.ON_MAP, since every segment visible in details
            // should show shapes on map. Then only segments with ON_MAP will show pins (e.g. continuation segments
            // won't), MapTripSegment will differentiate that.
            tripSegments = this.props.trip.getSegments(Visibility.IN_DETAILS).concat([this.props.trip.arrivalSegment]);
        }
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
                // TODO: disabled auto pan to fit popup on open since it messes with viewport
                // (generates infinite (or a lot) setState calls) since it seems the viewport
                // doesn't stabilizes. Fix it.
                autoPan={false}
                onClose={() => this.setState({menuPopupPosition: undefined})}
            >
                <div className={classes.menuPopupContent}>
                    <div className={classes.menuPopupItem}
                         onClick={() => {
                             this.onMapLocChanged(true, LatLng.createLatLng(popupLatLng!.lat, popupLatLng!.lng));
                             this.props.onDirectionsView(true);
                             this.setState({menuPopupPosition: undefined});
                         }}
                    >
                        Directions from here
                    </div>
                    <div className={classes.menuPopupItem}
                         onClick={() => {
                             this.onMapLocChanged(false, LatLng.createLatLng(popupLatLng!.lat, popupLatLng!.lng));
                             this.props.onDirectionsView(true);
                             this.setState({menuPopupPosition: undefined});
                         }}
                    >
                        Directions to here
                    </div>
                    {!this.props.directionsView &&
                    <div className={classes.menuPopupItem}
                         onClick={() => {
                             this.onMapLocChanged(false, LatLng.createLatLng(popupLatLng!.lat, popupLatLng!.lng));
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
        const t = this.props.t;
        return (
            <div className={classes.main} aria-hidden="true">
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
                        setTimeout(() => {
                            if (this.wasDoubleClick) {
                                this.wasDoubleClick = false;
                                return;
                            }
                            this.onClick(LatLng.createLatLng(event.latlng.lat, event.latlng.lng));
                        });
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
                    keyboard={false}
                >
                    {this.props.mapboxGlLayerProps !== undefined ?
                        !this.state.refreshTiles &&
                        <MapboxGlLayer {...this.props.mapboxGlLayerProps}
                                       ref={(ref: any) => {
                                           if (ref && ref.leafletElement && ref.leafletElement.getMapboxMap) {
                                               this.mapboxGlMap = ref.leafletElement.getMapboxMap();
                                           }
                                           if (this.mapboxGlMap) {
                                               // Since this could be a consequence of a complete style change
                                               // (switch dark / light appearance).
                                               this.refreshModeSpecificTiles();
                                           }
                                       }}
                        /> :
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
                            keyboard={false}
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
                                const latLng = event.target.getLatLng();
                                this.onMapLocChanged(true, LatLng.createLatLng(latLng.lat, latLng.lng));
                            }}
                            onpopupclose={() => console.log("close")}
                            keyboard={false}
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
                                const latLng = event.target.getLatLng();
                                this.onMapLocChanged(false, LatLng.createLatLng(latLng.lat, latLng.lng));
                            }}
                            keyboard={false}
                    >
                        {this.getLocationPopup(this.props.to!)}
                    </Marker>}
                    {this.leafletElement && this.props.hideLocations !== true &&
                    <TKUIMapLocations
                        bounds={LeafletUtil.toBBox(this.leafletElement.getBounds())}
                        zoom={this.leafletElement.getZoom()}
                        onClick={(loc: Location) => {
                            this.onClick(loc);
                        }}
                        omit={(this.props.from ? [this.props.from] : []).concat(this.props.to ? [this.props.to] : [])}
                        isDarkMode={this.props.theme.isDark}
                        config={this.props.config}
                        transportOptions={this.props.transportOptions}
                    />
                    }
                    {tripSegments && tripSegments.map((segment: Segment, i: number) => {
                        return <MapTripSegment segment={segment}
                                               ondragend={(segment.isFirst(Visibility.IN_SUMMARY) || segment.arrival) ?
                                                   (latLng: LatLng) => this.onMapLocChanged(segment.isFirst(Visibility.IN_SUMMARY), latLng) : undefined}
                                               segmentIconClassName={classes.segmentIconClassName}
                                               vehicleClassName={classes.vehicleClassName}
                                               key={i}
                                               t={this.props.t}
                        />;
                    })}
                    {service &&
                    <MapService
                        serviceDeparture={service}
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
                            keyboard={false}
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
                                    this.showUserLocTooltip(t("You.blocked.this.site.access.to.your.location"));
                                } else {
                                    this.showUserLocTooltip(t("Could.not.determine.your.current.location."));
                                }
                            })}
                            aria-label="Show my location on map"
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
            <TKUIMapLocationPopup
                location={location}
                onAction={this.props.locationActionHandler && this.props.locationActionHandler(location)}
            />
        </Popup>;
    }

    public componentDidMount(): void {
        this.leafletElement!.on("dblclick", event1 => {
            this.wasDoubleClick = true;
        });

        // TODO Delete: Can actually delete this? It causes an exception sometimes.
        setTimeout(() => this.onResize(), 5000);
        setTimeout(() => {
            WaiAriaUtil.apply(".mapboxgl-canvas", {tabIndex: -1, ariaHidden: true});
            WaiAriaUtil.apply(".mapboxgl-ctrl-logo", {tabIndex: -1, ariaHidden: true});
            WaiAriaUtil.apply(".leaflet-control-zoom-in", {ariaHidden: true, ariaLabel: "Zoom in map"});
            WaiAriaUtil.apply(".leaflet-control-zoom-out", {ariaHidden: true, ariaLabel: "Zoom out map"});
            const leafletControlAttribution = WaiAriaUtil.getElementByQuerySelector(".leaflet-control-attribution");
            leafletControlAttribution && leafletControlAttribution.children.length > 0 &&
            leafletControlAttribution.children[0].setAttribute("tabindex", "-1");
        }, 1000);
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
        if (trip !== prevProps.trip) {
            this.refreshModeSpecificTiles();
        }
    }

    private refreshModeSpecificTiles() {
        if (!Features.instance.modeSpecificMapTilesEnabled) {
            return
        }
        try {
            if (!this.mapboxGlMap.getLayer(ROAD_PEDESTRIAN_HIGHLIGHT.id)) {
                this.mapboxGlMap.addLayer(ROAD_PEDESTRIAN_HIGHLIGHT);
                this.mapboxGlMap.addLayer(ROAD_PATH_HIGHLIGHT);
            }
            const trip = this.props.trip;
            const isWalkTrip = trip && trip.isWalkTrip();
            this.mapboxGlMap && this.mapboxGlMap.setLayoutProperty(ROAD_PEDESTRIAN_HIGHLIGHT.id, 'visibility',
                isWalkTrip ? 'visible' : 'none');
            this.mapboxGlMap && this.mapboxGlMap.setLayoutProperty(ROAD_PATH_HIGHLIGHT.id, 'visibility',
                isWalkTrip ? 'visible' : 'none');
        } catch (e) {
            // To avoid break due to Error: Style is not done loading
        }

        // Other ways to change style dynamically:
        // this.mapboxGlMap.setLayoutProperty('road-path', 'visibility', 'none');
        // this.mapboxGlMap.setPaintProperty('road-path', 'line-color', '#ff0000');
        // this.mapboxGlMap.setPaintProperty('road-pedestrian', 'line-color', 'rgba(255,0,0,.5)');
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

function getGeocodingData(geocodingConfig?: Partial<TKGeocodingOptions> | ((defaultOptions: TKGeocodingOptions) => Partial<TKGeocodingOptions>)) {
    if (!geocodingData) {
        geocodingData = new MultiGeocoder(getGeocodingOptions(geocodingConfig));
    }
    return geocodingData;
}

let avoidFitLatLng: LatLng | undefined;

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> =
    (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
        return (
            <TKUIConfigContext.Consumer>
                {(config: TKUIConfig) =>
                    <OptionsContext.Consumer>
                        {(optionsContext: IOptionsContext) =>
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

                                                    const consumerProps: IConsumedProps = {
                                                        from: routingContext.directionsView ? from : undefined,
                                                        onFromChange: (location: Location) =>
                                                            routingContext.onQueryUpdate(Util.iAssign(routingContext.query, {
                                                                from: location
                                                            })),
                                                        to: to,
                                                        onToChange: (location: Location) =>
                                                            routingContext.onQueryUpdate(Util.iAssign(routingContext.query, {
                                                                to: location
                                                            })),
                                                        trip: routingContext.selectedTrip,
                                                        service: serviceContext.selectedService && serviceContext.selectedService.serviceDetail ?
                                                            serviceContext.selectedService : undefined,
                                                        viewport: routingContext.viewport,
                                                        onViewportChange: routingContext.onViewportChange,
                                                        directionsView: routingContext.directionsView,
                                                        onDirectionsView: routingContext.onDirectionsView,
                                                        ...viewportProps,
                                                        config: config,
                                                        transportOptions: optionsContext.userProfile.transportOptions
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
                    </OptionsContext.Consumer>
                }
            </TKUIConfigContext.Consumer>
        );
    };

const Mapper: PropsMapper<IClientProps & Partial<IConsumedProps>, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...consumedProps, ...inputProps})}
        </Consumer>;

/**
 * Leaflet-based map to display TripGo api related elements: e.g. depart and arrive locations, trips,
 * public transport services, transport-related locations, user's current location, etc.
 * It supports both raster tiles, and vector tiles through the
 * [react-mapbox-gl-leaflet library](https://github.com/mongodb-js/react-mapbox-gl-leaflet).
 */

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