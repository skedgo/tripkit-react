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
import TripGoApi from "../api/TripGoApi";

class TKShareHelper {

    public static useHash = false;

    public static getPathname(): string {
        return this.useHash ? document.location.hash.slice(1) : document.location.pathname;
    }

    public static getSearch(): string {
        const stateString = this.getPathname();
        return stateString.slice(stateString.indexOf('?'));
    }

    public static getBaseUrl(trailingSlash: boolean = false): string {
        let s = location.protocol + "//" + location.hostname
            + (location.port ? ":" + location.port : "") + (TKShareHelper.useHash ? location.pathname : "");
        // Remove trailing slash
        s = s.endsWith("/") ? s.slice(0, -1) : s;
        s += this.useHash ? "/#" : "";
        return trailingSlash ? s + "/" : s;
    }

    public static isSharedTripLink(): boolean {
        const shareLinkPath = this.getPathname();
        const shareLinkQuery = this.getSearch();
        return shareLinkPath.startsWith("/trip/") || shareLinkQuery.includes("tripUrl=");
    }

    public static getSharedTripJsonUrl(): string | undefined {
        const path = this.getPathname();
        const tripUrlPattern = "/trip/url/";
        if (path.startsWith(tripUrlPattern)) {
            return decodeURIComponent(path.substring(tripUrlPattern.length));
        }
        if (path.startsWith("/trip/")) {
            return TripGoApi.getSatappUrl(path);
        }
        const searchStr = this.getSearch();
        const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);
        if (queryMap.tripUrl) { // Already decoded (decodeURIComponent) by queryString.parse
            return queryMap.tripUrl;
        }
        return undefined;
    }

    public static isSharedArrivalLink(): boolean {
        const shareLinkPath = this.getPathname();
        return shareLinkPath.startsWith("/meet");
    }

    public static isSharedStopLink(): boolean {
        const shareLinkPath = this.getPathname();
        return shareLinkPath.startsWith("/stop");
    }

    public static isSharedServiceLink(): boolean {
        const shareLinkPath = this.getPathname();
        return shareLinkPath.startsWith("/service");
    }

    public static isSharedQueryLink(): boolean {
        const shareLinkPath = this.getPathname();
        return shareLinkPath.startsWith("/go");
    }

    public static getTempShareTripLink(trip: Trip): string {
        return this.getBaseUrl() + '/trip/url/' + encodeURIComponent(trip.temporaryURL);
    }

    public static getShareArrival(trip: Trip): string {
        const arrivalSegment = trip.segments[trip.segments.length - 1];
        return this.getShareSegmentArrival(arrivalSegment);
    }

    public static getShareSegmentArrival(segment: Segment): string {
        const destination = segment.to;
        return this.getBaseUrl() + "/meet?" + "lat=" + destination.lat + "&lng=" + destination.lng
            + "&at=" + segment.endTime;
    }

    public static getShareLocation(location: Location): string {
        return this.getBaseUrl() + "/meet?" + "lat=" + location.lat + "&lng=" + location.lng;
    }

    public static getShareTimetable(stop: StopLocation): string {
        return this.getBaseUrl() + "/stop/" +
            encodeURIComponent(RegionsData.instance.getRegion(stop)!.name) + "/" + encodeURIComponent(stop.code)
    }

    public static getShareService(service: ServiceDeparture): string {
        const stop = service.startStop!;
        return this.getBaseUrl() + "/service/" +
            encodeURIComponent(RegionsData.instance.getRegion(stop)!.name) + "/" + encodeURIComponent(stop.code)
        + "/" + encodeURIComponent(service.serviceTripID) + "/" + service.startTime;
    }

    public static getShareQuery(query: RoutingQuery, plannerUrl?: string): string {
        let goURL;
        if (plannerUrl) {
            // Add trailing '/', if missing
            goURL = plannerUrl + (plannerUrl.endsWith("/") ? "" : "/");
            // Add '#' if useHash
            goURL += this.useHash ? "#/" : "";
        } else {
            goURL = this.getBaseUrl(true);
        }
        goURL += "go";
        if (query.from) {
            goURL += (goURL.includes("?") ? "&" : "?");
            goURL += "flat=" + query.from.lat + "&flng=" + query.from.lng +
                "&fname=" + query.from.address +
                (query.from.id ? "&fid=" + (query.from.id) : "") +
                (query.from.source ? "&fsrc=" + (query.from.source) : "");
        }
        if (query.to) {
            goURL += (goURL.includes("?") ? "&" : "?");
            goURL += "tlat=" + query.to.lat + "&tlng=" + query.to.lng +
                "&tname=" + query.to.address +
                (query.to.id ? "&tid=" + (query.to.id) : "") +
                (query.to.source ? "&tsrc=" + (query.to.source) : "");
        }
        goURL += "&type=" + (query.timePref === TimePreference.NOW ? "0" :
            (query.timePref === TimePreference.LEAVE ? "1" : "2")) + "&time=" + Math.floor(query.time.valueOf() / 1000);
        return goURL;
    }

    public static parseSharedQueryLink(): RoutingQuery | undefined {
        const searchStr = this.getSearch();
        const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);
        let routingQuery: RoutingQuery | undefined;
        if (queryMap) {
            let from: Location | null = null;
            if (queryMap.flat || queryMap.fname) {
                const fromLatLng = queryMap.flat ? LatLng.createLatLng(Number(queryMap.flat), Number(queryMap.flng)) : new LatLng();
                from = Location.create(fromLatLng, queryMap.fname, queryMap.fid ? queryMap.fid : "", "", queryMap.fsrc);
            }
            let to: Location | null = null;
            if (queryMap.tlat || queryMap.tlng) {
                const toLatlng = queryMap.tlat ? LatLng.createLatLng(Number(queryMap.tlat), Number(queryMap.tlng)) : new LatLng();
                to = Location.create(toLatlng, queryMap.tname, queryMap.tid ? queryMap.tid : "", "", queryMap.tsrc);
            }
            routingQuery = RoutingQuery.create(from, to,
                queryMap.type === "0" ? TimePreference.NOW : (queryMap.type === "1" ? TimePreference.LEAVE : TimePreference.ARRIVE),
                queryMap.type === "0" ? DateTimeUtil.getNow() : DateTimeUtil.momentFromTimeTZ(queryMap.time * 1000))
        }
        return routingQuery;
    }

    public static parseTransportsQueryParam(): TKTransportOptions | undefined {
        const searchStr = this.getSearch();
        const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);
        return queryMap && queryMap.transports && Util.deserialize(JSON.parse(decodeURIComponent(queryMap.transports)), TKTransportOptions);
    }

    public static parseViewport(): {center: LatLng, zoom: number} | undefined {
        const searchStr = this.getSearch();
        const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);
        return queryMap && queryMap.clat && queryMap.clng && queryMap.zoom ?
            {center: LatLng.createLatLng(queryMap.clat, queryMap.clng), zoom: queryMap.zoom} : undefined;
    }

    public static resetToHome() {
        window.history.replaceState({}, "", "/");
    }

}

export default TKShareHelper;