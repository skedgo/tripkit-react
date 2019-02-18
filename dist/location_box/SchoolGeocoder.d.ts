import StaticGeocoder from "./StaticGeocoder";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import GeocodingSource from "./GeocodingSource";
import BBox from "../model/BBox";
declare class SchoolGeocoder extends StaticGeocoder {
    private schoolsRequest;
    private schoolToBusLinesData;
    getSourceId(): GeocodingSource;
    private static _instance;
    static readonly instance: SchoolGeocoder;
    constructor();
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void;
    private buildSchoolIdToBusLines;
    getSchoolsDataP(): Promise<any[]>;
    getBusesForSchoolId(schoolId: string, time: number): string[] | undefined;
}
export default SchoolGeocoder;
