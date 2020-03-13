import {JsonObject, JsonProperty} from "json2typescript";
import LocationInfoDetails from "./LocationInfoDetails";

@JsonObject
class TKLocationInfo {

    @JsonProperty("lat", Number)
    public readonly lat: number = 0;
    @JsonProperty("lng", Number)
    public readonly lng: number = 0;
    @JsonProperty("details", LocationInfoDetails, true)
    public readonly details?: LocationInfoDetails = undefined;

}

export default TKLocationInfo;