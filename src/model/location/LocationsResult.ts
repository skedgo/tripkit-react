import { Any, JsonObject, JsonProperty } from "json2typescript";
import BikePodLocation from "./BikePodLocation";
import FacilityLocation from "./FacilityLocation";
import CarParkLocation from "./CarParkLocation";
import StopLocation from "../StopLocation";
import ModeIdentifier from "../region/ModeIdentifier";
import ModeLocation from "./ModeLocation";
import FreeFloatingVehicleLocation from "./FreeFloatingVehicleLocation";
import CarRentalLocation from "./CarRentalLocation";
import CarPodLocation from "./CarPodLocation";
import TripGoApi from "../../api/TripGoApi";

enum ModeFields {
    bikePods = "bikePods",
    facilities = "facilities",
    carParks = "carParks",
    carPods = "carPods", // For car share (e.g. CND, GoGet)
    carRentals = "carRentals",
    freeFloating = "freeFloating",
    stops = "stops",
}

interface ILocationsRequestOptions {
    server: string;
    apiKey: string;
}

@JsonObject
class LocationsResult {

    private static isFieldIncluded(field: ModeFields, modes: string[]): boolean {
        return modes.some((mode: string) => this.isFieldIncludedByMode(field, mode));
    }

    private static isFieldIncludedByMode(field: ModeFields, mode: string): boolean {
        switch (field) {
            case ModeFields.carParks: return mode.startsWith(ModeIdentifier.CAR_ID);
            case ModeFields.carPods: return mode.startsWith(ModeIdentifier.CAR_SHARE_ID);
            case ModeFields.carRentals: return mode.startsWith(ModeIdentifier.CAR_RENTAL_ID);
            case ModeFields.bikePods: return mode.startsWith(ModeIdentifier.BICYCLE_SHARE_ID);
            case ModeFields.freeFloating: return mode.startsWith(ModeIdentifier.BICYCLE_SHARE_ID) || mode.startsWith(ModeIdentifier.MICROMOBILITY_SHARE_ID);
            case ModeFields.stops: return mode.startsWith(ModeIdentifier.PUBLIC_TRANSPORT_ID);
            case ModeFields.facilities: return true;
            default: return false;
        }
    }

    public static isModeRelevant(mode: string): boolean {
        return Object.values(ModeFields).some((field: ModeFields) => this.isFieldIncludedByMode(field, mode));
    }

    constructor(level: 1 | 2 = 1, modes?: string[]) {
        this._level = level;
        this.modes = modes || [];
    }

    /**
     * Cache related field. Records the time of the last request for the cell, in secs since epoch. It starts in 0 when it's loaded 
     * from LS caché, reflecting it's old and will require a refresh. It is reset to now when it comes from a request (the first one
     * or a refresh).
     */
    @JsonProperty("requestTime", Number, true)
    public requestTime: number = 0;

    /**
     * Cache related field. Indicates we requested results (or a refresh) for this level + key and we are still awaiting, so to avoid asking
     * for it in the meanwhile.
     * @type {boolean}
     */
    public requesting: boolean = false;

    /**
     * Cache related field. To make cache dependent on server and api key.     
     */
    @JsonProperty("requestOptions", Any, true)
    public requestOptions: ILocationsRequestOptions = { server: TripGoApi.server, apiKey: TripGoApi.apiKey };

    /**
     * Requested modes. Fill this when building. Need to declare as JsonProperty so it's serialized / deserialized when
     * parsisting on caché on LS.
     */
    @JsonProperty("modes", [String], true)
    public modes: string[] = [];

    @JsonProperty("key", String)
    private _key: string = "";

    @JsonProperty("hashCode", Number)
    private _hashCode: number = 0;

    @JsonProperty(ModeFields.bikePods, [BikePodLocation], true)
    public bikePods: BikePodLocation[] | undefined = undefined;

    @JsonProperty(ModeFields.freeFloating, [FreeFloatingVehicleLocation], true)
    public freeFloating: FreeFloatingVehicleLocation[] | undefined = undefined;

    @JsonProperty(ModeFields.carParks, [CarParkLocation], true)
    public carParks: CarParkLocation[] | undefined = undefined;

    @JsonProperty(ModeFields.carRentals, [CarRentalLocation], true)
    public carRentals: CarRentalLocation[] | undefined = undefined;

    @JsonProperty(ModeFields.carPods, [CarPodLocation], true)
    public carPods: CarPodLocation[] | undefined = undefined;

    @JsonProperty(ModeFields.stops, [StopLocation], true)
    public stops: StopLocation[] | undefined = undefined;

    @JsonProperty(ModeFields.facilities, [FacilityLocation], true)
    public facilities: FacilityLocation[] | undefined = undefined;

    private _level: 1 | 2;

    get key(): string {
        return this._key;
    }

    set key(value: string) {
        this._key = value;
    }

    get hashCode(): number {
        return this._hashCode;
    }

    set hashCode(value: number) {
        this._hashCode = value;
    }

    get level(): 1 | 2 {
        return this._level;
    }

    set level(value: 1 | 2) {
        this._level = value;
    }

    public add(other: LocationsResult): void {
        for (const modeField of Object.values(ModeFields)) {
            if (other[modeField] && LocationsResult.isFieldIncluded(modeField, this.modes)) {
                if (!this[modeField]) {
                    this[modeField] = [];
                }
                this[modeField] = (this[modeField] as any[])!
                    .concat((other[modeField] as any[])!.filter(loc =>
                        // Filter out those facilities that we still don't support.
                        modeField === ModeFields.facilities ?
                            ((loc as FacilityLocation).facilityType === "MyWay-Retail-Agent" || (loc as FacilityLocation).facilityType === "Water-Fountain") : true));
            }
        }
    }

    public getLocations(): ModeLocation[] {
        return Object.values(ModeFields).reduce((accum: ModeLocation[], current: ModeFields) =>
            this[current] ? accum.concat(this[current] as ModeLocation[]) : accum, []);
    }

    public isEmpty(): boolean {
        return !this.bikePods && !this.facilities;
    }
}

export default LocationsResult;