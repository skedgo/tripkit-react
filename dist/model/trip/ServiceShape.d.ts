import Color from "./Color";
import LatLng from "../LatLng";
import ServiceStopLocation from "../ServiceStopLocation";
declare class ServiceShape {
    private _operator;
    private _serviceTripID;
    private _serviceName;
    private _serviceNumber;
    private _serviceDirection;
    private _serviceColor;
    /**
     * Missing when unknown.
     */
    private _bicycleAccessible;
    /**
     * Missing when unknown.
     */
    private _wheelchairAccessible;
    private _encodedWaypoints;
    private _travelled;
    private _stops;
    private _waypoints;
    get operator(): string;
    get serviceTripID(): string;
    get serviceName(): string | null;
    get serviceNumber(): string | null;
    get serviceDirection(): string | null;
    get serviceColor(): Color | null;
    get bicycleAccessible(): boolean | null;
    get wheelchairAccessible(): boolean | null;
    get encodedWaypoints(): string;
    get travelled(): boolean;
    get stops(): ServiceStopLocation[] | undefined;
    get waypoints(): LatLng[] | null;
}
export default ServiceShape;
