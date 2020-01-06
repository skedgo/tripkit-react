import {JsonObject, JsonProperty} from "json2typescript";
import ServiceShape from "../trip/ServiceShape";
import RealTimeVehicle from "./RealTimeVehicle";
import RealTimeAlert from "./RealTimeAlert";
import ModeInfo from "../trip/ModeInfo";

@JsonObject
class ServiceDetail {

    @JsonProperty("shapes", [ServiceShape], true)
    public readonly shapes: ServiceShape[] | undefined = undefined;
    @JsonProperty('modeInfo', ModeInfo, true)
    public modeInfo?: ModeInfo = undefined;
    @JsonProperty("realTimeStatus", String, true)   // "IS_REAL_TIME" "CAPABLE" "INCAPABLE" "CANCELLED"
    public readonly realTimeStatus: string | undefined = undefined;
    @JsonProperty("realtimeVehicle", RealTimeVehicle, true)
    public readonly realtimeVehicle: RealTimeVehicle | undefined = undefined;
    @JsonProperty("realtimeAlternativeVehicle", [RealTimeVehicle], true)
    public readonly realtimeAlternativeVehicle: RealTimeVehicle[] | undefined = undefined;
    @JsonProperty("alerts", [RealTimeAlert], true)
    public readonly alerts: RealTimeAlert[] | undefined = undefined;
    @JsonProperty("wheelchairAccessible", Boolean, true)
    public readonly wheelchairAccessible: boolean | undefined = undefined;
    @JsonProperty("bicycleAccessible", Boolean, true)
    public readonly bicycleAccessible: boolean | undefined = undefined;

}

export default ServiceDetail;