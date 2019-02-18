import LocationsResult from "../model/location/LocationsResult";
import BBox from "../model/BBox";
declare class LocationsData {
    static cellsPerDegree: number;
    private cellToLocResult;
    private static _instance;
    static readonly instance: LocationsData;
    private eventEmitter;
    addChangeListener(callback: (locData: LocationsResult) => void): void;
    private fireChangeEvent;
    requestLocations(region: string, level: 1 | 2, bounds?: BBox): void;
}
export default LocationsData;
