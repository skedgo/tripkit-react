import StopLocation from "../StopLocation";
import Location from "../Location";
import { JsonConverter, JsonCustomConvert, JsonConvert } from "json2typescript";
import Util from "../../util/Util";
import ModeInfo from "../trip/ModeInfo";
import City from "./City";
import CarPodLocation from "./CarPodLocation";
import SchoolLocation from "./SchoolLocation";

@JsonConverter
export class LocationConverter implements JsonCustomConvert<Location> {

    private static _instance: LocationConverter;

    public static get instance(): LocationConverter {
        if (!LocationConverter._instance) {
            LocationConverter._instance = new LocationConverter();
        }
        return LocationConverter._instance;
    }



    public serialize(location: Location): any {
        const jsonConvert = new JsonConvert();
        return jsonConvert.serialize(location);
    }
    public deserialize(locationJson: any): Location {
        let location: Location;
        if (locationJson.class === "StopLocation" || locationJson.class === "ParentStopLocation") {
            // Needs to set modeInfo since it incorrectly comes with value {}, which causes a parsing error.
            // Tried setting to undefined, and put modeInfo as optional in StopLocation but json2typescript gave an
            // exception of missing modeInfo when compiled.
            if (locationJson.modeInfo && Util.isEmpty(locationJson.modeInfo)) {
                locationJson.modeInfo = Util.serialize(new ModeInfo());
            }
            location = Util.deserialize(locationJson, StopLocation);
        } else if (locationJson.carPod) {
            location = Util.deserialize(locationJson, CarPodLocation);
        }
        else if (locationJson.class === "CityLocation") {
            location = Util.deserialize(locationJson, City);
        } else if (locationJson.class === "SchoolLocation") {
            location = Util.deserialize(locationJson, SchoolLocation);
        } else {
            location = Util.deserialize(locationJson, Location);
        }
        return location;
    }
}