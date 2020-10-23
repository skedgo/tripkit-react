import {JsonObject, JsonProperty} from "json2typescript";
import ModeLocation from "./ModeLocation";

@JsonObject
class FacilityLocation extends ModeLocation {

    @JsonProperty("facilityType", String)
    public facilityType: string = "";

}

export default FacilityLocation;