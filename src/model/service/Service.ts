import {JsonObject, JsonProperty} from "json2typescript";
import RealTimeVehicle from "./RealTimeVehicle";
import RealTimeAlert from "./RealTimeAlert";

@JsonObject
class Service {

    @JsonProperty("serviceTripID")
    public serviceTripID: string = "";
    @JsonProperty("startStopCode", String, true)
    public startStopCode: string | undefined = undefined;
    @JsonProperty("endStopCode", String, true)
    public endStopCode: string | undefined = undefined;
    @JsonProperty("startTime", Number, true)
    public startTime: number | undefined = undefined;
    @JsonProperty("lastUpdate", Number, true)
    public lastUpdate: number | undefined = undefined;
    @JsonProperty("realtimeVehicle", RealTimeVehicle, true)
    public realtimeVehicle: RealTimeVehicle | undefined = undefined;
    @JsonProperty("realtimeAlternativeVehicle", [RealTimeVehicle], true)
    public realtimeAlternativeVehicle: RealTimeVehicle[] | undefined = undefined;
    @JsonProperty("alerts", [RealTimeAlert], true)
    public alerts: RealTimeAlert[] | undefined = undefined;
    @JsonProperty("operator", String, true)
    public operator: string | undefined = undefined;

}

export default Service;