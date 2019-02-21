import StaticGeocoder from "./StaticGeocoder";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import BBox from "../model/BBox";
declare class SchoolGeocoder extends StaticGeocoder {
    static readonly SOURCE_ID: string;
    private schoolsRequest;
    private schoolToBusLinesData;
    getSourceId(): string;
    private static _instance;
    static readonly instance: SchoolGeocoder;
    constructor();
    geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void;
    private buildSchoolIdToBusLines;
    getSchoolsDataP(): Promise<any[]>;
    getBusesForSchoolId(schoolId: string, time: number): string[] | undefined;
}
export default SchoolGeocoder;
