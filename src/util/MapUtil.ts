import BBox from "../model/BBox";
import Trip from "../model/trip/Trip";
import ServiceShape from "../model/trip/ServiceShape";
import LatLng from "../model/LatLng";
import { TKUIMapPadding } from "../map/TKUIMapView";
import Street from "../model/trip/Street";
import Segment from "../model/trip/Segment";
import inside from "point-in-polygon";
import polyline from "@mapbox/polyline";
import { lineString, point, BBox as TurfBBox } from "@turf/helpers";
import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { Feature, FeatureCollection, MultiPolygon, Position } from "geojson";
import { LatLngExpression } from "leaflet";

class MapUtil {

    public static sydneyCoords = LatLng.createLatLng(-33.8674899, 151.2048442);
    public static worldCoords = LatLng.createLatLng(0, 0);

    public static toLatLng(llatLng: any): LatLng {      // public static toLatLng(llatLng: LLatLng): LatLng {
        return LatLng.createLatLng(llatLng.lat, llatLng.lng);
    }

    public static createBBoxArray(latLngs: LatLng[]): BBox {
        const turfbbox = bbox(lineString(latLngs.map(latLng => [latLng.lng, latLng.lat])));
        const [minX, minY, maxX, maxY] = turfbbox;
        return BBox.createBBox(LatLng.createLatLng(maxY, maxX), LatLng.createLatLng(minY, minX));
    }

    public static createBBoxGeoJson(geojson: any): BBox {
        const turfbbox = bbox(geojson);
        const [minX, minY, maxX, maxY] = turfbbox;
        return BBox.createBBox(LatLng.createLatLng(maxY, maxX), LatLng.createLatLng(minY, minX));
    }

    public static inBBox(latLng: LatLng, bounds: BBox): boolean {
        const turfPoint = point([latLng.lng, latLng.lat]);
        const turfpolygon = bboxPolygon(bbox(lineString([[bounds.minLng, bounds.minLat], [bounds.maxLng, bounds.maxLat]])));
        return booleanPointInPolygon(turfPoint, turfpolygon);
    }

    public static getTripBounds(trip: Trip): BBox {
        const tripCoords = trip.segments.reduce((points, segment) => {
            const segmentBBox = this.getSegmentBounds(segment);
            points.push(segmentBBox.sw, segmentBBox.ne);
            return points;
        }, [] as LatLng[]);
        return this.boundsFromLatLngArray(tripCoords);
    }

    public static getSegmentBounds(segment: Segment): BBox {
        let coords;
        if (segment.streets) {
            const streetBounds = this.getStreetBounds(segment.streets);
            coords = [streetBounds.sw, streetBounds.ne];
        } else if (segment.shapes) {
            const shapeBounds = this.getShapesBounds(segment.shapes, true);
            coords = [shapeBounds.sw, shapeBounds.ne];
        } else {
            coords = [];
        }
        coords.push(segment.from);
        coords.push(segment.to);
        return this.boundsFromLatLngArray(coords);
    }

    public static getStreetBounds(streets: Street[]): BBox {
        const streetPoints = streets.reduce((waypoints: LatLng[], street: Street) => {
            if (street.waypoints) {
                waypoints = waypoints.concat(street.waypoints);
            }
            return waypoints;
        }, []);
        return this.boundsFromLatLngArray(streetPoints);
    }

    public static getShapesBounds(shapes: ServiceShape[], travelledOnly: boolean = false): BBox {
        const shapesPoints = shapes.reduce((waypoints: LatLng[], shape: ServiceShape) => {
            if (shape.waypoints && (!travelledOnly || shape.travelled)) {
                waypoints = waypoints.concat(shape.waypoints);
            }
            return waypoints;
        }, []);
        return this.boundsFromLatLngArray(shapesPoints);
    }

    private static turfBBoxToBBox(turfBBox: TurfBBox): BBox {
        const [minX, minY, maxX, maxY] = turfBBox;
        return BBox.createBBox(LatLng.createLatLng(maxY, maxX), LatLng.createLatLng(minY, minX));
    }

