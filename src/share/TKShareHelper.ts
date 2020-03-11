import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import RegionsData from "../data/RegionsData";
import Segment from "../model/trip/Segment";
import Location from "../model/Location";
import Constants from "../util/Constants";
import ServiceDeparture from "../model/service/ServiceDeparture";
import RoutingQuery, {TimePreference} from "../model/RoutingQuery";
import LatLng from "../model/LatLng";
import DateTimeUtil from "../util/DateTimeUtil";
import * as queryString from "query-string";
import TKTransportOptions from "../model/options/TKTransportOptions";
import Util from "../util/Util";

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

    public static isSharedQueryLink(): boolean {
        const shareLinkPath = document.location.pathname;
        return shareLinkPath.startsWith("/go");
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

    public static getShareQuery(query: RoutingQuery, plannerUrl?: string): string {
        let goURL = (plannerUrl ? plannerUrl : Constants.DEPLOY_URL) + "/go/";
        goURL += (goURL.includes("?") ? "&" : "?");
        if (query.from) {
            goURL += "flat=" + query.from.lat + "&flng=" + query.from.lng +
                "&fname=" + (query.from.isCurrLoc() && !query.from.isResolved() ? "My location" : query.from.address) +
                (query.from.id ? "&fid=" + (query.from.id) : "") +
                (query.from.source ? "&fsrc=" + (query.from.source) : "");
        }
        if (query.to) {
            goURL += "&tlat=" + query.to.lat + "&tlng=" + query.to.lng +
                "&tname=" + (query.to.isCurrLoc() && !query.to.isResolved() ? "My location" : query.to.address) +
                (query.to.id ? "&tid=" + (query.to.id) : "") +
                (query.to.source ? "&tsrc=" + (query.to.source) : "");
        }
        goURL += "&type=" + (query.timePref === TimePreference.NOW ? "0" :
            (query.timePref === TimePreference.LEAVE ? "1" : "2")) + "&time=" + Math.floor(query.time.valueOf() / 1000);
        return goURL;
    }

    public static parseSharedQueryLink(): RoutingQuery | undefined {
        const searchStr = window.location.search;
        const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);
        let routingQuery: RoutingQuery | undefined;
        if (queryMap && queryMap.flat) {
            routingQuery = RoutingQuery.create(
                Location.create(LatLng.createLatLng(Number(queryMap.flat), Number(queryMap.flng)),
                    queryMap.fname, queryMap.fid ? queryMap.fid : "", "", queryMap.fsrc),
                Location.create(LatLng.createLatLng(Number(queryMap.tlat), Number(queryMap.tlng)),
                    queryMap.tname, queryMap.tid ? queryMap.tid : "", "", queryMap.tsrc),
                queryMap.type === "0" ? TimePreference.NOW : (queryMap.type === "1" ? TimePreference.LEAVE : TimePreference.ARRIVE),
                queryMap.type === "0" ? DateTimeUtil.getNow() : DateTimeUtil.momentFromTimeTZ(queryMap.time * 1000)
            )
        }
        return routingQuery;
    }

    public static parseTransportsQueryParam(): TKTransportOptions | undefined {
        const searchStr = window.location.search;
        const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);
        return queryMap && queryMap.transports && Util.deserialize(JSON.parse(decodeURIComponent(queryMap.transports)), TKTransportOptions);
    }

    public static resetToHome() {
        window.history.replaceState({}, "", "/");
    }

}

export default TKShareHelper;