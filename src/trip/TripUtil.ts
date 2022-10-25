import Trip from "../model/trip/Trip";
import DateTimeUtil from "../util/DateTimeUtil";
import ServiceDeparture from "../model/service/ServiceDeparture";
import Segment from "../model/trip/Segment";

class TripUtil {

    public static getTripTimeData(trip: Trip, brief: boolean = false): {departureTime: string, arrivalTime: string, duration: string, hasPT: boolean} {        
        const queryMoment = trip.queryTime ? DateTimeUtil.momentFromTimeTZ(trip.queryTime * 1000, trip.segments[0].from.timezone) : undefined;
        let departureTime = DateTimeUtil.format(trip.depart, DateTimeUtil.timeFormat(false));
        if (!brief && queryMoment && queryMoment.format("ddd D") !== DateTimeUtil.format(trip.depart, "ddd D")) {
            departureTime = DateTimeUtil.format(trip.depart, "ddd D") + ", " + departureTime;
        }        
        const arrivalTime = DateTimeUtil.format(trip.arrive, DateTimeUtil.timeFormat(false));
        // Truncates to minutes before subtract to display a duration in minutes that is consistent with
        // departure and arrival times, which are also truncated to minutes.
        const durationInMinutes = Math.floor(trip.arriveSeconds/60) - Math.floor(trip.departSeconds/60);
        const duration = DateTimeUtil.durationToBriefString(durationInMinutes, false);
        const hasPT = trip.hasPublicTransport();
        return {departureTime, arrivalTime, duration, hasPT}
    }

    public static sameService(altSegment: Segment, service: ServiceDeparture) {
        return altSegment.serviceTripID === service.serviceTripID // consider it's the same service if has the same id,
            && Math.abs(altSegment.startTimeSeconds - service.startTime) < 600;   // and are less than 10 mins apart.
    }

}

export default TripUtil;