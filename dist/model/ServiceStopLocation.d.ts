import Location from "./Location";
declare class ServiceStopLocation extends Location {
    private _code;
    private _shortName;
    private _bearing;
    private _arrival;
    private _departure;
    private _relativeArrival;
    private _relativeDeparture;
    private _wheelchairAccessible;
    readonly code: string;
    readonly shortName: string | null;
    readonly bearing: number | null;
    readonly arrival: number | null;
    readonly departure: number | null;
    readonly relativeArrival: number | null;
    readonly relativeDeparture: number | null;
    readonly wheelchairAccessible: boolean | null;
}
export default ServiceStopLocation;
