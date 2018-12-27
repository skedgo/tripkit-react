import LatLng from "../model/LatLng";
import Location from "../model/Location";
import LocationUtil from "../util/LocationUtil";
import L, {FitBoundsOptions, Marker} from "leaflet";
import BBox from "../model/BBox";
import Segment from "../model/trip/Segment";
import SegmentPolyline from "./SegmentPolyline";
import Trip from "../model/trip/Trip";
import {renderToStaticMarkup} from 'react-dom/server';
import * as React from "react";
import SegmentPinIcon from "./SegmentPinIcon";
import TransportUtil from "../trip/TransportUtil";
import IconServiceStop from "-!svg-react-loader!../images/ic-service-stop.svg";
import ServiceStopLocation from "../model/ServiceStopLocation";
import ServiceStopPopup from "./ServiceStopPopup";
import * as ReactDOM from 'react-dom';
import {Visibility} from "../model/trip/SegmentTemplate";
import LocationsData from "../data/LocationsData";
import LocationsResult from "../model/location/LocationsResult";
import LeafletUtil from "../util/LeafletUtil";
import MapLocationSet from "./MapLocationSet";
import OptionsData from "../data/OptionsData";
import {MapLocationType, mapLocationTypeToGALabel} from "../model/location/MapLocationType";
import Options from "../model/Options";
import MapLocationPopup from "./MapLocationPopup";
import Util from "../util/Util";
import SegmentPopup from "./SegmentPopup";
import Constants from "../util/Constants";
import FacilityLocation from "../model/location/FacilityLocation";
import GATracker from "../analytics/GATracker";

class LeafletMap {

    protected map: L.Map;

    /* ---------------------------------------------------------------------------------------------------------
     * Probably extract to higher level class TripPlannerMap (equivalent to MapPresenter/MapView in skedgo-java) that
     * uses either LeafletMap or GMap.
     * ---------------------------------------------------------------------------------------------------------
     */

    // private readonly ZOOM_ALL_LOCATIONS = 15;
    private readonly ZOOM_ALL_LOCATIONS = 0;    // Zoom all locations at any zoom.
    private readonly ZOOM_PARENT_LOCATIONS = 11;

    private from: Location | null = null;
    private to: Location | null = null;
    private fromMarker: Marker | null = null;
    private toMarker: Marker | null = null;
    private dragEndHandler: ((from: boolean, latLng: LatLng) => void) | null;
    private trip: Trip | null;
    private segmentPolylines: SegmentPolyline[] = [];
    private mapLocsEnabled: boolean = true;
    private mapLayers: Map<MapLocationType, MapLocationSet> = new Map<MapLocationType, MapLocationSet>();
    private wasDoubleClick = false;

    constructor(map: L.Map) {
        this.map = map;
        this.map.zoomControl.setPosition("topright");
        LocationsData.instance.addChangeListener((locResult: LocationsResult) => this.onLocationsChanged(locResult));
        for (const mapLocType of this.getMapLocLayers()) {
            this.mapLayers.set(mapLocType, new MapLocationSet(this.map,
                this.getMapLocRenderer(mapLocType),
                (loc: Location) => {
                    const popup = L.popup({
                        offset: [0, 0],
                        closeButton: false
                    });
                    popup.setContent(LeafletMap.generateMapLocationPopupMarkup(loc));
                    return popup; }
            ));
        }

        OptionsData.instance.addChangeListener((update: Options, prev: Options) => {
           if (update.mapLayers !== prev.mapLayers) {
               this.refreshMapLocations();
           }
        });

        this.map.on("moveend", event => {
            const mapBounds = this.map.getBounds();
            if (mapBounds.getNorth() === 90) {  // Filter first bounds, which are like max possible bounds
                return;
            }
            this.refreshMapLocations();
        });

        this.map.on("dblclick", event1 => {
            this.wasDoubleClick = true;
        })
    }

    private getMapLocLayers(): MapLocationType[] {
        return [MapLocationType.BIKE_POD, MapLocationType.MY_WAY_FACILITY, MapLocationType.PARK_AND_RIDE_FACILITY];
    }

