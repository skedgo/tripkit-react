import LocationsResult from "../model/location/LocationsResult";
import { EventSubscription } from "fbemitter";
import BBox from "../model/BBox";
declare class LocationsData {
    static cellsPerDegree: number;
    private cellToLocResult;
    private static _instance;
    static get instance(): LocationsData;
    private eventEmitter;
    addChangeListener(callback: (locData: LocationsResult) => void): EventSubscription;
    private fireChangeEvent;
    getRequestLocations(region: string, level: 1 | 2, bounds?: BBox): LocationsResult;
}
export default LocationsData;
