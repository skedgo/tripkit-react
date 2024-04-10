import React, { MutableRefObject, useContext, useMemo } from "react";
import { Map as RLMap, Marker, Popup, ZoomControl, Viewport, TileLayerProps, Polygon } from "react-leaflet";
import L, { FitBoundsOptions, LatLngBounds, LatLngExpression } from "leaflet";
import NetworkUtil from "../util/NetworkUtil";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
import BBox from "../model/BBox";
import Trip from "../model/trip/Trip";
import MapTripSegment from "./MapTripSegment";
import Segment from "../model/trip/Segment";
import Util from "../util/Util";
import LocationUtil from "../util/LocationUtil";
import GATracker, { ACTION_PICK_FROM_LOCATION, ACTION_PICK_TO_LOCATION, CATEGORY_QUERY_INPUT } from "../analytics/GATracker";
import { Visibility } from "../model/trip/SegmentTemplate";
import ServiceDeparture from "../model/service/ServiceDeparture";
import MapService from "./MapService";
import { RoutingResultsContext } from "../trip-planner/RoutingResultsProvider";
import MultiGeocoder from "../geocode/MultiGeocoder";
import ReactResizeDetector from "react-resize-detector";
import { ServiceResultsContext } from "../service/ServiceResultsProvider";
import MapUtil from "../util/MapUtil";
import TKUIMapLocations, { TKUIModeLocationMarker } from "./TKUIMapLocations";
import { renderToStaticMarkup, TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIMapViewDefaultStyle } from "./TKUIMapView.css";
import "./TKUIMapViewCss.css";
import { connect, PropsMapper, TKRenderOverride } from "../config/TKConfigHelper";
import classNames from "classnames";
import { TKUIViewportUtilProps, TKUIViewportUtil } from "../util/TKUIResponsiveUtil";
import TKUIMapLocationIcon, { tKUIMapLocationIconConfig } from "./TKUIMapLocationIcon";
import TKUIMyLocationMapIcon from "./TKUIMyLocationMapIcon";
import GeolocationData from "../geocode/GeolocationData";
import { ReactComponent as IconCurrentLocation } from "../images/location/ic-curr-loc.svg";
import TKUIRealtimeVehicle, { tKUIRealtimeVehicleConfig } from "./TKUIRealtimeVehicle";
import DateTimeUtil from "../util/DateTimeUtil";
import RealTimeVehicle from "../model/service/RealTimeVehicle";
import TKUIRealtimeVehiclePopup from "./TKUIRealtimeVehiclePopup";
import { TKUIConfigContext, default as TKUIConfigProvider } from "../config/TKUIConfigProvider";
import { ERROR_GEOLOC_DENIED, TKUserPosition } from "../util/GeolocationUtil";
import TKUITooltip from "../card/TKUITooltip";
import TKErrorHelper from "../error/TKErrorHelper";
import TKGeocodingOptions, { getGeocodingOptions } from "../geocode/TKGeocodingOptions";
import WaiAriaUtil from "../util/WaiAriaUtil";
import ModeLocation from "../model/location/ModeLocation";
import TKTransportOptions from "../model/options/TKTransportOptions";
import { OptionsContext } from "../options/OptionsProvider";
import TKUIMapLocationPopup from "./TKUIMapLocationPopup";
import { tKUIColors } from "../jss/TKUITheme";
import { i18n } from "../i18n/TKI18nConstants";
import TKMapboxGLLayer from "./TKMapboxGLLayer";
import TKLeafletLayer from "./TKLeafletLayer";
import { MultiPolygon } from "geojson";

export type TKUIMapPadding = { top?: number, right?: number, bottom?: number, left?: number };

interface IClientProps extends IConsumedProps, TKUIWithStyle<IStyle, IProps> {
    /**
     * States if should hide map locations layer.
     * @default false
     * @order 12
     */
    hideLocations?: boolean;

    /**
     * Map padding to be considered when fit map to a given set of locations or bounding box.
     * @default {top: 20, right: 20, bottom: 20, left: 20}
     * @order 11
     */
    padding?: TKUIMapPadding

    /**
     * States if attribution banner should be displayed or not.
     * @deafult true
     */
    attributionControl?: boolean;

    /**
     * Function to specify an action handler for a given location, which will be called when clicking the action button on
     * locaton's callout. Returning undefined for a given location causes no action button to be displayed in that location's callout.
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
     * @deprecated
     */
    mapboxGlLayerProps?: MapboxGLLayerProps;

    /**
     * Layer to be rendered as child of react-leaflet map component.
     * @ctype
     */
    renderLayer?: () => JSX.Element;

    /**
     * If true disable all map click interactions (map dragging and zoom change are kept enabled).
     * @order 10
     */
    readonly?: boolean;

