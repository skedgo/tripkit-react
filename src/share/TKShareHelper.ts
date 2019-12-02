import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import RegionsData from "../data/RegionsData";
import Segment from "../model/trip/Segment";

class TKShareHelper {

    public static isSharedTripLink(): boolean {
        const shareLinkPath = document.location.pathname;
        return shareLinkPath.startsWith("/trip");
    }

    public static isSharedArrivalLink(): boolean {
        const shareLinkPath = document.location.pathname;
        return shareLinkPath.startsWith("/meet");
    }

    public static isSharedStopLink(): boolean {
        const shareLinkPath = document.location.pathname;
        return shareLinkPath.startsWith("/stop");
    }

    public static isSharedServiceLink(): boolean {
        const shareLinkPath = document.location.pathname;
        return shareLinkPath.startsWith("/service");
    }

    public static getShareArrival(trip: Trip): string {
        const arrivalSegment = trip.segments[trip.segments.length - 1];
        return this.getShareSegmentArrival(arrivalSegment);
    }

    public static getShareSegmentArrival(segment: Segment): string {
        const destination = segment.to;
        return "https://tripgo.com/meet?" + "lat=" + destination.lat + "&lng=" + destination.lng
            + "&at=" + segment.endTime;
    }

    public static getShareTimetable(stop: StopLocation): string {
        return "https://tripgo.com/stop/" +
            encodeURIComponent(RegionsData.instance.getRegion(stop)!.name) + "/" + encodeURIComponent(stop.code)
   }

}

export default TKShareHelper;