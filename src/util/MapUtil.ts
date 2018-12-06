import BBox from "../model/BBox";
import Trip from "../model/trip/Trip";
import LeafletUtil from "./LeafletUtil";

class MapUtil {

    public static cellsForBounds(bounds: BBox, cellsPerDegree: number): string[] {
        const result: string[] = [];
        const minCellLat = this.degreeToCellCoordinate(bounds.sw.lat, cellsPerDegree);
        const maxCellLat = this.degreeToCellCoordinate(bounds.ne.lat, cellsPerDegree);
        let minCellLong = this.degreeToCellCoordinate(bounds.sw.lng, cellsPerDegree);
        let maxCellLong = this.degreeToCellCoordinate(bounds.ne.lng, cellsPerDegree);

        const offset = this.degreeToCellCoordinate(360, cellsPerDegree);
        const minLong = Math.trunc(offset/2*-1);
        const maxLong = Math.trunc(offset/2-1);
        if (maxCellLong < minCellLong) {
            maxCellLong += offset;
        } else {
            maxCellLong = Math.min(maxLong, maxCellLong);
        }
        minCellLong = Math.max(minLong, minCellLong);

        for (let cellLat = minCellLat ; cellLat <= maxCellLat ; cellLat++) {
            for (let cellLong = minCellLong ; cellLong <= maxCellLong ; cellLong++) {
                if (cellLong > offset) {
                    cellLong -= offset;
                }
                result.push(cellLat + "#" + cellLong);
            }
        }
        return result;
    }

    private static degreeToCellCoordinate(coordInDegrees: number, cellsPerDegree: number): number {
        const x = coordInDegrees * cellsPerDegree;
        return Math.trunc(x < 0 ? x - 1 : x);
    }

    public static getTripBounds(trip: Trip): BBox {
        return LeafletUtil.toBBox(LeafletUtil.getTripBounds(trip));
    }

}

export default MapUtil;