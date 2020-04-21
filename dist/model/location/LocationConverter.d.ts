import Location from "../Location";
import { JsonCustomConvert } from "json2typescript";
export declare class LocationConverter implements JsonCustomConvert<Location> {
    serialize(location: Location): any;
    deserialize(locationJson: any): Location;
}
