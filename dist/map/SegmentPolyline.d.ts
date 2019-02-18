import Segment from "../model/trip/Segment";
import L from "leaflet";
import LatLng from "../model/LatLng";
declare class SegmentPolyline {
    private segment;
    private showNotTravelled;
    private dragEndHandler?;
    private polylines;
    private stops;
    private pin;
    private map;
    constructor(segment: Segment, showNotTravelled?: boolean, dragEndHandler?: (latLng: LatLng) => void);
    private createServiceShapes;
    private createStreets;
    private createPin;
    private createSegmentPopup;
    addTo(map: L.Map): void;
    removeFromMap(): void;
}
export default SegmentPolyline;
