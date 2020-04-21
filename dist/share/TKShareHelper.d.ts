import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import Segment from "../model/trip/Segment";
import Location from "../model/Location";
import ServiceDeparture from "../model/service/ServiceDeparture";
import RoutingQuery from "../model/RoutingQuery";
import LatLng from "../model/LatLng";
import TKTransportOptions from "../model/options/TKTransportOptions";
declare class TKShareHelper {
    static isSharedTripLink(): boolean;
    static isSharedArrivalLink(): boolean;
    static isSharedStopLink(): boolean;
    static isSharedServiceLink(): boolean;
    static isSharedQueryLink(): boolean;
    static getShareArrival(trip: Trip): string;
    static getShareSegmentArrival(segment: Segment): string;
    static getShareLocation(location: Location): string;
    static getShareTimetable(stop: StopLocation): string;
    static getShareService(service: ServiceDeparture): string;
    static getShareQuery(query: RoutingQuery, plannerUrl?: string): string;
    static parseSharedQueryLink(): RoutingQuery | undefined;
    static parseTransportsQueryParam(): TKTransportOptions | undefined;
    static parseViewport(): {
        center: LatLng;
        zoom: number;
    } | undefined;
    static resetToHome(): void;
}
export default TKShareHelper;
