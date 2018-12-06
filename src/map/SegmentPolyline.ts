import Segment from "../model/trip/Segment";
import L, {Marker} from "leaflet";
import LeafletMap from "./MboxMap";
import StopLocation from "../model/StopLocation";
import StopsData from "../data/StopsData";
import LatLng from "../model/LatLng";
import {Visibility} from "../model/trip/SegmentTemplate";

class SegmentPolyline {

    private segment: Segment;
    private showNotTravelled: boolean;
    private dragEndHandler?: (latLng: LatLng) => void;
    private polylines: L.Polyline[] = [];
    private stops: L.Marker[] = [];
    private pin: Marker;
    private map: L.Map | null = null;

    constructor(segment: Segment, showNotTravelled = false, dragEndHandler?: (latLng: LatLng) => void) {
        this.segment = segment;
        this.showNotTravelled = showNotTravelled;
        this.dragEndHandler = dragEndHandler;
        if (segment.shapes !== null) {
            this.createServiceShapes()
        } else if (segment.streets !== null) {
            this.createStreets();
        }
        this.createPin(segment);
    }

    private createServiceShapes() {
        const shapes = this.segment.shapes;
        for (const shape of shapes!) {
            if (!this.showNotTravelled && !shape.travelled) {
                continue;
            }
            const options = {
                weight: 6,
                color: shape.travelled ? this.segment.getColor() : "grey",
                opacity: shape.travelled ? 1 : .5
            };
            this.polylines.push(L.polyline(shape.waypoints!, options));
            let stops = shape.stops;
            if (stops != null) {
                stops = stops.slice(1, this.stops.length - 1);
                for (const stop of stops) {
                    const stopIcon = L.divIcon({
                        html: LeafletMap.generateServiceStopSVGMarkup(shape.travelled ?
                            this.segment.getColor() : "grey", shape.travelled ? 1 : .5),
                        className: "SegmentPolyline-stop"
                    });
                    const stopOptions = {
                        icon: stopIcon
                    };
                    const marker = L.marker(stop, stopOptions);
                    this.stops.push(marker);
                    const containerId = "serviceStop-" + stop.code;
                    marker.bindPopup(LeafletMap.createDivWithId(containerId), {
                        minWidth: 213,
                        closeButton: false,
                        className: "ServiceStopPopup-popup"
                    });
                    marker.on('popupopen', (popup) => {
                        LeafletMap.renderServiceStopPopup(stop, containerId, this.segment.getColor());
                        StopsData.instance.getStopFromCode("AU_ACT_Canberra", stop.code)
                            .then((stopLocation: StopLocation) => {
                                    if (stopLocation.url !== null) {
                                        LeafletMap.renderServiceStopPopup(stop, containerId, this.segment.getColor(), stopLocation.url)
                                    }
                                }
                            )
                    });
                }
            }
        }
    }

    private createStreets() {
        const streets = this.segment.streets;
        for (const street of streets!) {
            const options = {
                weight: 6,
                color: this.segment.getColor(),
                dashArray: this.segment.isWalking() ? "5,10" : undefined,
                // opacity: !this.segment.isBicycle() || street.safe ? 1 : .3
                opacity: 1  // Disable safe distinction for now
            };
            this.polylines.push(L.polyline(street.waypoints!, options));
        }
    }

    private createPin(segment: Segment) {
        const transIconHTML = LeafletMap.generatePinSVGMarkup(segment);
        const icon = L.divIcon({
            html: transIconHTML,
            className: "SegmentPinIcon-parent" + (segment.isFirst(Visibility.IN_SUMMARY)? " firstSegment" : (segment.arrival ? " arriveSegment" : "")),
            iconSize: [35, 35],
            iconAnchor: [17, 35]
        });
        this.pin = L.marker(segment.from, {icon: icon, draggable: this.dragEndHandler !== undefined, riseOnHover: segment.isFirst(Visibility.IN_SUMMARY)});
        if (this.dragEndHandler !== undefined) {
            this.pin.on('dragend', (e: any) => {
                const latLng = e.target.getLatLng();
                this.dragEndHandler!(LatLng.createLatLng(latLng.lat, latLng.lng));
            });
        }
        this.createSegmentPopup(segment, this.pin);
    }

    private createSegmentPopup(segment: Segment, marker: Marker) {
        const containerId = "segmentPopup-" + segment.getKey();
        marker.bindPopup(LeafletMap.createDivWithId(containerId), {
            minWidth: 200,
            closeButton: false,
            className: "ServiceStopPopup-popup",
            offset: [0, -25]
        });
        marker.on('popupopen', (popup) => {
            LeafletMap.renderSegmentPopup(this.segment, containerId);
            if (segment.isPT() && segment.stopCode !== null) {
                StopsData.instance.getStopFromCode("AU_ACT_Canberra", segment.stopCode!)
                    .then((stopLocation: StopLocation) => {
                        this.segment.stop = stopLocation;
                        LeafletMap.renderSegmentPopup(this.segment, containerId);
                    });
            }
        });
    }

    public addTo(map: L.Map) {
        this.map = map;
        for (const polyline of this.polylines) {
            polyline.addTo(map);
        }
        for (const stop of this.stops) {
            stop.addTo(map);
        }
        this.pin.addTo(this.map);
    }

    public removeFromMap() {
        if (this.map !== null) {
            for (const polyline of this.polylines) {
                this.map.removeLayer(polyline);
            }
            for (const stop of this.stops) {
                this.map.removeLayer(stop);
            }
            this.map.removeLayer(this.pin);
        }
    }

}

export default SegmentPolyline;