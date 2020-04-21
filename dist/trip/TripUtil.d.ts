import Trip from "../model/trip/Trip";
import ServiceDeparture from "../model/service/ServiceDeparture";
import Segment from "../model/trip/Segment";
declare class TripUtil {
    static getTripTimeData(trip: Trip, brief?: boolean): {
        departureTime: string;
        arrivalTime: string;
        duration: string;
        hasPT: boolean;
    };
    static sameService(altSegment: Segment, service: ServiceDeparture): boolean;
}
export default TripUtil;
