import Location from "../model/Location";
import LatLng from "../model/LatLng";
declare class LocationUtil {
    static getMainText(loc: Location): string;
    static getSecondaryText(loc: Location): string | null;
    static equal<T extends LatLng>(loc1: T | null, loc2: T | null): boolean;
    static computeLevenshteinDistance(str1: string, str2: string): number;
    static relevance(query: string, searchResult: string, preferShorter?: boolean): number;
    private static readonly earthRadius;
    private static readonly radians;
    static distanceInMetres(c1: LatLng, c2: LatLng): number;
}
export default LocationUtil;
