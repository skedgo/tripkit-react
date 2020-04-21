import ServiceShape from "../trip/ServiceShape";
import RealTimeVehicle from "./RealTimeVehicle";
import RealTimeAlert from "./RealTimeAlert";
import ModeInfo from "../trip/ModeInfo";
declare class ServiceDetail {
    readonly shapes: ServiceShape[] | undefined;
    modeInfo?: ModeInfo;
    readonly realTimeStatus: string | undefined;
    readonly realtimeVehicle: RealTimeVehicle | undefined;
    readonly realtimeAlternativeVehicle: RealTimeVehicle[] | undefined;
    readonly alerts: RealTimeAlert[] | undefined;
    readonly wheelchairAccessible: boolean | undefined;
    readonly bicycleAccessible: boolean | undefined;
}
export default ServiceDetail;
