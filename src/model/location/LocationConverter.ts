import StopLocation from "../StopLocation";
import Location from "../Location";
import {JsonConverter, JsonCustomConvert, JsonConvert} from "json2typescript";
import Util from "../../util/Util";
import ModeInfo from "../trip/ModeInfo";
import City from "./City";

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
            // Needs to set modeInfo since it incorrectly comes with value {}, which causes a parsing error.
            // Tried setting to undefined, and put modeInfo as optional in StopLocation but json2typescript gave an
            // exception of missing modeInfo when compiled.
            if (locationJson.modeInfo && Util.isEmpty(locationJson.modeInfo)) {
                locationJson.modeInfo = jsonConvert.serialize(new ModeInfo());
            }
            location = jsonConvert.deserialize(locationJson, StopLocation);
        } else if (locationJson.class === "CityLocation") {
            location = jsonConvert.deserialize(locationJson, City);
        } else {
            location = jsonConvert.deserialize(locationJson, Location);
        }
        return location;
    }
}