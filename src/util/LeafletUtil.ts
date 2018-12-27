import {LatLng as LLatLng, LatLngBounds} from "leaflet";
import BBox from "../model/BBox";
import LatLng from "../model/LatLng";
import L from "leaflet";
import Segment from "../model/trip/Segment";
import Trip from "../model/trip/Trip";

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
        const bounds = L.latLngBounds([]);
        bounds.extend(segment.from).extend(segment.to);
        if (segment.streets) {
            for (const street of segment.streets) {
                if (street.waypoints) {
                    for (const waypoint of street.waypoints) {
                        bounds.extend(waypoint);
                    }
                }
            }
        }
        if (segment.shapes) {
            for (const shape of segment.shapes) {
                if (shape.travelled && shape.waypoints) {
                    for (const waypoint of shape.waypoints) {
                        bounds.extend(waypoint);
                    }
                }
            }
        }
        return bounds;
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

}

export default LeafletUtil;