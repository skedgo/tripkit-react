import BBox from "../model/BBox";
import Trip from "../model/trip/Trip";
import LeafletUtil from "./LeafletUtil";
import ServiceShape from "../model/trip/ServiceShape";
import LatLng from "../model/LatLng";
import {TKUIMapPadding} from "../map/TKUIMapView";
import Street from "../model/trip/Street";

class MapUtil {

    public static sydneyCoords = LatLng.createLatLng(-33.8674899,151.2048442);
    public static worldCoords = LatLng.createLatLng(0,0);

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

    public static expand(bounds: BBox, factor: number): BBox {
        const sw = bounds.sw;
        const ne = bounds.ne;
        const expandedSW = LatLng.createLatLng(sw.lat - (ne.lat - sw.lat) * factor / 2,
            sw.lng - (ne.lng - sw.lng) * factor / 2);
        const expandedNE = LatLng.createLatLng(ne.lat + (ne.lat - sw.lat) * factor / 2,
            ne.lng + (ne.lng - sw.lng) * factor / 2);
        return BBox.createBBox(expandedNE, expandedSW);
    }

    public static getTripBounds(trip: Trip): BBox {
        return LeafletUtil.toBBox(LeafletUtil.getTripBounds(trip));
    }

    public static getStreetBounds(streets: Street[]): BBox {
        return LeafletUtil.toBBox(LeafletUtil.getStreetBounds(streets));
    }

    public static getShapesBounds(shapes: ServiceShape[], travelledOnly: boolean = false): BBox {
        return LeafletUtil.toBBox(LeafletUtil.getShapesBounds(shapes, travelledOnly));
    }

    public static toDegrees(radians: number) {
        return radians * 180 / Math.PI;
    }

    public static expandBoundsByPercent(bounds: BBox, left: number, right: number, top: number, bottom: number): BBox {
        const westLong = bounds.sw.lng;
        const eastLong = bounds.ne.lng;
        const northLat = bounds.ne.lat;
        const southLat = bounds.sw.lat;
        const angle = (eastLong - westLong) >= 0 ? 1 : -1;
        let diffLong = eastLong - westLong;
        if (angle < 0)
            diffLong += 360;
        const diffLat = southLat - northLat;
        const newWestLong = westLong - (diffLong * left)/100;
        const newEastLong = eastLong + (diffLong * right)/100;
        const newNorthLat = northLat - (diffLat * top)/100;
        const newSouthLat = southLat + (diffLat * bottom)/100;
        return BBox.createBBox(LatLng.createLatLng(newNorthLat, newEastLong), LatLng.createLatLng(newSouthLat, newWestLong));
    }

    public static alreadyFits(currentBounds: BBox, padding: TKUIMapPadding, bounds: BBox, mapWidth: number, mapHeight: number): boolean {
        Object.assign({left: 0, right: 0, bottom: 0, top: 0}, padding);
        const leftMargin = padding.left!;
        const rightMargin = padding.right!;
        const topMargin = padding.top!;
        const bottomMargin = padding.bottom!;

        const currVisibleBoundsHeight = mapHeight;
        const currVisibleBoundsWidth = mapWidth;
        const leftReductionPCT = leftMargin === 0 ? 0 : leftMargin / Math.max(currVisibleBoundsWidth, 30) * 100;
        const rightReductionPCT = rightMargin === 0 ? 0 : rightMargin / Math.max(currVisibleBoundsWidth, 30) * 100;
        const topReductionPCT = topMargin === 0 ? 0 : topMargin / Math.max(currVisibleBoundsHeight, 30) * 100;
        const bottomReductionPCT = bottomMargin == 0 ? 0 : (bottomMargin) / Math.max(currVisibleBoundsHeight, 30) * 100;
        const reducedBounds = this.expandBoundsByPercent(currentBounds, -leftReductionPCT, -rightReductionPCT, -topReductionPCT, -bottomReductionPCT);
        // const alreadyFits = GWTLatLngBounds.createFromHasLatLngBounds(currentBounds).resize(.8).toLatLngBounds().contains(bounds.getNorthEast()) && reducedBounds.contains(bounds.getSouthWest()) &&
        //     reducedBounds.contains(bounds.getNorthEast()) && reducedBounds.contains(bounds.getSouthWest());
        const reducedLatLngBounds = LeafletUtil.fromBBox(reducedBounds);
        const alreadyFits =
            // LeafletUtil.fromBBox(currentBounds).contains(LeafletUtil.fromLatLng(bounds.ne)) &&
            reducedLatLngBounds.contains(LeafletUtil.fromLatLng(bounds.sw)) &&
            reducedLatLngBounds.contains(LeafletUtil.fromLatLng(bounds.ne));
        return alreadyFits
    }

}

export default MapUtil;