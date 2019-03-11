import {JsonObject, JsonProperty} from "json2typescript";
import RealTimeVehicle from "./RealTimeVehicle";
import RealTimeAlert from "./RealTimeAlert";

@JsonObject
class Service {

    @JsonProperty("serviceTripID")
    public serviceTripID: string;
    @JsonProperty("startStopCode", String, true)
    public startStopCode: string | undefined;
    @JsonProperty("endStopCode", String, true)
    public endStopCode: string | undefined;
    @JsonProperty("startTime", Number, true)
    public startTime: number | undefined;
    @JsonProperty("lastUpdate", Number, true)
    public lastUpdate: number | undefined;
    @JsonProperty("realtimeVehicle", RealTimeVehicle, true)
    public realtimeVehicle: RealTimeVehicle | undefined;
    @JsonProperty("realtimeAlternativeVehicle", [RealTimeVehicle], true)
    public realtimeAlternativeVehicle: RealTimeVehicle[] | undefined;
    @JsonProperty("alerts", [RealTimeAlert], true)
    public alerts: RealTimeAlert[] | undefined;
    @JsonProperty("operator", String, true)
    public operator: string | undefined;

}

export default Service;