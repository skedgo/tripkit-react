import {JsonObject, JsonProperty} from "json2typescript";
import Color from "../trip/Color";
import ModeInfo from "../trip/ModeInfo";
import StopLocation from "../StopLocation";
import Service from "./Service";
import ServiceDetail from "./ServiceDetail";

@JsonObject
class ServiceDeparture {

    @JsonProperty("operator")
    public operator: string = "";
    @JsonProperty("serviceTripID")
    public serviceTripID: string = "";
    @JsonProperty("serviceName", String, true)
    public serviceName: string | undefined = undefined;
    @JsonProperty("serviceNumber", String, true)
    public serviceNumber: string | undefined = undefined;
    @JsonProperty("serviceDirection", String, true)
    public serviceDirection: string | undefined = undefined;
    @JsonProperty("serviceColor", Color, true)
    public serviceColor: Color | undefined = undefined;
    @JsonProperty("bicycleAccessible", Boolean, true)
    public bicycleAccessible: boolean | undefined = undefined;
    @JsonProperty("wheelchairAccessible", Boolean, true)
    public wheelchairAccessible: boolean | undefined = undefined;
    @JsonProperty("startTime")
    public startTime: number = -1;
    @JsonProperty("endTime", Number, true)
    public endTime: number | undefined = undefined;
    @JsonProperty("modeInfo")
    public modeInfo: ModeInfo = new ModeInfo();
    @JsonProperty("realTimeStatus", String, true)   // "IS_REAL_TIME" "CAPABLE" "INCAPABLE" "CANCELLED"
    public realTimeStatus: string | undefined = undefined;
    @JsonProperty("realTimeDeparture", Number, true)
    private _realTimeDeparture: number | undefined = undefined;
    @JsonProperty("realTimeArrival", Number, true)
    public _realTimeArrival: number | undefined = undefined;
    // @JsonProperty("realtimeVehicle", RealTimeVehicle, true)
    // public realtimeVehicle: RealTimeVehicle | undefined = undefined;
    // @JsonProperty("realtimeVehicle", [RealTimeVehicle], true)
    // public realtimeAlternativeVehicle: RealTimeVehicle[] | undefined = undefined;
    // @JsonProperty("alerts", [RealTimeAlert], true)
    // public alerts: [RealTimeAlert] | undefined = undefined;

    public startStop: StopLocation | undefined;
    public startStopCode: string = "";
    public service: Service = new Service();
    public serviceDetail: ServiceDetail | undefined;


    get realTimeDeparture(): number | undefined {
        return this.service && this.service.startTime ? this.service.startTime : this._realTimeDeparture;
    }

    get actualStartTime(): number {
        return this.realTimeDeparture ? this.realTimeDeparture : this.startTime;
    }

    get realTimeArrival(): number | undefined {
        // return this.service && this.service.startTime ? this.service.startTime : this._realTimeArrival;
        return this._realTimeArrival;
    }

    get actualEndTime(): number | undefined {
        return this.realTimeArrival ? this.realTimeArrival : this.endTime;
    }
}

export default ServiceDeparture;