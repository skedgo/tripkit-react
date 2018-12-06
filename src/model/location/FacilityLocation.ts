import {JsonObject, JsonProperty} from "json2typescript";
import Location from "../Location";

@JsonObject
class FacilityLocation extends Location {
    @JsonProperty("facilityType", String)
    private _facilityType: string = "";

    get facilityType(): string {
        return this._facilityType;
    }
}

export default FacilityLocation;