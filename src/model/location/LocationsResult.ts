import {JsonObject, JsonProperty} from "json2typescript";
import BikePodLocation from "./BikePodLocation";
import FacilityLocation from "./FacilityLocation";
import CarParkLocation from "./CarParkLocation";
import {MapLocationType} from "./MapLocationType";
import Location from "../Location";
import StopLocation from "../StopLocation";

@JsonObject
class LocationsResult {

    constructor(level: 1 | 2 = 1) {
        this._level = level;
    }

    @JsonProperty("key", String)
    private _key: string = "";

    @JsonProperty("hashCode", Number)
    private _hashCode: number = 0;

    @JsonProperty("bikePods", [BikePodLocation], true)
    private _bikePods: BikePodLocation[] | undefined = undefined;

    @JsonProperty("facilities", [FacilityLocation], true)
    private _facilities: FacilityLocation[] | undefined = undefined;

    @JsonProperty("carParks", [CarParkLocation], true)
    private _carParks: CarParkLocation[] | undefined = undefined;

    @JsonProperty("stops", [StopLocation], true)
    private _stops: StopLocation[] | undefined = undefined;

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

    get bikePods(): BikePodLocation[] | undefined {
        return this._bikePods;
    }

    set bikePods(value: BikePodLocation[] | undefined) {
        this._bikePods = value;
    }

    get facilities(): FacilityLocation[] | undefined {
        return this._facilities;
    }

    set facilities(value: FacilityLocation[] | undefined) {
        this._facilities = value;
    }

    get carParks(): CarParkLocation[] | undefined {
        return this._carParks;
    }

    set carParks(value: CarParkLocation[] | undefined) {
        this._carParks = value;
    }

    get stops(): StopLocation[] | undefined {
        return this._stops;
    }

    set stops(value: StopLocation[] | undefined) {
        this._stops = value;
    }

    get level(): 1 | 2 {
        return this._level;
    }

    set level(value: 1 | 2) {
        this._level = value;
    }

    public add(other: LocationsResult): void {
        if (other.bikePods) {
            if (!this.bikePods) {
                this.bikePods = [];
            }
            this.bikePods = this.bikePods.concat(other.bikePods);
        }
        if (other.facilities) {
            if (!this.facilities) {
                this.facilities = [];
            }
            this.facilities = this.facilities.concat(other.facilities);
        }
        if (other.carParks) {
            if (!this.carParks) {
                this.carParks = [];
            }
            this.carParks = this.carParks.concat(other.carParks);
        }
        if (other.stops) {
            if (!this.stops) {
                this.stops = [];
            }
            this.stops = this.stops.concat(other.stops);
        }
    }

    public isEmpty(): boolean {
        return !this.bikePods && !this.facilities;
    }

    public getByType(type: MapLocationType): Location[] {
        switch (type) {
            case MapLocationType.BIKE_POD:
                return this.bikePods ? this.bikePods : [];
            case MapLocationType.PARK_AND_RIDE_FACILITY:
                return this.facilities ? this.facilities.filter((facility: FacilityLocation) =>
                    facility.facilityType.toLowerCase() === "park-and-ride") : [];
            case MapLocationType.MY_WAY_FACILITY:
                return this.facilities ? this.facilities.filter((facility: FacilityLocation) =>
                    facility.facilityType.toLowerCase() === "myway-retail-agent") : [];
            case MapLocationType.CAR_PARK:
                return this.carParks ? this.carParks : [];
            case MapLocationType.STOP:
                return this.stops ? this.stops : [];
            default: // TODO Complete with other location types.
                return [];
        }
    }
}

export default LocationsResult;