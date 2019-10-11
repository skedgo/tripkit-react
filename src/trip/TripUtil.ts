import Trip from "../model/trip/Trip";
import DateTimeUtil from "../util/DateTimeUtil";

class TripUtil {

    public static getTripTimeData(trip: Trip, brief: boolean = false): {departureTime: string, arrivalTime: string, duration: string, hasPT: boolean} {
        const depart = trip.depart;
        const arrive = trip.arrive;
        const departMoment = DateTimeUtil.momentTZTime(depart * 1000);
        const queryMoment = trip.queryTime ? DateTimeUtil.momentTZTime(trip.queryTime * 1000) : undefined;
        let departureTime = departMoment.format(DateTimeUtil.TIME_FORMAT_TRIP);
        if (brief && queryMoment && queryMoment.format("ddd D") !== departMoment.format("ddd D")) {
            departureTime = departMoment.format("ddd D") + ", " + departureTime;
        }
        const arrivalTime = DateTimeUtil.momentTZTime(arrive * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
        // Truncates to minutes before subtract to display a duration in minutes that is consistent with
        // departure and arrival times, which are also truncated to minutes.
        const durationInMinutes = Math.floor(arrive/60) - Math.floor(depart/60);
        const duration = DateTimeUtil.durationToBriefString(durationInMinutes, false);
        const hasPT = trip.hasPublicTransport();
        return {departureTime, arrivalTime, duration, hasPT}
    }

}

export default TripUtil;