    /**
     * Function to be called on each render to determine if map shold be updated to fit from / to.
     * @ignore Alternatively add parameter to disable auto fit, e.g. autoFitMap, default to true, and rely on
     * imperative map fit.
     */
    shouldFitMap?: (from: Location | undefined, to: Location | undefined, preFrom: Location | undefined, preTo: Location | undefined) => boolean

    /**
     * @default true
     */
    showCurrLocBtn?: boolean;

    /**
     * @ignore until define how to merge with readonly, or just remove it.
     */
    disableMapClick?: boolean | ((zoom?: number) => boolean);

    /**
     * @ignore
     */
    reference?: ((instance: TKUIMapView | null) => void) | MutableRefObject<TKUIMapView | null> | null;

    /**
     * @ctype "SET\_FROM\_TO" | "SET\_TO" | "SET\_FROM" | "NONE"
     * @default "SET\_FROM\_TO".
     * @order 8
     */
    mapClickBehaviour?: "SET_FROM_TO" | "SET_TO" | "SET_FROM" | "NONE"   // Could also offer "DROP_REPLACE_TO", "DROP_REPLACE_FROM", "DROP_REPLACE_FROM_TO" which replaces a pin if exists.

    /**
     * @ctype
     * @order 9     
     * @default Use TKUIMapView.TKStateProps to pass "Directions from here" / "Directions to here" / "What's here" menu, 
     * with it's corresponding effects on the SDK state.
     */
    rightClickMenu?: MenuOptions[];
}
interface IConsumedProps extends Partial<TKUIViewportUtilProps> {
    /**
     * Depart location.
     * @ctype
     * @default Use TKUIMapView.TKStateProps to pass {@link TKState#query}.from
     * @order 1
     */
    from?: Location;

    /**
     * Depart location change callback.
     * @ctype
     * @default Use TKUIMapView.TKStateProps to pass a callback updating {@link TKState#query}.from
     * @order 2
     */
    onFromChange?: (location: Location | null) => void;

    /**
     * Arrive location.
     * @ctype
     * @default Use TKUIMapView.TKStateProps to pass {@link TKState#query}.to
     * @order 3
     */
    to?: Location;

    /**
     * Arrive location change callback.
     * @ctype
     * @default Use TKUIMapView.TKStateProps to pass a callback updating {@link TKState#query}.to
     * @order 4
     */
    onToChange?: (location: Location | null) => void;

    /**
     * Trip to be displayed on map.
     * @ctype
     * @default Use TKUIMapView.TKStateProps to pass {@link TKState#selectedTrip}
     * @order 5
     */
    trip?: Trip;

    /**
     * Segment of the displayed trip to be highlighed.
     * @ctype
     * @default Use TKUIMapView.TKStateProps to pass {@link TKState#selectedTripSegment}
     * @order 6
     */
    tripSegment?: Segment;

    /**
     * Public transport service to be displayed on map.
     * @ctype
     * @default Use TKUIMapView.TKStateProps to pass {@link TKState#selectedService}
     * @order 7
     */
    service?: ServiceDeparture;

    /**
     * Function to be called each time the map viewport (center + zoom) changes.
     * @ctype
     * @default Use TKUIMapView.TKStateProps to pass a callback updating {@link TKState#viewport}
     */
    onViewportChange?: (viewport: { center?: LatLng, zoom?: number }) => void;

    /**     
     * To specify which transports are enabled, so the map will display just relevant locations.
     * @ctype
     * @default Use TKUIMapView.TKStateProps to pass {@link TKState#userProfile}.transportOptions
     * @order 13
     * @divider
     */
    transportOptions?: TKTransportOptions;

    /**     
     * @ctype
     * @default @globaldefault
     */
    setMap?: (ref: TKUIMapView) => void;

    /**     
     * @ctype
     */
    children?: React.ReactNode;

    /**
     * @ignore
     */
    childrenThis?: (mapthis: any) => React.ReactNode;

    /**
     * @ctype
     * @globaldefault
     */
    geocodingOptions?: TKGeocodingOptions;

    /**
     * @ctype
     * @globaldefault
     */
    coverageGeoJson?: MultiPolygon;
}

