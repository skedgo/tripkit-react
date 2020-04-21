import BBox from "../model/BBox";
import Trip from "../model/trip/Trip";
import ServiceShape from "../model/trip/ServiceShape";
import LatLng from "../model/LatLng";
import { TKUIMapPadding } from "../map/TKUIMapView";
declare class MapUtil {
    static sydneyCoords: LatLng;
    static worldCoords: LatLng;
    static cellsForBounds(bounds: BBox, cellsPerDegree: number): string[];
    private static degreeToCellCoordinate;
    static expand(bounds: BBox, factor: number): BBox;
    static getTripBounds(trip: Trip): BBox;
    static getShapesBounds(shapes: ServiceShape[], travelledOnly?: boolean): BBox;
    static toDegrees(radians: number): number;
    static movePointInPixels(latlng: LatLng, offsetX: number, offsetY: number, width: number, height: number, bounds: BBox): LatLng;
    static expandBoundsByPercent(bounds: BBox, left: number, right: number, top: number, bottom: number): BBox;
    static alreadyFits(currentBounds: BBox, padding: TKUIMapPadding, bounds: BBox, mapWidth: number, mapHeight: number): boolean;
}
export default MapUtil;