    public static boundsFromLatLngArray(latLngArray: LatLng[]): BBox {
        if (latLngArray.length === 1) {
            return BBox.createBBox(latLngArray[0], latLngArray[0]);
        }
        return this.turfBBoxToBBox(bbox(lineString(latLngArray.map(latLng => [latLng.lng, latLng.lat]))))
    }

    public static decodePolylineGeoJson(encoded: string): number[][] {
        // switch to [Long, Lat] order used by GeoJson
        return polyline.decode(encoded).map(coord => [coord[1], coord[0]]);
    }

    public static decodePolyline(encoded: string): LatLng[] {
        const pointsArray = this.decodePolylineGeoJson(encoded);
        const decoded: LatLng[] = [];
        for (const point of pointsArray) {
            decoded.push(LatLng.createLatLng(point[1], point[0]));
        }
        return decoded;
    }

    public static decodePolylineGeoJsonMultiPolygon(encoded: string): MultiPolygon {
        const decoded = MapUtil.decodePolylineGeoJson(encoded);
        if (JSON.stringify(decoded[0]) !== JSON.stringify(decoded[decoded.length - 1])) {
            decoded.push(decoded[0]);
        }
        return {
            type: "MultiPolygon",
            coordinates: [[decoded]]
        };
    }

    public static pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
        return inside([point.lat, point.lng], polygon.map((polyPoint: LatLng) => [polyPoint.lat, polyPoint.lng]));
    }

    public static cellsForBounds(bounds: BBox, cellsPerDegree: number): string[] {
        const result: string[] = [];
        const minCellLat = this.degreeToCellCoordinate(bounds.sw.lat, cellsPerDegree);
        const maxCellLat = this.degreeToCellCoordinate(bounds.ne.lat, cellsPerDegree);
        let minCellLong = this.degreeToCellCoordinate(bounds.sw.lng, cellsPerDegree);
        let maxCellLong = this.degreeToCellCoordinate(bounds.ne.lng, cellsPerDegree);

        const offset = this.degreeToCellCoordinate(360, cellsPerDegree);
        const minLong = Math.trunc(offset / 2 * -1);
        const maxLong = Math.trunc(offset / 2 - 1);
        if (maxCellLong < minCellLong) {
            maxCellLong += offset;
        } else {
            maxCellLong = Math.min(maxLong, maxCellLong);
        }
        minCellLong = Math.max(minLong, minCellLong);

        for (let cellLat = minCellLat; cellLat <= maxCellLat; cellLat++) {
            for (let cellLong = minCellLong; cellLong <= maxCellLong; cellLong++) {
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
        const newWestLong = westLong - (diffLong * left) / 100;
        const newEastLong = eastLong + (diffLong * right) / 100;
        const newNorthLat = northLat - (diffLat * top) / 100;
        const newSouthLat = southLat + (diffLat * bottom) / 100;
        return BBox.createBBox(LatLng.createLatLng(newNorthLat, newEastLong), LatLng.createLatLng(newSouthLat, newWestLong));
    }

    public static alreadyFits(currentBounds: BBox, padding: TKUIMapPadding, bounds: BBox, mapWidth: number, mapHeight: number): boolean {
        Object.assign({ left: 0, right: 0, bottom: 0, top: 0 }, padding);
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
        const alreadyFits = this.inBBox(bounds.sw, reducedBounds) && this.inBBox(bounds.ne, reducedBounds)
        return alreadyFits
    }

    public static latLngsToGeoJSONFeature(latLngs: LatLng[]): Feature {
        return ({
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": latLngs.map(latLng => [latLng.lng, latLng.lat])
            },
            "properties": {}
        })
    }

    public static featuresToCollection(features: Feature[]): FeatureCollection {
        return ({
            "type": "FeatureCollection",
            "features": features
        });
    }

    public static toLeafletMultiPolygon(geoJson: MultiPolygon): LatLngExpression[][][] {
        return geoJson.coordinates
            .map((polygons: Position[][]) => polygons
                .map((positions: Position[]) => positions
                    .map((position: Position) => [position[1], position[0]])));
    }

}

export default MapUtil;