import LatLng from "./LatLng";
declare class ServiceStopLocation extends LatLng {
    private _code;
    name: string;
    private _shortName;
    private _bearing;
    private _arrival;
    private _departure;
    private _relativeArrival;
    private _relativeDeparture;
    private _wheelchairAccessible;
    get code(): string;
    get shortName(): string | null;
    get bearing(): number | undefined;
    get arrival(): number | null;
    get departure(): number | null;
    get relativeArrival(): number | null;
    get relativeDeparture(): number | null;
    get wheelchairAccessible(): boolean | null;
}
export default ServiceStopLocation;
