import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
import RegionsData from "../data/RegionsData";
import Segment from "../model/trip/Segment";
import Location from "../model/Location";
import ServiceDeparture from "../model/service/ServiceDeparture";
import RoutingQuery, { TimePreference } from "../model/RoutingQuery";
import LatLng from "../model/LatLng";
import DateTimeUtil from "../util/DateTimeUtil";
import * as queryString from "query-string";
import TKTransportOptions from "../model/options/TKTransportOptions";
import Util from "../util/Util";
import TripGoApi from "../api/TripGoApi";
import TKUserProfile from "../model/options/TKUserProfile";

class TKShareHelper {

    public static useHash = false;

    public static getPathname(): string {
        const hash = document.location.hash;
        return this.useHash ?
            hash.slice(1, hash.includes('?') ? hash.indexOf('?') : undefined) :
            document.location.pathname;
    }

    public static getSearch(): string {
        const hash = document.location.hash;
        return this.useHash ?
            (hash.includes('?') ? hash.slice(hash.indexOf('?')) : "") :
            document.location.search;
    }

    public static getBaseUrl(trailingSlash: boolean = false): string {
        let s = document.location.protocol + "//" + document.location.hostname
            + (document.location.port ? ":" + document.location.port : "") + (TKShareHelper.useHash ? document.location.pathname : "");
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
            + (!segment.hideExactTimes && !segment.trip.hideExactTimes ? "&at=" + segment.endTimeSeconds : "");
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
            encodeURIComponent(stop.region!) + "/" + encodeURIComponent(stop.code)
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

    public static parseSharedQueryUrl(url: string): RoutingQuery | undefined {
        const uRL = new URL(url);
        if (!uRL.pathname.startsWith("/go")) {
            return undefined;
        };
        const searchStr = uRL.search;
        const queryMap = queryString.parse(searchStr);
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
            if (queryMap.modes) {
                routingQuery.additional = { modes: queryMap.modes };
            }
        }
        return routingQuery;
    }

    public static parseLocation(locS: string) {
        const res = /^[\(]?([0-9.-]*),[\s]?([0-9.-]*)[\)]?/g.exec(locS);
        if (res === null || !res[1] || !res[2]) {
            throw "Error parsing location string: " + locS;
        }
        const latLng = LatLng.createLatLng(Number(res[1]), Number(res[2]));
        const name = locS.indexOf('"') !== -1 ? locS.substring(locS.indexOf('"') + 1, locS.length - 1) : ""
        return Location.create(latLng, name, "", "");
    }

    public static parseRoutingQueryUrl(url: string): RoutingQuery | undefined {
        url = url.replaceAll(/[]|%5B%5D/g, "");
        const params = queryString.parse(url, { sort: false, parseNumbers: true }); // Sort option is ignored.        
        // Can do something like this, to force an arbitrary order on stringify (this doesn't seem to work on parse):
        // const order = ['wp', 'tt', 'ws', 'v'];
        // console.log(queryString.stringify(params, { sort: (a, b) => order.indexOf(a) - order.indexOf(b) }));            
        return TKShareHelper.parseRoutingQueryJSON(params);
    }

    public static parseRoutingQueryJSON(queryJSON: any): RoutingQuery | undefined {
        console.log(queryJSON);
        const { from, to, departAfter, arriveBefore, ...additional } = queryJSON;
        const instance = new RoutingQuery();
        if (from) {
            instance.from = TKShareHelper.parseLocation(from);
        }
        if (to) {
            instance.to = TKShareHelper.parseLocation(to);
        }
        instance.timePref = arriveBefore ? TimePreference.ARRIVE : TimePreference.LEAVE;    // Don't use arriveBefore !== undefined given the reason below.
        const time = arriveBefore || departAfter;   // use || instead of ?? since it's valid that both come, with one of them in 0.
        instance.time = DateTimeUtil.momentFromTimeTZ(isNaN(time) ? time : time * 1000);    // also contemplates the time as ISO date.
        instance.additional = additional;
        return instance;
    }

    public static parseTransportsQueryParam(): TKTransportOptions | undefined {
        const searchStr = this.getSearch();
        const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);
        return queryMap && queryMap.transports && Util.deserialize(JSON.parse(decodeURIComponent(queryMap.transports)), TKTransportOptions);
    }

    public static parseSettingsQueryParam(): TKUserProfile | undefined {
        const searchStr = this.getSearch();
        const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);
        return queryMap && queryMap.settings && Util.deserialize(JSON.parse(decodeURIComponent(queryMap.settings)), TKUserProfile);
    }

    public static parseViewport(): { center: LatLng, zoom: number } | undefined {
        const searchStr = this.getSearch();
        const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);
        return queryMap && queryMap.clat && queryMap.clng && queryMap.zoom ?
            { center: LatLng.createLatLng(queryMap.clat, queryMap.clng), zoom: queryMap.zoom } : undefined;
    }

    public static resetToHome() {
        window.history.replaceState({}, "", "/");
    }

}

export default TKShareHelper;