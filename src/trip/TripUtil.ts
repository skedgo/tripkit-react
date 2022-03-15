import Trip from "../model/trip/Trip";
import DateTimeUtil from "../util/DateTimeUtil";
import ServiceDeparture from "../model/service/ServiceDeparture";
import Segment from "../model/trip/Segment";

class TripUtil {

    public static getTripTimeData(trip: Trip, brief: boolean = false): {departureTime: string, arrivalTime: string, duration: string, hasPT: boolean} {
        const depart = trip.depart;
        const arrive = trip.arrive;
        const departMoment = DateTimeUtil.momentFromTimeTZ(depart * 1000, trip.segments[0].from.timezone);
        const queryMoment = trip.queryTime ? DateTimeUtil.momentFromTimeTZ(trip.queryTime * 1000, trip.segments[0].from.timezone) : undefined;
        let departureTime = departMoment.format(DateTimeUtil.timeFormat(false));
        if (!brief && queryMoment && queryMoment.format("ddd D") !== departMoment.format("ddd D")) {
            departureTime = departMoment.format("ddd D") + ", " + departureTime;
        }
        // TODO: should be trip.segments[trip.segments.length - 1].to.timezone? Consider if to can be undefined.
        const arrivalTime = DateTimeUtil.momentFromTimeTZ(arrive * 1000, trip.segments[trip.segments.length - 1].from.timezone).format(DateTimeUtil.timeFormat(false));
        // Truncates to minutes before subtract to display a duration in minutes that is consistent with
        // departure and arrival times, which are also truncated to minutes.
        const durationInMinutes = Math.floor(arrive/60) - Math.floor(depart/60);
        const duration = DateTimeUtil.durationToBriefString(durationInMinutes, false);
        const hasPT = trip.hasPublicTransport();
        return {departureTime, arrivalTime, duration, hasPT}
    }

    public static sameService(altSegment: Segment, service: ServiceDeparture) {
        return altSegment.serviceTripID === service.serviceTripID // consider it's the same service if has the same id,
            && Math.abs(altSegment.startTime - service.startTime) < 600;   // and are less than 10 mins apart.
    }

}

export default TripUtil;