    private getMapLocRenderer(mapLocType: MapLocationType): (loc: Location) => L.Marker {
        switch (mapLocType) {
            case MapLocationType.BIKE_POD:
                return (loc: Location) => {
                    const marker = L.marker(loc, {
                        icon: L.icon({
                            iconUrl: Constants.absUrl("/images/modeicons/ic-bikeShare.svg"),
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    });
                    marker.on('popupopen', () => {
                        GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType));
                    });
                    return marker
                };
            case MapLocationType.MY_WAY_FACILITY:
                return (loc: Location) => {
                    const marker = L.marker(loc, {
                        icon: L.icon({
                            iconUrl: Constants.absUrl("/images/modeicons/ic-myway.svg"),
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    });
                    marker.on('popupopen', () => {
                        GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType));
                    });
                    return marker
                };
            case MapLocationType.PARK_AND_RIDE_FACILITY:
                return (loc: Location) => {
                    const marker = L.marker(loc, {
                        icon: L.icon({
                            iconUrl: Constants.absUrl("/images/modeicons/ic-parkAndRide.svg"),
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        })
                    });
                    marker.on('popupopen', () => {
                        GATracker.instance.send('map location', 'click', mapLocationTypeToGALabel(mapLocType));
                    });
                    return marker
                };
            default:
                return (loc: Location) => L.marker(loc);

            // icon: L.divIcon({
            //         html: LeafletMap.generateMapLocationMarkup("", "/images/modeicons/ondark/ic-bicycle-share-24px.svg"),
            //         className: "circleMarker bikePodMarker",
            //         iconSize: [24, 24],
            //         iconAnchor: [12, 24]
            //     }
            // )
        }
    }

    private refreshMapLocations() {
        const enabledMapLayers = OptionsData.instance.get().mapLayers;
        let showAny = false;
        for (const mapLocType of this.getMapLocLayers()) {
            // TODO: distinguish level of displayed locations and just remove the proper level.
            const showLocType = this.mapLocsEnabled && this.map.getZoom() >= this.ZOOM_ALL_LOCATIONS
                && enabledMapLayers.indexOf(mapLocType) !== -1;
            this.mapLayers.get(mapLocType)!.setShow(showLocType);
            showAny = showAny || showLocType;
        }
        if (showAny) { // TODO: replace by requesting just modes that correspond to selected location types.
            LocationsData.instance.requestLocations("AU_ACT_Canberra", 1);
            if (this.map.getZoom() >= this.ZOOM_ALL_LOCATIONS) {
                LocationsData.instance.requestLocations("AU_ACT_Canberra", 2, LeafletUtil.toBBox(this.map.getBounds()));
            }
        }
    }

    private onLocationsChanged(locResult: LocationsResult) {
        if (this.map.getZoom() < this.ZOOM_PARENT_LOCATIONS || (this.map.getZoom() < this.ZOOM_ALL_LOCATIONS && locResult.level === 2)) {
            return;
        }
        const enabledMapLayers = OptionsData.instance.get().mapLayers;
        if (locResult.bikePods && enabledMapLayers.indexOf(MapLocationType.BIKE_POD) !== -1) {
            this.mapLayers.get(MapLocationType.BIKE_POD)!.addValues(locResult.bikePods);
        }
        if (locResult.facilities && enabledMapLayers.indexOf(MapLocationType.MY_WAY_FACILITY) !== -1) {
            this.mapLayers.get(MapLocationType.MY_WAY_FACILITY)!
                .addValues(locResult.facilities.filter((facility: FacilityLocation) => facility.facilityType.toLowerCase() === "myway-retail-agent"));
        }
        if (locResult.facilities && enabledMapLayers.indexOf(MapLocationType.PARK_AND_RIDE_FACILITY) !== -1) {
            this.mapLayers.get(MapLocationType.PARK_AND_RIDE_FACILITY)!
                .addValues(locResult.facilities.filter((facility: FacilityLocation) => facility.facilityType.toLowerCase() === "park-and-ride"));
        }
    }

    public setMapLocsEnabled(enabled: boolean) {
        this.mapLocsEnabled = enabled;
        this.refreshMapLocations();
    }

    public getCenter(): LatLng {
        const center = this.map.getCenter();
        console.log(center);
        return LatLng.createLatLng(center.lat, center.lng);
    }

    public setCenter(center: LatLng) {
        this.map.panTo(center);
    }

    public setZoom(zoom: number) {
        this.map.setZoom(zoom);
    }

    public fitBounds(bounds: BBox) {
        const options = {padding: [20, 20]} as FitBoundsOptions;
        this.map.fitBounds(L.latLngBounds([bounds.sw, bounds.ne]), options);
    }

    public alreadyFits(bounds: BBox): boolean {
        return this.map.getBounds().contains(LeafletUtil.fromBBox(bounds));
    }

    public getBounds(): BBox {
        return LeafletUtil.toBBox(this.map.getBounds());
    }

    public panInsideBounds(bounds: BBox) {
        this.map.panInsideBounds(L.latLngBounds([bounds.sw, bounds.ne]));
    }

    public setFrom(from: Location | null) {
        if (LocationUtil.equal(from, this.from)) {
            return;
        }
        this.from = from;
        if (this.fromMarker !== null) {
            this.map.removeLayer(this.fromMarker);
        }
        if (from !== null && from.isResolved()) {
            this.fromMarker = L.marker(from, {
                icon: L.icon({
                    iconUrl: Constants.absUrl("/images/map/ic-map-pin-from.svg"),
                    iconSize: [35, 35],
                    iconAnchor: [17, 35],
                    className: "LeafletMap-pinFrom"
                }),
                draggable: true,
                riseOnHover: true
            });
            this.fromMarker.on('dragend', (e: any) => {
                if (this.dragEndHandler) {
                    const latLng = e.target.getLatLng();
                    this.dragEndHandler(true, LatLng.createLatLng(latLng.lat, latLng.lng));
                }
            });
            this.fromMarker.addTo(this.map);
        }
    }

