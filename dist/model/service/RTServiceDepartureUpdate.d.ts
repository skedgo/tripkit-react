import RealTimeVehicle from "./RealTimeVehicle";
import RealTimeAlert from "./RealTimeAlert";
declare class RTServiceDepartureUpdate {
    serviceTripID: string;
    startStopCode: string | undefined;
    endStopCode: string | undefined;
    startTime: number | undefined;
    lastUpdate: number | undefined;
    realtimeVehicle: RealTimeVehicle | undefined;
    realtimeAlternativeVehicle: RealTimeVehicle[] | undefined;
    alerts: RealTimeAlert[] | undefined;
    operator: string | undefined;
}
export default RTServiceDepartureUpdate;
