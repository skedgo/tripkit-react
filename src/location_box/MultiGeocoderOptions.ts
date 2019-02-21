import IGeocoder from "./IGeocoder";
import Location from "../model/Location";
import PeliasGeocoder from "./PeliasGeocoder";
import SkedgoGeocoder from "./SkedgoGeocoder";
import LocationUtil from "../util/LocationUtil";
import StopLocation from "../model/StopLocation";

class MultiGeocoderOptions {

    public static default(showCurrLoc: boolean = true) {
        const geocoders = [new PeliasGeocoder("https://api.geocode.earth/v1", "ge-63f76914953caba8"),
            new SkedgoGeocoder()];
        const compare = (l1: Location, l2: Location, query: string) => {
            if (l1.source === SkedgoGeocoder.SOURCE_ID && l1 instanceof StopLocation && query === (l1 as StopLocation).code) {
                return -1;
            } else if (l2.source === SkedgoGeocoder.SOURCE_ID && l2 instanceof StopLocation && query === (l2 as StopLocation).code) {
                return 1
            }

            const relevanceDiff = LocationUtil.relevance(query, l2.address) - LocationUtil.relevance(query, l1.address);

            // Prioritize skedgo geocoder result if
            // - query has 3 or more characters, and
            // - query is related to "airport" or "stop", and
            // - relevance is not less than 0.1 from other source result
            if (query.length >= 3 &&
                (LocationUtil.relevance(query, "airport") >= .7 ||
                    LocationUtil.relevance(query, "stop") >= .7)) {
                if (l1.source === SkedgoGeocoder.SOURCE_ID && relevanceDiff <= 0.1) {
                    return -1;
                } else if (l2.source === SkedgoGeocoder.SOURCE_ID && relevanceDiff >= -0.1) {
                    return 1
                }
            }

            if (relevanceDiff !== 0) {
                return relevanceDiff;
            }

            return 0;
        };
        const analogResults = (r1: Location, r2: Location) => {
            const relevance = Math.max(LocationUtil.relevance(r1.address, r2.address) , LocationUtil.relevance(r2.address, r1.address));
            const distanceInMetres = LocationUtil.distanceInMetres(r1, r2);
            if (r1.source !== r2.source) {
                console.log(r1.address + " (" + r1.source + ")" + " | " + r2.address + " (" + r2.source + ")" + " dist: " + distanceInMetres + " relevance: " + relevance);
            }
            if (r1.source !== r2.source && relevance > .7 && (LocationUtil.distanceInMetres(r1, r2) < 100)) {
                return true;
            }
            return false;
        };
        return new MultiGeocoderOptions(showCurrLoc, geocoders, compare, analogResults);
    }

    public showCurrLoc: boolean = false;
    public geocoders: IGeocoder[] = [];
    public compare: (l1: Location, l2: Location, query: string) => number;
    public analogResults: (r1: Location, r2: Location) => boolean;


    constructor(showCurrLoc: boolean, geocoders: IGeocoder[], compare: (l1: Location, l2: Location, query: string) => number, analogResults: (r1: Location, r2: Location) => boolean) {
        this.showCurrLoc = showCurrLoc;
        this.geocoders = geocoders;
        this.compare = compare;
        this.analogResults = analogResults;
    }
}

export default MultiGeocoderOptions;