import IGeocoder from "./IGeocoder";
import GeocoderOptions from "./GeocoderOptions";
import LatLng from "../model/LatLng";
import Location from "../model/Location";
import BBox from "../model/BBox";
import LocationUtil from "../util/LocationUtil";

class StaticGeocoder implements IGeocoder {

    private options: GeocoderOptions;
    private values: Location[] = [];

    public sourceId = "";
    emptyMatchAll: boolean;

    constructor(sourceId: string, emptyMatchAll: boolean = false) {
        this.sourceId = sourceId;
        this.emptyMatchAll = emptyMatchAll;
        this.options = new GeocoderOptions();
    }

    public getSourceId(): string {
        return this.sourceId;
    }

    public setValues(values: Location[]) {
        this.values = values;
    }

    public getOptions(): GeocoderOptions {
        return this.options;
    }


    public geocode(query: string, autocomplete: boolean, bounds: BBox | null, focus: LatLng | null, callback: (results: Location[]) => void): void {
        if (!query) {
            if (this.emptyMatchAll) {
                callback(this.values.slice(0, this.options.resultsLimit));
            } else {
                callback([]);
            }
            return;
        }
        const results = this.values.filter((value: Location) => {
            let valueS = (value.name ? value.name.toLowerCase() : "");
            valueS += (value.address ? (valueS ? " " : "") + value.address.toLowerCase() : "");
            return LocationUtil.relevance(query, valueS, true)  >= .5;
            // return (value.name && value.name.toLowerCase().includes(query.toLowerCase()))
            //     || (value.address && value.address.toLowerCase().includes(query.toLowerCase()));
        });
        results.sort((r1: Location, r2: Location) => this.getSort(query, r2, r1));
        callback(results.slice(0, this.options.resultsLimit));
    }

    protected getSort(query: string, r2: Location, r1: Location) {
        return LocationUtil.relevance(query, r2.name, true) - LocationUtil.relevance(query, r1.name, true);
    }

    public resolve(unresolvedLocation: Location, callback: (resolvedLocation: Location) => void): void {
        // Not empty
    }

    public reverseGeocode(coord: LatLng, callback: (location: (Location | null)) => void): void {
        // Not empty
    }


}

export default StaticGeocoder;