interface MenuOptions {
    label: string;
    effect?: "SET_FROM" | "SET_TO"
    effectFc?: (coord: LatLng) => void;
}
interface MapboxGLLayerProps {
    accessToken: string;
    style: string;
    attribution: string;
    /* whether or not to register the mouse and keyboard events on the mapbox overlay. See [v0.0.9 changelog](https://github.com/mapbox/mapbox-gl-leaflet/blob/master/CHANGELOG.md#009---2019-09-02) */
    interactive?: boolean;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIMapViewDefaultStyle>

export type TKUIMapViewProps = IProps;
export type TKUIMapViewStyle = IStyle;

export type TKUIMapViewClientProps = IClientProps;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMapView {...props} />,
    styles: tKUIMapViewDefaultStyle,
    classNamePrefix: "TKUIMapView",
    props: {
        tileLayerProps: {
            attribution: "&copy <a href='http://osm.org/copyright' tabindex='-1'>OpenStreetMap</a> contributors",
            url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
    }
};

interface MapLayer {
    type: "mapboxGL" | string;
    ref: any;
}

interface IState {
    menuPopupPosition?: L.LeafletMouseEvent;
    userLocation?: TKUserPosition;
    userLocationTooltip?: string;
    refreshTiles?: boolean;
    modeLocations?: ModeLocation[];
    onModeLocationClick?: (location: ModeLocation) => void;
    coveragePolygon?: LatLngExpression[][];
    layer?: MapLayer
}

type IDefaultProps = Required<Pick<IProps, "mapClickBehaviour" | "rightClickMenu" | "geocodingOptions" | "portrait" | "landscape">>;
class TKUIMapView extends React.Component<IProps & IDefaultProps, IState> {

    static defaultProps: IDefaultProps = {
        mapClickBehaviour: "SET_FROM_TO",
        rightClickMenu: [
            { label: "Set as origin", effect: "SET_FROM" },
            { label: "Set as destination", effect: "SET_TO" }
        ],
        geocodingOptions: {} as any,  // Just since it cannot be left undefined, it's always overriden in the Mapper.
        portrait: false,
        landscape: true
    };

    private leafletElement?: L.Map;
    private wasDoubleClick = false;
    private userLocTooltipRef?: any;
    public mapboxGlMap?: any;
    public resolveMapboxGlMap?: any;
    public mapboxGlMapP: Promise<any> = new Promise<any>((resolve, reject) => {
        this.resolveMapboxGlMap = resolve;
    });


    constructor(props: Readonly<IProps & IDefaultProps>) {
        super(props);
        this.state = {};
        this.onTrackUserLocation = this.onTrackUserLocation.bind(this);
        this.showUserLocTooltip = this.showUserLocTooltip.bind(this);
        this.getLocationPopup = this.getLocationPopup.bind(this);
        NetworkUtil.loadCss("https://unpkg.com/leaflet@1.6.0/dist/leaflet.css");
    }

    public registerLayer(layer: MapLayer) {
        this.setState({ layer });
    }

    public unregisterLayer(layer: MapLayer) {
        if (this.state.layer?.ref === layer.ref) {
            this.setState({ layer: undefined });
        }
    }

    public setModeLocations(locations?: ModeLocation[], onClick?: (location: ModeLocation) => void) {
        this.setState({
            modeLocations: locations,
            onModeLocationClick: onClick
        });
    }

    private onMapLocChanged(isFrom: boolean, latLng: LatLng) {
        const mapLocation = latLng instanceof ModeLocation ? latLng as ModeLocation :
            Location.createDroppedPin(latLng, this.props.t);
        if (isFrom) {
            // If from is already set then remove it so when setting it again the
            // Marker onadd event is triggered again, and popup is displayed.
            if (this.props.from) {
                this.props.onFromChange && this.props.onFromChange(null);
            }
            this.props.onFromChange && this.props.onFromChange(mapLocation);
        } else {
            // Analogous to from above.
            if (this.props.to) {
                this.props.onToChange && this.props.onToChange(null);
            }
            this.props.onToChange && this.props.onToChange(mapLocation);
        }
        if (mapLocation.isDroppedPin()) {
            getGeocodingData(this.props.geocodingOptions)
                .reverseGeocode(latLng, result => {
                    // If reverse geocode fails then add a trailing space to dropped pin address ("Location") to
                    // force WithRoutingResults.onQueryChange to refresh trips (loc.isDroppedPin() will be false, and
                    // WithRoutingResults.sameApiQueries will also be false, since now it also sends addresses).
                    // Alternatively, to force WithRoutingResults.sameApiQueries to be false can set query from / to
                    // to null before setting loc.
                    const loc = result ?? Util.iAssign(mapLocation, { address: mapLocation.address + " " });
                    // Need to use onQueryUpdate instead of onQueryChange since
                    // routingContext.query can be outdated at the time this callback is
                    // executed. OnQueryUpdate always use the correct query (the one on
                    // WithRoutingResults state, the source of truth).
                    if (isFrom) {
                        this.props.onFromChange && this.props.onFromChange(loc);
                    } else {
                        this.props.onToChange && this.props.onToChange(loc);
                    }
                })
        }
    };