    public setTo(to: Location | null) {
        if (LocationUtil.equal(to, this.to)) {
            return;
        }
        this.to = to;
        if (this.toMarker !== null) {
            this.map.removeLayer(this.toMarker);
        }
        if (to !== null && to.isResolved()) {
            this.toMarker = L.marker(to, {
                icon: L.icon({
                    iconUrl: Constants.absUrl("/images/map/ic-map-pin.svg"),
                    iconSize: [35, 35],
                    iconAnchor: [17, 35],
                    className: "LeafletMap-pinTo"
                }),
                draggable: true,
                riseOnHover: true
            });
            this.toMarker.on('dragend', (e: any) => {
                if (this.dragEndHandler) {
                    const latLng = e.target.getLatLng();
                    this.dragEndHandler(false, LatLng.createLatLng(latLng.lat, latLng.lng));
                }
            });
            this.toMarker.addTo(this.map);
        }
    }

    public setDragEndHandler(handler: ((from: boolean, latLng: LatLng) => void) | null) {
        this.dragEndHandler = handler;
    }

    /**
     * prevent calling click handler for the second click of a double click.
     */
    public addClickHandler(handler: (latLng: LatLng) => void) {
        this.map.on('click', (e: any) => {
            setTimeout(() => {
                if (this.wasDoubleClick) {
                    this.wasDoubleClick = false;
                    return;
                }
                handler(LatLng.createLatLng(e.latlng.lat, e.latlng.lng));
            }, 50);
        });
    }

    public showTrip(trip: Trip | null) {
        if (trip === this.trip) {
            return;
        }
        if (this.trip !== null) {
            for (const segPoly of this.segmentPolylines) {
                segPoly.removeFromMap();
            }
            this.segmentPolylines = [];
        }
        if (trip !== null) {
            for (const segment of trip.segments) {
                this.showSegment(segment);
            }
            const last: Segment = trip.segments[trip.segments.length - 1];
            const arrival = Util.iAssign(last, {});
            arrival.arrival = true;
            arrival.from = last.to;
            arrival.action = "Arrive";
            this.showSegment(arrival)
        }
    }

    public static generatePinSVGMarkup(segment: Segment): string {
        if (segment.arrival) {
            return renderToStaticMarkup(
                <SegmentPinIcon transIcon={Constants.absUrl("/images/map/ic-arrive-flag.svg")} color={"black"} onDark={true}/>
            )
        }
        const modeInfo = segment.modeInfo!;
        // On dark background if there is a suitable remote icon for dark background, or there is not
        // remote icon for light background, so will use a local icon for dark background.
        const onDark = modeInfo.remoteDarkIcon !== null || modeInfo.remoteIcon === null;
        const transIconUrl = TransportUtil.getTransportIcon(modeInfo, !!segment.realTime, onDark);
        return renderToStaticMarkup(
            <SegmentPinIcon transIcon={transIconUrl} color={segment.getColor()} onDark={onDark}/>
        )
    }

    public static generateServiceStopSVGMarkup(color: string, opacity: number): string {
        return renderToStaticMarkup(
            <IconServiceStop style={{color: color, opacity: opacity}}/>
        )
    }

    public static generateMapLocationMarkup(className: string, icon: any): string {
        return renderToStaticMarkup(
            <div className={className}>
                <img src={icon}/>
            </div>
        )
    }

    public static createDivWithId(id: string): string {
        return "<div id='" + id + "'/>"
    }

    public static renderServiceStopPopup(stop: ServiceStopLocation, containerId: string, color: string, interchangeUrl?: string) {
        ReactDOM.render(
            <ServiceStopPopup stop={stop} color={color}/>,
            document.getElementById(containerId)
        );
    }

    public static renderSegmentPopup(segment: Segment, containerId: string) {
        ReactDOM.render(
            <SegmentPopup segment={segment}/>,
            document.getElementById(containerId)
        );
    }

    public static generateMapLocationPopupMarkup(loc: Location): string {
        return renderToStaticMarkup(
            <MapLocationPopup value={loc}/>
        )
    }

    public showSegment(segment: Segment) {
        const segmentPolyline = new SegmentPolyline(segment, false,
            (segment.isFirst(Visibility.IN_SUMMARY) || segment.arrival) && this.dragEndHandler ?
                (latLng: LatLng) => this.dragEndHandler!(segment.isFirst(Visibility.IN_SUMMARY), latLng) : undefined);
        segmentPolyline.addTo(this.map);
        this.segmentPolylines.push(segmentPolyline);
    }

    public onResize() {
        this.map.invalidateSize();
    }
}

export default LeafletMap;