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
    readonly operator: string;
    readonly serviceTripID: string;
    readonly serviceName: string | null;
    readonly serviceNumber: string | null;
    readonly serviceDirection: string | null;
    readonly serviceColor: Color | null;
    readonly bicycleAccessible: boolean | null;
    readonly wheelchairAccessible: boolean | null;
    readonly encodedWaypoints: string;
    readonly travelled: boolean;
    readonly stops: ServiceStopLocation[] | null;
    readonly waypoints: LatLng[] | null;
}
export default ServiceShape;
