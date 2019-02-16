import StopLocation from "../StopLocation";
import Location from "../Location";
import {JsonConverter, JsonCustomConvert, JsonConvert} from "json2typescript";

@JsonConverter
export class LocationConverter implements JsonCustomConvert<Location> {
    public serialize(location: Location): any {
        const jsonConvert = new JsonConvert();
        return jsonConvert.serialize(location);
    }
    public deserialize(locationJson: any): Location {
        const jsonConvert = new JsonConvert();
        let location: Location;
        if (locationJson.class === "StopLocation") {
            location = jsonConvert.deserialize(locationJson, StopLocation) as Location;
        } else {
            location = jsonConvert.deserialize(locationJson, Location) as Location;
        }
        return location;
    }
}