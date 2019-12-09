import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import RegionsData from "../data/RegionsData";
import Segment from "../model/trip/Segment";
import Location from "../model/Location";
import Constants from "../util/Constants";
import ServiceDeparture from "../model/service/ServiceDeparture";

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
        return Constants.DEPLOY_URL + "/meet?" + "lat=" + destination.lat + "&lng=" + destination.lng
            + "&at=" + segment.endTime;
    }

    public static getShareLocation(location: Location): string {
        return Constants.DEPLOY_URL + "/meet?" + "lat=" + location.lat + "&lng=" + location.lng;
    }

    public static getShareTimetable(stop: StopLocation): string {
        return Constants.DEPLOY_URL + "/stop/" +
            encodeURIComponent(RegionsData.instance.getRegion(stop)!.name) + "/" + encodeURIComponent(stop.code)
    }

    public static getShareService(service: ServiceDeparture): string {
        const stop = service.startStop!;
        return Constants.DEPLOY_URL + "/service/" +
            encodeURIComponent(RegionsData.instance.getRegion(stop)!.name) + "/" + encodeURIComponent(stop.code)
        + "/" + encodeURIComponent(service.serviceTripID) + "/" + service.startTime;
    }

}

export default TKShareHelper;