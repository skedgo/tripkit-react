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
import TKDefaultGeocoderNames from "../geocode/TKDefaultGeocoderNames";
import SchoolLocation from "../model/location/SchoolLocation";

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

    public static getShareQuery(query: RoutingQuery, options: { plannerUrl?: string, stateInHash?: boolean, otherParams?: Record<string, string> } = {}): string {
        const { plannerUrl, stateInHash = this.useHash, otherParams } = options;
        const searchUrl = new URL("https://tripgo.com");
        if (query.from) {
            searchUrl.searchParams.set("flat", query.from.lat.toString());
            searchUrl.searchParams.set("flng", query.from.lng.toString());
            searchUrl.searchParams.set("fname", query.from.address ?? "");
            if (query.from.id) {
                searchUrl.searchParams.set("fid", query.from.id);
            }
            if (query.from.source) {
                searchUrl.searchParams.set("fsrc", query.from.source);
            }
            if (query.from instanceof SchoolLocation) {
                if (query.from.id) {
                    searchUrl.searchParams.set("fresolve", true.toString());
                } else if (query.from.modeIdentifiers) {    // Workaround until geocode.json returns id for school locations
                    searchUrl.searchParams.set("fschoolmodes", query.from.modeIdentifiers.join(","));
                }
            }
        }
        if (query.to) {
            searchUrl.searchParams.set("tlat", query.to.lat.toString());
            searchUrl.searchParams.set("tlng", query.to.lng.toString());
            searchUrl.searchParams.set("tname", query.to.address ?? "");
            if (query.to.id) {
                searchUrl.searchParams.set("tid", query.to.id);
            }
            if (query.to.source) {
                searchUrl.searchParams.set("tsrc", query.to.source);
            }
            if (query.to instanceof SchoolLocation) {
                if (query.to.id) {
                    searchUrl.searchParams.set("tresolve", true.toString());
                } else if (query.to.modeIdentifiers) {  // Workaround until geocode.json returns id for school locations
                    searchUrl.searchParams.set("tschoolmodes", query.to.modeIdentifiers.join(","));
                }
            }
        }
        searchUrl.searchParams.set("type", query.timePref === TimePreference.NOW ? "0" : (query.timePref === TimePreference.LEAVE ? "1" : "2"));
        searchUrl.searchParams.set("time", Math.floor(query.time.valueOf() / 1000).toString());
        if (otherParams) {
            for (const key in otherParams) {
                searchUrl.searchParams.set(key, otherParams[key]);
            }
        }

        const resultURL = new URL(plannerUrl ?? this.getBaseUrl(true));
        if (stateInHash) {
            resultURL.hash = "/go" + searchUrl.search;
        } else {
            resultURL.pathname = "/go";
            resultURL.search = searchUrl.search;
        }
        return resultURL.toString();
    }

    public static parseSharedQueryFromUrlSearch(searchStr: string): RoutingQuery | undefined {
        const queryMap = queryString.parse(searchStr.startsWith("?") ? searchStr.substr(1) : searchStr);
        let routingQuery: RoutingQuery | undefined;
        if (queryMap) {
            const { flat, flng, fname, fid, fsrc, fresolve, fschoolmodes, tlat, tlng, tname, tid, tsrc, tresolve, tschoolmodes, type = "0", time = DateTimeUtil.getNow().valueOf() / 1000, modes } = queryMap;
            let from: Location | null = null;
            if (flat || fname || fsrc === TKDefaultGeocoderNames.geolocation) {
                const fromLatLng = flat ? LatLng.createLatLng(Number(flat), Number(flng)) : new LatLng();
                from = Location.create(fromLatLng, fname, fid ? fid : "", "", fsrc);
                if (fresolve === "true") {
                    from.hasDetail = false;
                }
                if (fschoolmodes) { // Workaround until geocode.json returns id for school locations
                    from = Util.iAssign(new SchoolLocation(), from);
                    from.class = "SchoolLocation";
                    (from as SchoolLocation).modeIdentifiers = fschoolmodes.split(",");
                }
            }
            let to: Location | null = null;
            if (tlat || tlng) {
                const toLatlng = tlat ? LatLng.createLatLng(Number(tlat), Number(tlng)) : new LatLng();
                to = Location.create(toLatlng, tname, tid ? tid : "", "", tsrc);
                if (tresolve === "true") {
                    to.hasDetail = false;
                }
                if (tschoolmodes) { // Workaround until geocode.json returns id for school locations
                    to = Util.iAssign(new SchoolLocation(), to);
                    to.class = "SchoolLocation";
                    (to as SchoolLocation).modeIdentifiers = tschoolmodes.split(",");
                }
            }
            routingQuery = RoutingQuery.create(from, to,
                type === "0" ? TimePreference.NOW : (type === "1" ? TimePreference.LEAVE : TimePreference.ARRIVE),
                type === "0" ? DateTimeUtil.getNow() : DateTimeUtil.momentFromTimeTZ(time * 1000));
            if (modes) {
                routingQuery.additional = { modes: modes };
            }
        }
        return routingQuery;
    }

    public static parseSharedQueryLink(): RoutingQuery | undefined {
        return this.parseSharedQueryFromUrlSearch(this.getSearch());
    }

    public static parseSharedQueryUrl(url: string): RoutingQuery | undefined {
        const uRL = new URL(url);
        if (!uRL.pathname.startsWith("/go")) {
            return undefined;
        };
        return this.parseSharedQueryFromUrlSearch(uRL.search);
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