import BBox from "../model/BBox";
import Trip from "../model/trip/Trip";
declare class MapUtil {
    static cellsForBounds(bounds: BBox, cellsPerDegree: number): string[];
    private static degreeToCellCoordinate;
    static getTripBounds(trip: Trip): BBox;
    static toDegrees(radians: number): number;
}
export default MapUtil;
