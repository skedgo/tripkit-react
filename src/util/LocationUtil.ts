import Location from "../model/Location";
import LatLng from "../model/LatLng";
import City from "../model/location/City";

class LocationUtil {
    public static getMainText(loc: Location): string {
        if (loc instanceof City) {
            return loc.name;
        }
        const address = loc.address;
        return address.includes(",") ? address.substr(0, address.indexOf(",")) : address;
    }

    public static getSecondaryText(loc: Location): string | undefined {
        const address = loc.address;
        return address.includes(",") ? address.substr(address.indexOf(",") + 1, address.length) : undefined;
    }

    public static equal<T extends LatLng>(loc1: T | null, loc2: T | null) {
        return loc1 === null ? loc2 === null :
            (loc2 !== null && loc1.getKey() === loc2.getKey());
    }

    public static computeLevenshteinDistance(str1: string, str2: string): number {
        const distance: number[][] = new Array(str1.length + 1);
        for (let i = 0; i < str1.length + 1; i++) {
            distance[i] = new Array(str2.length + 1);
        }
        for (let i = 0; i <= str1.length; i++) {
            distance[i][0] = i;
        }
        for (let j = 1; j <= str2.length; j++) {
            distance[0][j] = j;
        }
        for (let i = 1; i <= str1.length; i++) {
            for (let j = 1; j <= str2.length; j++) {
                distance[i][j] = Math.min(
                    distance[i - 1][j] + 1,
                    distance[i][j - 1] + 1,
                    distance[i - 1][j - 1] + ((str1.charAt(i - 1) === str2.charAt(j - 1)) ? 0 : 1));}
        }
        return distance[str1.length][str2.length];
    }

    public static relevance(query: string, searchResult: string, preferShorter: boolean = false): number {
        query = query.toLowerCase();
        searchResult = searchResult.toLowerCase();
        if (query === searchResult) {
            return 1;
        }
        if (searchResult.includes(",") && query === searchResult.substring(0, searchResult.indexOf(","))) { // query equals to first term
            return .9;
        }
        const searchResultWords = searchResult.split(" ");
        if (searchResult.startsWith(query)) {
            return .85 * (preferShorter ? 40/(40 + searchResultWords.length) : 1);
        }
        let relevance = 0;
        const queryWords = query.split(" ");
        for (const queryWord of queryWords) {
            let queryWordInResult = false;
            let queryWordAsPrefix = false;
            for (const searchResultWord of searchResultWords) {
                if (searchResultWord === queryWord) {
                    queryWordInResult = true;
                    break;
                }
                if (searchResultWord.startsWith(queryWord)) {
                    queryWordAsPrefix = true;
                    break;
                }
            }
            if (queryWordInResult) {
                relevance += .8 / queryWords.length;
            } else if (queryWordAsPrefix) {
                relevance += .7 / queryWords.length;
            } else if (searchResult.includes(queryWord)) {
                relevance += .6 / queryWords.length;
            } else {
                let minDistance = Number.MAX_VALUE;
                for (const searchResultWord of searchResultWords) {
                    minDistance = Math.min(minDistance, LocationUtil.computeLevenshteinDistance(queryWord, searchResultWord));
                }
                relevance += .5 / (queryWords.length + minDistance);
            }
        }
        return relevance * (preferShorter ? 40/(40 + searchResultWords.length) : 1);
    }

    private static readonly earthRadius = 6371000;
    private static readonly radians = 3.14159/180;

    /* This is the Equirectangular approximation. It's a little slower than the Region.distanceInMetres() formula. */
    public static distanceInMetres(c1: LatLng, c2: LatLng): number {
        let lngDelta = Math.abs(c1.lng - c2.lng);
        if (lngDelta > 180) {
            lngDelta = 360 - lngDelta;
        }
        const p1 = lngDelta * Math.cos(0.5 * this.radians * (c1.lat + c2.lat));
        const p2 = (c1.lat - c2.lat);
        return this.earthRadius * this.radians * Math.sqrt(p1*p1 + p2*p2);
    }
}

export default LocationUtil;