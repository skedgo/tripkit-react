import ServiceDeparture from "./ServiceDeparture";
declare class EmbarkationStopResult {
    stopCode: string;
    services: ServiceDeparture[];
    wheelchairAccessible: boolean | undefined;
}
export default EmbarkationStopResult;
