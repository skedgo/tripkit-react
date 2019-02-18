import BikePodLocation from "./BikePodLocation";
import FacilityLocation from "./FacilityLocation";
import CarParkLocation from "./CarParkLocation";
import { MapLocationType } from "./MapLocationType";
import Location from "../Location";
declare class LocationsResult {
    constructor(level?: 1 | 2);
    private _key;
    private _hashCode;
    private _bikePods;
    private _facilities;
    private _carParks;
    private _level;
    key: string;
    hashCode: number;
    bikePods: BikePodLocation[] | undefined;
    facilities: FacilityLocation[] | undefined;
    carParks: CarParkLocation[] | undefined;
    level: 1 | 2;
    add(other: LocationsResult): void;
    isEmpty(): boolean;
    getByType(type: MapLocationType): Location[];
}
export default LocationsResult;
