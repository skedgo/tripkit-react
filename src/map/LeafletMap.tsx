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
import {IProps as SegmentPinIconProps, default as SegmentPinIcon} from "./SegmentPinIcon";
import {IProps as SegmentPopupProps, default as SegmentPopup} from "./SegmentPopup";
import Street from "../model/trip/Street";
import ServiceShape from "../model/trip/ServiceShape";
import {IProps as ServiceStopPopupProps, default as ServiceStopPopup} from "./ServiceStopPopup";

interface IProps {
    from?: Location;
    to?: Location;
    trip?: Trip;
    showLocations?: boolean;
    viewport?: {center?: LatLng, zoom?: number};
    bounds?: BBox;
    onclick?: (latLng: LatLng) => void;
    ondragend?: (from: boolean, latLng: LatLng) => void;
    onViewportChanged?: (viewport: {center?: LatLng, zoom?: number}) => void;
    attributionControl?: boolean;
    renderPinIcon?: <P extends SegmentPinIconProps>(props: P) => JSX.Element;
    renderPopup?: <P extends SegmentPopupProps>(props: P) => JSX.Element;
    shapePolylineOptions?: (shape: ServiceShape, segment: Segment) =>
        PolylineProps | PolylineProps[] | undefined;  // If return undefined shape won't show.
    streetPolylineOptions?: (street: Street, segment: Segment) => PolylineProps | PolylineProps[];
    renderServiceStopPopup?: <P extends ServiceStopPopupProps>(props: P) => JSX.Element;
}

interface IState {
    mapLayers: Map<MapLocationType, Location[]>;
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
            mapLayers: new Map<MapLocationType, Location[]>()
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
            LocationsData.instance.requestLocations("AU_ACT_Canberra", 1);
            if (this.leafletElement.getZoom() >= this.ZOOM_ALL_LOCATIONS) {
                LocationsData.instance.requestLocations("AU_ACT_Canberra", 2, LeafletUtil.toBBox(this.leafletElement.getBounds()));
            }
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

    public render(): React.ReactNode {
        const lbounds = this.props.bounds ? L.latLngBounds([this.props.bounds.sw, this.props.bounds.ne]) : undefined;
        const renderPinIcon = this.props.renderPinIcon ? this.props.renderPinIcon :
            <P extends SegmentPinIconProps>(props: P) => <SegmentPinIcon {...props}/>;
        const renderPopup = this.props.renderPopup ? this.props.renderPopup :
            <P extends SegmentPopupProps>(props: P) => <SegmentPopup {...props}/>;
        const shapePolylineOptions = this.props.shapePolylineOptions ? this.props.shapePolylineOptions :
            (shape: ServiceShape, segment: Segment) => {
                return [
                    {
                        positions: shape.waypoints,
                        weight: 9,
                        color: shape.travelled ? "black" : "lightgray",
                        opacity: shape.travelled ? 1 : .5,
                    } as PolylineProps,
                    {
                        positions: shape.waypoints,
                        weight: 7,
                        color: shape.travelled ? segment.getColor() : "grey",
                        opacity: shape.travelled ? 1 : .5,
                    } as PolylineProps
                ];
            };
        const streetPolylineOptions = this.props.streetPolylineOptions ? this.props.streetPolylineOptions :
            (street: Street, segment: Segment) => {
                return [
                    {
                        positions: street.waypoints,
                        weight: 9,
                        color: "black",
                        // opacity: !this.segment.isBicycle() || street.safe ? 1 : .3
                        opacity: 1  // Disable safe distinction for now
                    } as PolylineProps,
                    {
                        positions: street.waypoints,
                        weight: 7,
                        color: segment.isWalking() ? "#20ce6e" : segment.getColor(),
                        // opacity: !this.segment.isBicycle() || street.safe ? 1 : .3
                        opacity: 1  // Disable safe distinction for now
                    } as PolylineProps
                ]
            };
        const renderServiceStopPopup = this.props.renderServiceStopPopup ? this.props.renderServiceStopPopup :
            <P extends ServiceStopPopupProps>(props: P) => <ServiceStopPopup {...props}/>;
        let tripSegments;
        if (this.props.trip) {
            const last: Segment = this.props.trip!.segments[this.props.trip!.segments.length - 1];
            const arrival = Util.iAssign(last, {});
            arrival.arrival = true;
            arrival.from = last.to;
            arrival.action = "Arrive";
            tripSegments = this.props.trip.segments.concat([arrival]);
        }
        return (
            <RLMap
                className="map-canvas avoidVerticalScroll gl-flex gl-grow"
                viewport={this.props.viewport}
                bounds={lbounds}
                boundsOptions={{padding: [20, 20]}}
                onViewportChanged={this.props.onViewportChanged}
                onclick={(event: L.LeafletMouseEvent) => {
                    if (this.props.onclick) {
                        setTimeout(() => {
                            if (this.wasDoubleClick) {
                                this.wasDoubleClick = false;
                                return;
                            }
                            if (this.props.onclick) {
                                this.props.onclick(LatLng.createLatLng(event.latlng.lat, event.latlng.lng));
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
                            if (this.props.ondragend) {
                                const latLng = event.target.getLatLng();
                                this.props.ondragend(true, LatLng.createLatLng(latLng.lat, latLng.lng));
                            }
                        }}
                >
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
                }
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
                            if (this.props.ondragend) {
                                const latLng = event.target.getLatLng();
                                this.props.ondragend(false, LatLng.createLatLng(latLng.lat, latLng.lng));
                            }
                        }}
                >
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
                }
                {locTypeValues().map((locType: MapLocationType) =>
                    this.isShowLocType(locType) &&
                        this.state.mapLayers.get(locType)!.map((loc: Location) =>
                            this.getLocMarker(locType, loc)
                        )
                )}
                {tripSegments && tripSegments.map((segment: Segment, i: number) => {
                    return <MapTripSegment segment={segment}
                                           ondragend={(segment.isFirst(Visibility.IN_SUMMARY) || segment.arrival) && this.props.ondragend ?
                                               (latLng: LatLng) => this.props.ondragend!(segment.isFirst(Visibility.IN_SUMMARY), latLng) : undefined}
                                           renderPinIcon={renderPinIcon}
                                           renderPopup={renderPopup}
                                           shapePolylineOptions={shapePolylineOptions}
                                           streetPolylineOptions={streetPolylineOptions}
                                           renderServiceStopPopup={renderServiceStopPopup}
                                           key={i}/>;
                })}
                {this.props.children}
            </RLMap>
        )
    }

    public componentWillMount(): void {
        NetworkUtil.loadCss("https://unpkg.com/leaflet@1.3.4/dist/leaflet.css");
    }


    public componentDidMount(): void {
        this.refreshMapLocations();
        this.leafletElement.on("dblclick", event1 => {
            this.wasDoubleClick = true;
        })
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

export default LeafletMap;