import Trip from "../model/trip/Trip";
import DateTimeUtil from "../util/DateTimeUtil";
import ServiceDeparture from "../model/service/ServiceDeparture";
import Segment from "../model/trip/Segment";
import { TKUIConfig } from "../config/TKUIConfig";
import { SignInStatus } from "../account/TKAccountContext";

export function getBookingSegment(trip: Trip, tkconfig: TKUIConfig, signInStatus?: SignInStatus) {
    return trip.segments.find(segment => {
        if (segment.booking?.externalActions?.includes("showTicket")) { // If a show ticket action, then show booking btn just if booking is enabled (for that segment if enabled function is provided) and signed in.
            return tkconfig.booking && (!tkconfig.booking.enabled || tkconfig.booking.enabled(segment)) && signInStatus === SignInStatus.signedIn;
        }
        return (!tkconfig.booking || !tkconfig.booking.enabled || tkconfig.booking.enabled(segment)) && segment.booking;
    });
}

export function getTripBookingInfo(trip: Trip, tkconfig: TKUIConfig, status?: SignInStatus): { showBooking: boolean, bookingType?: "external" | "inapp", bookingSegment?: Segment } {
    // The first booking segment such that booking is enabled for that kind of segment. If not booking config or
    // booking.enabled function was specified then consider as true, so the button is displayed for external bookings
    // by default.
    const bookingSegment = getBookingSegment(trip, tkconfig, status);

    if (!bookingSegment) {
        return { showBooking: false };
    }
    return { showBooking: true, bookingType: bookingSegment.booking?.externalActions ? "external" : "inapp", bookingSegment };
}

class TripUtil {

    public static getTripTimeData(trip: Trip, brief: boolean = false): { departureTime: string, arrivalTime: string, duration: string, hasPT: boolean } {
        let departureTime = DateTimeUtil.format(trip.depart, DateTimeUtil.timeFormat(false));
        if (!brief && trip.queryTime && DateTimeUtil.format(trip.queryTime, "ddd D") !== DateTimeUtil.format(trip.depart, "ddd D")) {
            departureTime = DateTimeUtil.format(trip.depart, "ddd D") + ", " + departureTime;
        }
        const arrivalTime = DateTimeUtil.format(trip.arrive, DateTimeUtil.timeFormat(false));
        // Truncates to minutes before subtract to display a duration in minutes that is consistent with
        // departure and arrival times, which are also truncated to minutes.
        const durationInMinutes = Math.floor(trip.arriveSeconds / 60) - Math.floor(trip.departSeconds / 60);
        const duration = DateTimeUtil.durationToBriefString(durationInMinutes, false);
        const hasPT = trip.hasPublicTransport();
        return { departureTime, arrivalTime, duration, hasPT }
    }

    public static sameService(altSegment: Segment, service: ServiceDeparture) {
        return altSegment.serviceTripID === service.serviceTripID // consider it's the same service if has the same id,
            && Math.abs(altSegment.startTimeSeconds - service.startTime) < 600;   // and are less than 10 mins apart.
    }

}

export default TripUtil;