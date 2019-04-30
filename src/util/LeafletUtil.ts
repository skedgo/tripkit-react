import {LatLng as LLatLng, LatLngBounds} from "leaflet";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import L from "leaflet";
import Segment from "../model/trip/Segment";
import Trip from "../model/trip/Trip";
import inside from "point-in-polygon";
import ServiceShape from "../model/trip/ServiceShape";
import Street from "../model/trip/Street";

class LeafletUtil {

    public static toLatLng(llatLng: LLatLng): LatLng {
        return LatLng.createLatLng(llatLng.lat, llatLng.lng);
    }

    public static fromLatLng(latLng: LatLng): LLatLng {
        return new LLatLng(latLng.lat, latLng.lng);
    }

    public static toBBox(bounds: LatLngBounds) {
        return BBox.createBBoxArray([this.toLatLng(bounds.getNorthEast()), this.toLatLng(bounds.getSouthWest())]);
    }

    public static fromBBox(bbox: BBox): LatLngBounds {
        return L.latLngBounds(this.fromLatLng(bbox.sw), this.fromLatLng(bbox.ne));
    }

    public static getTripBounds(trip: Trip): LatLngBounds {
        const bounds = L.latLngBounds([]);
        for (const segment of trip.segments) {
            const segmentBounds = this.getSegmentBounds(segment);
            bounds.extend(segmentBounds.getNorthEast())
                .extend(segmentBounds.getSouthWest());
        }
        return bounds;
    }

    public static getSegmentBounds(segment: Segment): LatLngBounds {
        let bounds;
        if (segment.streets) {
            bounds = this.getStreetBounds(segment.streets);
        } else if (segment.shapes) {
            bounds = this.getShapesBounds(segment.shapes, true);
        } else {
            bounds = L.latLngBounds([]);
        }
        return bounds.extend(segment.from).extend(segment.to);
    }

    public static getStreetBounds(streets: Street[]): LatLngBounds {
        const allWaypoints = streets.reduce((waypoints: LatLng[], street: Street) => {
            if (street.waypoints) {
                waypoints = waypoints.concat(street.waypoints);
            }
            return waypoints;
        }, []);
        return this.boundsFromLatLngArray(allWaypoints);
    }

    public static getShapesBounds(shapes: ServiceShape[], travelledOnly: boolean = false): LatLngBounds {
        const allWaypoints = shapes.reduce((waypoints: LatLng[], shape: ServiceShape) => {
            if (shape.waypoints && (!travelledOnly || shape.travelled)) {
                waypoints = waypoints.concat(shape.waypoints);
            }
            return waypoints;
        }, []);
        return this.boundsFromLatLngArray(allWaypoints);
    }

    public static boundsFromLatLngArray(latLngArray: LatLng[]): LatLngBounds {
        return latLngArray.reduce((bounds: LatLngBounds, latLng: LatLng) => {
            return bounds.extend(latLng);
        }, L.latLngBounds([]));
    }

    public static decodePolyline(encoded: string): LatLng[] {
        const polyline = require('@mapbox/polyline');
        const pointsArray = polyline.decode(encoded);
        const decoded: LatLng[] = [];
        for (const point of pointsArray) {
            decoded.push(LatLng.createLatLng(point[0], point[1]));
        }
        return decoded;
    }

    public static pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
        return inside([point.lat, point.lng], polygon.map((polyPoint: LatLng) => [polyPoint.lat, polyPoint.lng]));
    }

}

export default LeafletUtil;