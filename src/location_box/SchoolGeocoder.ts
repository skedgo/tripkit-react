import StaticGeocoder from "./StaticGeocoder";
import Location from "../model/Location";
import LatLng from "../model/LatLng";
import GeocodingSource from "./GeocodingSource";
import BBox from "../model/BBox";

class SchoolGeocoder extends StaticGeocoder {

    private schoolsRequest: Promise<any[]>;
    private schoolToBusLinesData: any[] = [];

    public getSourceId(): GeocodingSource {
        return GeocodingSource.ACT_SCHOOLS;
    }

    private static _instance: SchoolGeocoder;

    static get instance(): SchoolGeocoder {
        if (!this._instance) {
            this._instance = new SchoolGeocoder();
        }
        return this._instance;
    }

    constructor() {
        super();
        const schoolsJsonData = require("../data/json/schools.json");
        this.schoolsRequest = Promise.resolve(schoolsJsonData)
            .then((schoolsJson: any) => {
                const schools: Location[] = [];
                for (const schoolJson of schoolsJson.schoolData) {
                    schools.push(Location.create(LatLng.createLatLng(Number(schoolJson.lat), Number(schoolJson.lng)),
                        schoolJson.schoolName, schoolJson.schoolID, schoolJson.schoolName, GeocodingSource.ACT_SCHOOLS));
                }
                this.setValues(schools);
                for (const busesInterval of schoolsJson.busData) {
                    this.schoolToBusLinesData.push({
                        validFrom: Number(busesInterval.validFrom) * 1000,
                        validTo: Number(busesInterval.validTo) * 1000,
                        schoolIdToBusLines: this.buildSchoolIdToBusLines(busesInterval.buses)
                    });
                }
                return schoolsJson;
            });
    }

    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void {
        super.geocode(query, autocomplete, bounds, focus, (results: Location[]) => callback(results.slice(0, 3)));
    }

    private buildSchoolIdToBusLines(busesJson: any[]): Map<string, string[]> {
        const result: Map<string, string[]> = new Map<string, string[]>();
        for (const busJson of busesJson) {
            for (const school of busJson.schools) {
                let busLines = result.get(school);
                if (!busLines) {
                    busLines = [];
                    result.set(school, busLines);
                }
                busLines.push(busJson.busLine);
            }
        }
        return result;
    }

    public getSchoolsDataP() {
        return this.schoolsRequest;
    }

    public getBusesForSchoolId(schoolId: string, time: number): string[] | undefined {
        for (const data of this.schoolToBusLinesData) {
            if (data.validFrom <= time && time <= data.validTo) {
                return data.schoolIdToBusLines.get(schoolId);
            }
        }
        return undefined;
    }
}

export default SchoolGeocoder;