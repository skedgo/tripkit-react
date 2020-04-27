import {JsonObject, JsonProperty} from "json2typescript";
import LocationInfoDetails from "./LocationInfoDetails";
import RealTimeAlert from "../service/RealTimeAlert";
import StopLocation from "../StopLocation";

@JsonObject
class TKLocationInfo {

    @JsonProperty("lat", Number)
    public readonly lat: number = 0;
    @JsonProperty("lng", Number)
    public readonly lng: number = 0;
    @JsonProperty("details", LocationInfoDetails, true)
    public readonly details?: LocationInfoDetails = undefined;
    @JsonProperty('alerts', [RealTimeAlert], true)
    public alerts: RealTimeAlert[] = [];
    @JsonProperty("stop", StopLocation, true)
    public readonly stop?: StopLocation = undefined;

}

export default TKLocationInfo;