import {JsonObject, JsonProperty} from "json2typescript";
import Color from "../trip/Color";
import ModeInfo from "../trip/ModeInfo";
import StopLocation from "../StopLocation";
import RTServiceDepartureUpdate from "./RTServiceDepartureUpdate";
import ServiceDetail from "./ServiceDetail";
import RealTimeVehicle from "./RealTimeVehicle";
import RealTimeAlert, {AlertSeverity} from "./RealTimeAlert";
import {alertSeverity} from "../trip/Segment";
import {TranslationFunction} from "../../i18n/TKI18nProvider";

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
    @JsonProperty("serviceTextColor", Color, true)
    public serviceTextColor: Color | undefined = undefined;
    @JsonProperty("bicycleAccessible", Boolean, true)
    public bicycleAccessible: boolean | undefined = undefined;
    @JsonProperty("wheelchairAccessible", Boolean, true)
    public wheelchairAccessible: boolean | undefined = undefined;
    @JsonProperty("startTime")
    public startTime: number = -1;
    @JsonProperty("endTime", Number, true)
    public endTime: number | undefined = undefined;
    @JsonProperty("modeInfo", ModeInfo)
    public modeInfo: ModeInfo = new ModeInfo();
    @JsonProperty("realTimeStatus", String, true)   // "IS_REAL_TIME" "CAPABLE" "INCAPABLE" "CANCELLED"
    public realTimeStatus: string | undefined = undefined;
    @JsonProperty("realTimeDeparture", Number, true)
    private _realTimeDeparture: number | undefined = undefined;
    @JsonProperty("realTimeArrival", Number, true)
    public _realTimeArrival: number | undefined = undefined;
    @JsonProperty("realtimeVehicle", RealTimeVehicle, true)
    private _realtimeVehicle: RealTimeVehicle | undefined = undefined;
    @JsonProperty("realtimeAlternativeVehicle", [RealTimeVehicle], true)
    public realtimeAlternativeVehicle: RealTimeVehicle[] | undefined = undefined;
    @JsonProperty("alertHashCodes", [Number], true)
    public alertHashCodes: number[] = [];
    @JsonProperty("endStopCode", String, true) // It comes when disembarkation stop was specified.
    public endStopCode?: string = undefined;

    public startStop?: StopLocation;
    public startStopCode: string = "";
    public startTimezone: string = "";  // startStop also has it, but sometimes startStop couldn't be set.
    public endStop?: StopLocation; // It's set when endStopCode comes (see endStopCode comment above)
    public realtimeUpdate: RTServiceDepartureUpdate = new RTServiceDepartureUpdate();
    public serviceDetail: ServiceDetail | undefined;

    public alerts: RealTimeAlert[] = [];

    get realTimeDeparture(): number | undefined {
        return this.realtimeUpdate && this.realtimeUpdate.startTime ? this.realtimeUpdate.startTime : this._realTimeDeparture;
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

    get realtimeVehicle(): RealTimeVehicle | undefined {
        return this.realtimeUpdate && this.realtimeUpdate.realtimeVehicle ? this.realtimeUpdate.realtimeVehicle :
            this.serviceDetail && this.serviceDetail.realtimeVehicle ? this.serviceDetail.realtimeVehicle :
                this._realtimeVehicle;
    }

    get hasAlerts(): boolean {
        return this.alerts.length > 0;
    }

    get alertSeverity(): AlertSeverity {
        return alertSeverity(this.alerts);
    }

    public isWheelchairAccessible(): boolean | undefined {
        if (this.startStop && this.startStop.wheelchairAccessible === false ||
            this.endStop && this.endStop.wheelchairAccessible === false) {
            return false;
        }
        return this.wheelchairAccessible;
    }

}

export default ServiceDeparture;