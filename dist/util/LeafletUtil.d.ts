import { LatLng as LLatLng, LatLngBounds } from "leaflet";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import Segment from "../model/trip/Segment";
import Trip from "../model/trip/Trip";
import ServiceShape from "../model/trip/ServiceShape";
import Street from "../model/trip/Street";
declare class LeafletUtil {
    static toLatLng(llatLng: LLatLng): LatLng;
    static fromLatLng(latLng: LatLng): LLatLng;
    static toBBox(bounds: LatLngBounds): BBox;
    static fromBBox(bbox: BBox): LatLngBounds;
    static getTripBounds(trip: Trip): LatLngBounds;
    static getSegmentBounds(segment: Segment): LatLngBounds;
    static getStreetBounds(streets: Street[]): LatLngBounds;
    static getShapesBounds(shapes: ServiceShape[], travelledOnly?: boolean): LatLngBounds;
    static boundsFromLatLngArray(latLngArray: LatLng[]): LatLngBounds;
    static decodePolyline(encoded: string): LatLng[];
    static pointInPolygon(point: LatLng, polygon: LatLng[]): boolean;
}
export default LeafletUtil;
