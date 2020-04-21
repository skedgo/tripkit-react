import { JsonCustomConvert } from "json2typescript";
import EmbarkationStopResult from "./EmbarkationStopResult";
import StopLocation from "../StopLocation";
import ServiceDeparture from "./ServiceDeparture";
import StopLocationParent from "./StopLocationParent";
import RealTimeAlert from "./RealTimeAlert";
export declare class StopsLocationConverter implements JsonCustomConvert<StopLocation[]> {
    serialize(location: StopLocation[]): any;
    deserialize(locationsJson: any): StopLocation[];
}
declare class ServiceDeparturesResult {
    embarkationStops: EmbarkationStopResult[] | undefined;
    parentInfo: StopLocationParent | undefined;
    alerts: RealTimeAlert[];
    stops: StopLocation[] | undefined;
    private alertsMap;
    isError(): boolean;
    getStopFromCode(code: string): StopLocation | undefined;
    getDepartures(startStop: StopLocation): ServiceDeparture[];
}
export default ServiceDeparturesResult;
