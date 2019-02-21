import RoutingQuery from "../model/RoutingQuery";
import Trip from "../model/trip/Trip";
import StopLocation from "../model/StopLocation";
declare class TripGoApi {
    static SATAPP: string;
    static SATAPP_STAGING: string;
    static SATAPP_BETA: string;
    static isBetaServer: boolean;
    static apiKey: string;
    static getServer(): string;
    static apiCall(endpoint: string, method: string, body?: any): Promise<any>;
    static getSatappUrl(endpoint: string): string;
    static apiCallUrl(url: string, method: string, body?: any, prod?: boolean): Promise<any>;
    static updateRT(trip: Trip, query: RoutingQuery): Promise<Trip | undefined>;
    static findStopFromCode(regionCode: string, stopCode: string): Promise<StopLocation>;
}
export default TripGoApi;