    private onClick(clickLatLng: LatLng) {
        const { from, to, mapClickBehaviour, disableMapClick } = this.props;
        if (typeof disableMapClick === 'function' ? disableMapClick?.(this.getZoom()) : disableMapClick) {
            return;
        }
        // Do nothing if the location is already the from or to.
        if (from && from.equals(clickLatLng) || to && to.equals(clickLatLng)) {
            return;
        }
        let setFrom;
        switch (mapClickBehaviour) { // When clicking mode location, we always set as from/to, even if already set (replace).
            case "SET_FROM_TO":
                if (!from || !to || clickLatLng instanceof ModeLocation) {
                    if (!from && !to) {
                        // Avoid fit bounds when setting first of from or to
                        avoidFitLatLng = clickLatLng
                    }
                    setFrom = !from;
                }
                break;
            case "SET_FROM":
                if (!from || clickLatLng instanceof ModeLocation) {
                    setFrom = true;
                }
                break;
            case "SET_TO":
                if (!to || clickLatLng instanceof ModeLocation) {
                    setFrom = false;
                }
                break;
            default: // "NONE"
                break;
        }

        if (setFrom !== undefined) {
            this.onMapLocChanged(setFrom, clickLatLng);
            GATracker.event({
                category: CATEGORY_QUERY_INPUT,
                action: setFrom ? ACTION_PICK_FROM_LOCATION : ACTION_PICK_TO_LOCATION,
                label: "drop to"
            });
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
            if (fitSet[0].isDroppedPin()) {
                return;
            }
            const zoom = this.leafletElement!.getZoom();
            const newZoom = zoom !== undefined && zoom >= 10 ? zoom : 13; // zoom in if zoom < 10.
            this.setViewport(fitSet[0], newZoom);
            return;
        }
        this.fitBounds(MapUtil.createBBoxArray(fitSet));
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
                        return { userLocation: userPosition }
                    });
                },
                (error: Error) => {
                    this.userLocationSubscription && this.userLocationSubscription.unsubscribe();
                    this.userLocationSubscription = undefined;
                    this.setState({ userLocation: undefined });
                    onError && onError(error);
                });
    }

    private showUserLocTooltip(text: string | undefined) {
        this.setState({ userLocationTooltip: text });
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
                onClose={() => this.setState({ menuPopupPosition: undefined })}
            >
                <div className={classes.menuPopupContent}>
                    {this.props.rightClickMenu?.map(({ label, effect, effectFc }, i) =>
                        <div
                            className={classes.menuPopupItem}
                            onClick={() => {
                                const clickedLatLng = LatLng.createLatLng(popupLatLng!.lat, popupLatLng!.lng);
                                if (effect) {
                                    this.onMapLocChanged(effect === "SET_FROM", clickedLatLng);
                                }
                                this.setState({ menuPopupPosition: undefined });
                                effectFc?.(clickedLatLng);
                            }}
                            key={i}
                        >
                            {label}
                        </div>)}
                </div>
            </Popup>;
        const padding = Object.assign({ top: 20, right: 20, bottom: 20, left: 20 }, this.props.padding);
        const paddingOptions = { paddingTopLeft: [padding.left, padding.top], paddingBottomRight: [padding.right, padding.bottom] } as FitBoundsOptions;
        const service = this.props.service;
        const t = this.props.t;
        const renderLayer = this.props.renderLayer ??
            (() => {
                return this.props.mapboxGlLayerProps ?
                    <TKMapboxGLLayer {...this.props.mapboxGlLayerProps} /> :
                    <TKLeafletLayer {...this.props.tileLayerProps!} />
            })
        return (
            <div className={classes.main}>
                <RLMap
                    className={classes.leaflet}
                    // TODO: check I don't need to pass boundsOptions to fitBounds anymore
                    boundsOptions={paddingOptions}
                    maxBounds={L.latLngBounds([-90, -1800], [90, 1800])} // To avoid lats > 90 or < -90
                    minZoom={2}
                    // Since this is to max zoom on underlying mapbox gl map, while leaflet reaches greater zooms, and so zooms between
                    // both maps lose sync. This causes issues on projection calculations to translate a target lat lng to a mapbox-gl point.
                    maxZoom={23}
                    // If maxBounds is set, this option will control how solid the bounds are when dragging the map
                    // around, 1.0 makes the bounds fully solid, preventing the user from dragging outside the bounds.
                    maxBoundsViscosity={1.0}
                    // With this option enabled, the map tracks when you pan to another "copy" of the world and seamlessly
                    // jumps to the original one so that all overlays like markers and vector layers are still visible.
                    worldCopyJump={true}
                    onViewportChanged={(viewport: Viewport) => {
                        this.props.onViewportChange?.({
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
                    ref={(ref: any) => {
                        if (ref) {
                            const init = !this.leafletElement && ref.leafletElement;
                            this.leafletElement = ref.leafletElement;
                            if (init) {
                                // Init map viewport, so we don't get an exception when getting map zoom or center.                                
                                this.setViewport(LatLng.createLatLng(MapUtil.worldCoords.lat, MapUtil.worldCoords.lng), 2);
                                this.props.setMap?.(this);
                                // To avoid map glitch where city icons are bad positioned initially, which fixes with any map movement.
                                this.setViewport(LatLng.createLatLng(MapUtil.worldCoords.lat, MapUtil.worldCoords.lng + 1), 2);
                            }
                        }
                    }}
                    zoomControl={false}
                    attributionControl={this.props.attributionControl !== false}
                    oncontextmenu={(e: L.LeafletMouseEvent) => {
                        if (!this.props.readonly && this.props.rightClickMenu) {
                            this.setState({ menuPopupPosition: e });
                        }
                    }}
                    tap={true} // It should make a long tap to trigger oncontextmenu on iOS, but it doesn't work.
                    // Workaround: https://github.com/Leaflet/Leaflet/issues/6865
                    // Working example: https://www.mappite.org/tap/testTap2.html
                    // Leafet doc: https://leafletjs.com/reference-1.6.0.html#map-taptolerance
                    // To make this work with Pointer events experimental feature need to use leaflet > 1.6.0:
                    // https://github.com/Leaflet/Leaflet/issues/6817#issuecomment-554788008
                    keyboard={false}
                >
                    {renderLayer()}
                    {this.state.coveragePolygon && this.state.layer?.type !== "mapboxGL" &&
                        <Polygon
                            positions={this.state.coveragePolygon}
                            color={this.props.theme.isDark ? '#f5faff' : '#212A33'}
                            fillOpacity={.4}
                            stroke={false}
                        />}
                    {this.props.landscape && <ZoomControl position={"topright"} />}
                    {this.state.userLocation &&
                        <TKUIConfigContext.Consumer>{config =>
                            <Marker position={this.state.userLocation!.latLng}
                                icon={L.divIcon({
                                    html: renderToStaticMarkup(
                                        <TKUIConfigProvider config={config}>
                                            <TKUIMyLocationMapIcon />
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
                            </Marker>
                        }</TKUIConfigContext.Consumer>}
                    {!this.props.trip && this.props.from && this.props.from.isResolved() &&
                        !(this.props.from.isCurrLoc() && this.state.userLocation) &&
                        <TKUIConfigContext.Consumer>
                            {config =>
                                // This is to move jss injection outside renderToStaticMarkup, since otherwise styles get broken.
                                <TKRenderOverride
                                    componentKey={"TKUIMapLocationIcon"}
                                    renderOverride={(renderProps, configRender) => {
                                        const render = configRender ?? tKUIMapLocationIconConfig.render;
                                        return <Marker
                                            position={this.props.from!}
                                            icon={L.divIcon({
                                                html: renderToStaticMarkup(
                                                    // This is to make TKUIIcon work (it has no style injection, so no issue with jss styles getting broken).
                                                    <TKUIConfigProvider config={config}>
                                                        {render(renderProps)}
                                                    </TKUIConfigProvider>
                                                ),
                                                iconSize: [26, 39],
                                                iconAnchor: [13, 39],
                                                className: "LeafletMap-pinTo"
                                            })}
                                            draggable={!this.props.readonly}
                                            riseOnHover={true}
                                            ondragend={(event: L.DragEndEvent) => {
                                                const latLng = event.target.getLatLng();
                                                this.onMapLocChanged(true, LatLng.createLatLng(latLng.lat, latLng.lng));
                                            }}
                                            keyboard={false}
                                            onadd={event => event.target.openPopup()}
                                        >
                                            {this.getLocationPopup(this.props.from!)}
                                        </Marker>;
                                    }}
                                >
                                    <TKUIMapLocationIcon
                                        from={true}
                                        location={this.props.from!}
                                    />
                                </TKRenderOverride>
                            }
                        </TKUIConfigContext.Consumer>}
                    {!this.props.trip && this.props.to && this.props.to.isResolved() && !service &&
                        <TKUIConfigContext.Consumer>
                            {config =>
                                // This is to move jss injection outside renderToStaticMarkup, since otherwise styles get broken.
                                <TKRenderOverride
                                    componentKey={"TKUIMapLocationIcon"}
                                    renderOverride={(renderProps, configRender) => {
                                        const render = configRender ?? tKUIMapLocationIconConfig.render;
                                        return <Marker
                                            position={this.props.to!}
                                            icon={L.divIcon({
                                                html: renderToStaticMarkup(
                                                    // This is to make TKUIIcon work (it has no style injection, so no issue with jss styles getting broken).
                                                    <TKUIConfigProvider config={config}>
                                                        {render(renderProps)}
                                                    </TKUIConfigProvider>
                                                ),
                                                iconSize: [26, 39],
                                                iconAnchor: [13, 39],
                                                className: "LeafletMap-pinTo"
                                            })}
                                            draggable={!this.props.readonly}
                                            riseOnHover={true}
                                            ondragend={(event: L.DragEndEvent) => {
                                                const latLng = event.target.getLatLng();
                                                this.onMapLocChanged(false, LatLng.createLatLng(latLng.lat, latLng.lng));
                                            }}
                                            keyboard={false}
                                            onadd={event => event.target.openPopup()}
                                        >
                                            {this.getLocationPopup(this.props.to!)}
                                        </Marker>;
                                    }}
                                >
                                    <TKUIMapLocationIcon location={this.props.to!} />
                                </TKRenderOverride>
                            }
                        </TKUIConfigContext.Consumer>}
                    {this.leafletElement && this.props.hideLocations !== true &&
                        <TKUIMapLocations
                            bounds={this.toBBox(this.leafletElement.getBounds())}
                            zoom={this.leafletElement.getZoom()}
                            onClick={(loc: Location) => {
                                this.onClick(loc);
                            }}
                            omit={(this.props.from ? [this.props.from] : []).concat(this.props.to ? [this.props.to] : [])}
                            isDarkMode={this.props.theme.isDark}
                            transportOptions={this.props.transportOptions}
                        />
                    }
                    {this.state.modeLocations?.map((location, i) =>
                        <TKUIModeLocationMarker loc={location} onClick={() => this.state.onModeLocationClick?.(location)} key={i} />)}
                    {tripSegments && tripSegments.map((segment: Segment, i: number) => (
                        <MapTripSegment
                            segment={segment}
                            ondragend={!this.props.readonly && (segment.isFirst(Visibility.IN_SUMMARY) || segment.arrival) ?
                                (latLng: LatLng) => this.onMapLocChanged(segment.isFirst(Visibility.IN_SUMMARY), latLng) : undefined}
                            segmentIconClassName={classes.segmentIconClassName}
                            vehicleClassName={classes.vehicleClassName}
                            onLocationAction={(segment.isFirst(Visibility.IN_SUMMARY) || segment.arrival) ?
                                this.props.locationActionHandler && this.props.locationActionHandler(segment.from) : undefined}
                            key={i}
                            t={this.props.t} />
                    ))}
                    {service &&
                        <MapService
                            serviceDeparture={service}
                            segmentIconClassName={classes.segmentIconClassName}
                        />}
                    {service && service.realtimeVehicle &&
                        (DateTimeUtil.getNow().valueOf() / 1000 - service.realtimeVehicle.lastUpdate) < 120 &&
                        <TKRenderOverride
                            componentKey={"TKUIRealtimeVehicle"}
                            renderOverride={(renderProps, configRender) => {
                                const render = configRender ?? tKUIRealtimeVehicleConfig.render;
                                return <Marker
                                    position={service.realtimeVehicle!.location}
                                    icon={L.divIcon({
                                        html: renderToStaticMarkup(render(renderProps)),
                                        iconSize: [40, 40],
                                        iconAnchor: [20, 20],
                                        className: classes.vehicle
                                    })}
                                    riseOnHover={true}
                                    keyboard={false}
                                >
                                    {TKUIMapView.getPopup(service.realtimeVehicle!, service.modeInfo.alt + " " + service.serviceNumber)}
                                </Marker>;
                            }}
                        >
                            <TKUIRealtimeVehicle
                                value={service.realtimeVehicle}
                                label={service.serviceNumber}
                                color={service.serviceColor}
                            />
                        </TKRenderOverride>}
                    {menuPopup}
                    {this.props.children}
                    {this.props.childrenThis?.(this)}
                </RLMap>
                <ReactResizeDetector handleWidth={true} handleHeight={true}
                    onResize={() => this.onResize()}
                />
                {this.props.showCurrLocBtn !== false &&
                    <TKUITooltip
                        overlayContent={this.state.userLocationTooltip}
                        arrowColor={this.props.theme.isLight ? tKUIColors.black2 : tKUIColors.black1}
                        visible={false}
                        placement={"right"}
                        reference={(ref: any) => this.userLocTooltipRef = ref}
                        onRequestClose={() => this.showUserLocTooltip(undefined)}
                        role={"alert"}
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
                            <IconCurrentLocation />
                        </button>
                    </TKUITooltip>}
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
            <TKUIRealtimeVehiclePopup value={realTimeVehicle} title={title} />
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
        setTimeout(() => {
            WaiAriaUtil.apply(".mapboxgl-canvas", { tabIndex: -1, ariaHidden: true });
            WaiAriaUtil.apply(".mapboxgl-ctrl-logo", { tabIndex: -1, ariaHidden: true });
            WaiAriaUtil.apply(".leaflet-control-zoom-in", { ariaLabel: "Zoom in map" });
            WaiAriaUtil.apply(".leaflet-control-zoom-out", { ariaLabel: "Zoom out map" });
            WaiAriaUtil.apply(".leaflet-marker-pane", { ariaHidden: true });
            WaiAriaUtil.apply(".leaflet-popup-pane", { ariaHidden: true });
            const leafletControlAttribution = WaiAriaUtil.getElementByQuerySelector(".leaflet-control-attribution");
            leafletControlAttribution && leafletControlAttribution.children.length > 0 &&
                leafletControlAttribution.children[0].setAttribute("tabindex", "-1");
        }, 1000);
        if (this.props.from || this.props.to) {
            this.fitMap(this.props.from ? this.props.from : null, this.props.to ? this.props.to : null);
        }
        // TODO Delete: Can actually delete this? It causes an exception sometimes.
        setTimeout(() => this.onResize(), 5000);
        if (this.props.reference) {
            if (Util.isFunction(this.props.reference)) {
                (this.props.reference as ((instance: TKUIMapView | null) => void))(this);
            } else {
                (this.props.reference as MutableRefObject<TKUIMapView | null>).current = this;
            }
        }
    }

    public componentDidUpdate(prevProps: IProps & IDefaultProps): void {
        const paddingChanged = JSON.stringify(this.props.padding) !== JSON.stringify(prevProps.padding);
        const shouldFitMap = this.props.shouldFitMap ||
            ((from: Location | undefined, to: Location | undefined, preFrom: Location | undefined, preTo: Location | undefined) =>
                this.checkFitLocation(preFrom, from) || this.checkFitLocation(preTo, to));
        if (shouldFitMap(this.props.from, this.props.to, prevProps.from, prevProps.to) || paddingChanged) {
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
            this.fitBounds(MapUtil.createBBoxArray([this.props.from, this.props.to]));
        }

        // If computing trips from user location then show it on map.
        if (
            this.props.from && this.props.from.isCurrLoc() && this.props.from.isResolved() && !this.userLocationSubscription) {
            this.onTrackUserLocation();
            // This line is to display user location spot immediately, and avoid green pin showing first to be replaced
            // by user location spot. Alternatively can make this.onTrackUserLocation() to use cached user position
            // the first time, so spot also should show immediately.
            this.setState({ userLocation: { latLng: this.props.from } });
        }

        const { trip, tripSegment } = this.props;
        if (!tripSegment && // Not in MxM view
            (trip !== prevProps.trip || paddingChanged) && trip) {
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
            this.setState({ refreshTiles: true });
            setTimeout(() => this.setState({ refreshTiles: undefined }));
        }

        if (this.props.coverageGeoJson !== prevProps.coverageGeoJson) {
            this.setState({ coveragePolygon: this.props.coverageGeoJson ? MapUtil.toLeafletMultiPolygon(this.props.coverageGeoJson) : undefined })
        }
    }

    public getZoom(): number | undefined {
        return this.leafletElement?.getZoom();
    }

    public getCenter(): LatLng | undefined {
        const center = this.leafletElement?.getCenter();
        return center && LatLng.createLatLng(center[0], center[1]);
    }

    public getBounds(): BBox | undefined {
        return this.leafletElement && this.toBBox(this.leafletElement?.getBounds());
    }

    public setViewport(center: LatLng, zoom: number) {
        let adjustedCenter;
        if (this.props.padding && this.props.padding.left) {
            const targetPoint = this.leafletElement!.project(center, zoom).subtract([this.props.padding.left / 2, 0]);
            adjustedCenter = this.leafletElement!.unproject(targetPoint, zoom);
        } else if (this.props.padding && this.props.padding.bottom) {
            const targetPoint = this.leafletElement!.project(center, zoom).subtract([0, -this.props.padding.bottom / 2]);
            adjustedCenter = this.leafletElement!.unproject(targetPoint, zoom);
        } else {
            adjustedCenter = center
        }
        try {
            this.leafletElement && this.leafletElement.setView([adjustedCenter.lat, adjustedCenter.lng], zoom);
        } catch (e) {
            console.log(e);
        }
    }

    public fitBounds(bounds: BBox) {
        if (this.leafletElement) {
            const padding = Object.assign({ top: 20, right: 20, bottom: 20, left: 20 }, this.props.padding);
            const options = { paddingTopLeft: [padding.left, padding.top], paddingBottomRight: [padding.right, padding.bottom] } as FitBoundsOptions;
            try {
                this.leafletElement.fitBounds(L.latLngBounds([bounds.sw, bounds.ne]), options);
            } catch (error) {
                // TODO: fix it
                console.log("Prevent bounds exception : ");
                console.error(error);
            }
        }
    }

    private toBBox(bounds: LatLngBounds) {
        return MapUtil.createBBoxArray([MapUtil.toLatLng(bounds.getNorthEast()), MapUtil.toLatLng(bounds.getSouthWest())]);
    }

    public alreadyFits(bounds: BBox): boolean {
        const padding = Object.assign({ top: 0, right: 0, bottom: 0, left: 0 }, this.props.padding);
        return this.leafletElement ?
            MapUtil.alreadyFits(this.toBBox(this.leafletElement.getBounds()), padding, bounds,
                this.leafletElement.getContainer().offsetWidth, this.leafletElement.getContainer().offsetHeight)
            : false;
    }

    public onResize() {
        try {
            this.leafletElement!.invalidateSize();
        } catch (e) {
            console.log(e);
        }
    }

    public getLeafletMap() {
        return this.leafletElement;
    }

}

let geocodingData: MultiGeocoder;

function getGeocodingData(geocodingOptions: TKGeocodingOptions) {
    if (!geocodingData) {
        geocodingData = new MultiGeocoder(geocodingOptions);
    }
    return geocodingData;
}

let avoidFitLatLng: LatLng | undefined;

const Consumer: React.FunctionComponent<{ children: (props: IConsumedProps) => React.ReactNode }> =
    (props: { children: (props: IConsumedProps) => React.ReactNode }) => {
        const t = i18n.t;
        const optionsContext = useContext(OptionsContext);
        const routingContext = useContext(RoutingResultsContext);
        const serviceContext = useContext(ServiceResultsContext);
        return (
            <TKUIViewportUtil>
                {(viewportProps: TKUIViewportUtilProps) => {
                    const from = routingContext.preFrom ? routingContext.preFrom :
                        (routingContext.query.from ? routingContext.query.from : undefined);
                    const to = routingContext.preTo ? routingContext.preTo :
                        (routingContext.query.to ? routingContext.query.to : undefined);
                    const consumerProps: IConsumedProps = {
                        from: from,
                        onFromChange: (location: Location | null) =>
                            routingContext.onQueryUpdate(Util.iAssign(routingContext.query, {
                                from: location
                            })),
                        to: to,
                        onToChange: (location: Location | null) =>
                            routingContext.onQueryUpdate(Util.iAssign(routingContext.query, {
                                to: location
                            })),
                        trip: routingContext.selectedTrip,
                        tripSegment: routingContext.selectedTripSegment,
                        service: serviceContext.selectedService && serviceContext.selectedService.serviceDetail ?
                            serviceContext.selectedService : undefined,
                        ...viewportProps,
                        transportOptions: optionsContext.userProfile.transportOptions,
                        setMap: routingContext.setMap,
                        onViewportChange: routingContext.onViewportChange
                    };
                    return (
                        props.children!(consumerProps)
                    );
                }}
            </TKUIViewportUtil>
        );
    };

const Mapper: PropsMapper<IClientProps, IClientProps> = ({ inputProps, children }) => {
    const { geocoding } = useContext(TKUIConfigContext);
    const { coverageGeoJson } = useContext(RoutingResultsContext);
    const geocodingOptions = useMemo(() => getGeocodingOptions(geocoding), [geocoding]);
    return (
        <>
            {children!({ geocodingOptions, coverageGeoJson, ...inputProps })}
        </>
    );
};

/**
 * Leaflet-based map to display TripGo api related elements: e.g. depart and arrive locations, trips,
 * public transport services, transport-related locations, user's current location, etc.
 * It supports both raster tiles, and vector tiles through the
 * [react-mapbox-gl-leaflet library](https://github.com/mongodb-js/react-mapbox-gl-leaflet).
 * 
 *  You can connect the component to the SDK global state, {@link TKState}, by forwarding the props
 *  provided by TKUIMapViewHelpers.TKStateProps, in the following way:
 * 
 *  ```
 *   <TKUIMapViewHelpers.TKStateProps>
 *      {stateProps => 
 *          <TKUIMapView 
 *              {...stateProps}
 *              // Other props
 *          />}
 *   </TKUIMapViewHelpers.TKStateProps>
 *  ```
 * 
 *
 * In this way, the map will display 'from' and 'to' locations for the current query in the SDK state, 
 * as well as selected trip result, selected trip segment, etc. Also will update current state query 
 * with from / to picked by clicking (dropping pin) on map, and also will support triggering trip 
 * computation by right clicking on map and selecting "Directions from here" or "Directions to here".
 */

const Component = connect((config: TKUIConfig) => config.TKUIMapView, config, Mapper);
export default React.forwardRef<TKUIMapView, IClientProps>((props: IClientProps, ref) => (
    <Component {...props} reference={ref} />
));
export { TKUIMapView as TKUIMapViewClass };
export { Marker, Popup, L };

export const TKUIMapViewHelpers = {
    TKStateProps: Consumer,
    useTKStateProps: () => { }   // Hook version of TKStateProps, not defined for now.
}