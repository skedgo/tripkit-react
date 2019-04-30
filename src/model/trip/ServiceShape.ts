import {JsonObject, JsonProperty} from "json2typescript";
import Color from "./Color";
import LatLng from "../LatLng";
import ServiceStopLocation from "../ServiceStopLocation";
import LeafletUtil from "../../util/LeafletUtil";

@JsonObject
class ServiceShape {
    @JsonProperty("operator", String, true) // Documentation says it's required, however sometimes is missing.
    private _operator: string = "";
    @JsonProperty("serviceTripID", String, true)  // Documentation says it's required, however sometimes is missing.
    private _serviceTripID: string = "";
    @JsonProperty("serviceName", String, true)
    private _serviceName: string | null = null;
    @JsonProperty("serviceNumber", String, true)
    private _serviceNumber: string | null = null;
    @JsonProperty("serviceDirection", String, true)
    private _serviceDirection: string | null = null;
    @JsonProperty("serviceColor", String, true)
    private _serviceColor: Color | null = null;
    /**
     * Missing when unknown.
     */
    @JsonProperty("bicycleAccessible", Boolean, true)
    private _bicycleAccessible: boolean | null = null;
    /**
     * Missing when unknown.
     */
    @JsonProperty("wheelchairAccessible", Boolean, true)
    private _wheelchairAccessible: boolean | null = null;
    @JsonProperty("encodedWaypoints", String)
    private _encodedWaypoints: string = "";
    @JsonProperty("travelled", Boolean)
    private _travelled: boolean = true;
    @JsonProperty("stops", [ServiceStopLocation], true)
    private _stops: ServiceStopLocation[] | undefined = undefined;

    private _waypoints: LatLng[] | null = null;

    get operator(): string {
        return this._operator;
    }

    get serviceTripID(): string {
        return this._serviceTripID;
    }

    get serviceName(): string | null {
        return this._serviceName;
    }

    get serviceNumber(): string | null {
        return this._serviceNumber;
    }

    get serviceDirection(): string | null {
        return this._serviceDirection;
    }

    get serviceColor(): Color | null {
        return this._serviceColor;
    }

    get bicycleAccessible(): boolean | null {
        return this._bicycleAccessible;
    }

    get wheelchairAccessible(): boolean | null {
        return this._wheelchairAccessible;
    }

    get encodedWaypoints(): string {
        return this._encodedWaypoints;
    }

    get travelled(): boolean {
        return this._travelled;
    }

    get stops(): ServiceStopLocation[] | undefined {
        return this._stops;
    }

    get waypoints(): LatLng[] | null {
        if (this._waypoints === null && this._encodedWaypoints) {
            this._waypoints = LeafletUtil.decodePolyline(this._encodedWaypoints);
        }
        return this._waypoints;
    }
}

export default ServiceShape;