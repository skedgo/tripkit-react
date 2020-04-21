import Color from "../trip/Color";
import ModeInfo from "../trip/ModeInfo";
import StopLocation from "../StopLocation";
import RTServiceDepartureUpdate from "./RTServiceDepartureUpdate";
import ServiceDetail from "./ServiceDetail";
import RealTimeVehicle from "./RealTimeVehicle";
import RealTimeAlert, { AlertSeverity } from "./RealTimeAlert";
declare class ServiceDeparture {
    operator: string;
    serviceTripID: string;
    serviceName: string | undefined;
    serviceNumber: string | undefined;
    serviceDirection: string | undefined;
    serviceColor: Color | undefined;
    bicycleAccessible: boolean | undefined;
    wheelchairAccessible: boolean | undefined;
    startTime: number;
    endTime: number | undefined;
    modeInfo: ModeInfo;
    realTimeStatus: string | undefined;
    private _realTimeDeparture;
    _realTimeArrival: number | undefined;
    private _realtimeVehicle;
    realtimeAlternativeVehicle: RealTimeVehicle[] | undefined;
    alertHashCodes: number[];
    endStopCode?: string;
    startStop?: StopLocation;
    startStopCode: string;
    startTimezone: string;
    endStop?: StopLocation;
    realtimeUpdate: RTServiceDepartureUpdate;
    serviceDetail: ServiceDetail | undefined;
    alerts: RealTimeAlert[];
    get realTimeDeparture(): number | undefined;
    get actualStartTime(): number;
    get realTimeArrival(): number | undefined;
    get actualEndTime(): number | undefined;
    get realtimeVehicle(): RealTimeVehicle | undefined;
    get hasAlerts(): boolean;
    get alertSeverity(): AlertSeverity;
    isWheelchairAccessible(): boolean | undefined;
}
export default ServiceDeparture;
