import LeafletUtil from "./LeafletUtil";
var MapUtil = /** @class */ (function () {
    function MapUtil() {
    }
    MapUtil.cellsForBounds = function (bounds, cellsPerDegree) {
        var result = [];
        var minCellLat = this.degreeToCellCoordinate(bounds.sw.lat, cellsPerDegree);
        var maxCellLat = this.degreeToCellCoordinate(bounds.ne.lat, cellsPerDegree);
        var minCellLong = this.degreeToCellCoordinate(bounds.sw.lng, cellsPerDegree);
        var maxCellLong = this.degreeToCellCoordinate(bounds.ne.lng, cellsPerDegree);
        var offset = this.degreeToCellCoordinate(360, cellsPerDegree);
        var minLong = Math.trunc(offset / 2 * -1);
        var maxLong = Math.trunc(offset / 2 - 1);
        if (maxCellLong < minCellLong) {
            maxCellLong += offset;
        }
        else {
            maxCellLong = Math.min(maxLong, maxCellLong);
        }
        minCellLong = Math.max(minLong, minCellLong);
        for (var cellLat = minCellLat; cellLat <= maxCellLat; cellLat++) {
            for (var cellLong = minCellLong; cellLong <= maxCellLong; cellLong++) {
                if (cellLong > offset) {
                    cellLong -= offset;
                }
                result.push(cellLat + "#" + cellLong);
            }
        }
        return result;
    };
    MapUtil.degreeToCellCoordinate = function (coordInDegrees, cellsPerDegree) {
        var x = coordInDegrees * cellsPerDegree;
        return Math.trunc(x < 0 ? x - 1 : x);
    };
    MapUtil.getTripBounds = function (trip) {
        return LeafletUtil.toBBox(LeafletUtil.getTripBounds(trip));
    };
    MapUtil.toDegrees = function (radians) {
        return radians * 180 / Math.PI;
    };
    ;
    return MapUtil;
}());
export default MapUtil;
//# sourceMappingURL=MapUtil.js.map