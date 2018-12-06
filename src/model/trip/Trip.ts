import {JsonObject, JsonProperty} from "json2typescript";
import Segment from "./Segment";

@JsonObject
class Trip {

    @JsonProperty("depart", Number, true)
    private _depart: number = 0;
    @JsonProperty("arrive", Number, true)
    private _arrive: number = 0;
    @JsonProperty("weightedScore", Number, true)
    private _weightedScore: number = 0;
    @JsonProperty("queryIsLeaveAfter", Boolean, true)
    private _queryIsLeaveAfter: boolean | null = null;
    @JsonProperty("queryTime", Number, true)
    private _queryTime: number | null = null;
    @JsonProperty("currencySymbol", String, true)
    private _currencySymbol: string | null = null;
    @JsonProperty("moneyCost", Number, true)
    private _moneyCost: number | null = 0;
    @JsonProperty("moneyUSDCost", Number, true)
    private _moneyUSDCost: number | null = 0;
    @JsonProperty("carbonCost", Number, true)
    private _carbonCost: number = 0;
    @JsonProperty("hassleCost", Number, true)
    private _hassleCost: number = 0;
    @JsonProperty("caloriesCost", Number, true)
    private _caloriesCost: number = 0;
    @JsonProperty("saveURL", String, true)
    private _saveURL: string = "";
    @JsonProperty("updateURL", String, true)
    private _updateURL: string = "";
    @JsonProperty("temporaryURL", String, true)
    private _temporaryURL: string = "";
    @JsonProperty("plannedURL", String, true)
    private _plannedURL: string = "";
    @JsonProperty("segments", [Segment], true)
    private _segments: Segment[] = [];

    private _satappQuery: string;


    get depart(): number {
        return this._depart;
    }

    get arrive(): number {
        return this._arrive;
    }

    get weightedScore(): number {
        return this._weightedScore;
    }

    get queryIsLeaveAfter(): boolean | null {
        return this._queryIsLeaveAfter;
    }

    get queryTime(): number | null {
        return this._queryTime;
    }

    get currencySymbol(): string | null {
        return this._currencySymbol;
    }

    get moneyCost(): number | null {
        return this._moneyCost;
    }

    get moneyUSDCost(): number | null {
        return this._moneyUSDCost;
    }

    get carbonCost(): number {
        return this._carbonCost;
    }

    get hassleCost(): number {
        return this._hassleCost;
    }

    get caloriesCost(): number {
        return this._caloriesCost;
    }

    get saveURL(): string {
        return this._saveURL;
    }

    get updateURL(): string {
        return this._updateURL;
    }

    get temporaryURL(): string {
        return this._temporaryURL;
    }

    get plannedURL(): string {
        return this._plannedURL;
    }

    get segments(): Segment[] {
        return this._segments;
    }

    public hasPublicTransport(): boolean {
        if (this.segments.length === 0) {
            return false;
        }
        // TODO improve detection of isPublicTransport on segment.
        return this.segments.find((segment: Segment) => segment.isPT()) !== undefined;
    }

    public hasBicycle(): boolean {
        if (this.segments.length === 0) {
            return false;
        }
        return this.segments.find((segment: Segment) => segment.isBicycle()) !== undefined;
    }

    public isBicycleTrip(): boolean {
        return this.hasBicycle() &&
            this.segments.every((segment: Segment) => segment.isBicycle() || segment.isWalking() || segment.type === "stationary");
    }

    public getWheelchairAccessible(): boolean | null {
        if (!this.hasPublicTransport()) {
            return null;
        }
        let wheelchairAccessible: boolean | null = true;
        for (const segment of this.segments) {
            if (segment.isPT()) {
                if (segment.wheelchairAccessible === false) {
                    return false;   // if one segment is not accessible, the trip is not accessible
                }
                if (segment.wheelchairAccessible === null) {
                    wheelchairAccessible = null;   // trip accessibility is at most null, can still become false
                }
            }
        }
        return wheelchairAccessible;
    }

    public getBicycleAccessible(): boolean | null {
        if (!this.hasPublicTransport()) {
            return null;
        }
        let bicycleAccessible: boolean | null = true;
        for (const segment of this.segments) {
            if (segment.isPT()) {
                if (segment.bicycleAccessible === false) {
                    return false;   // if one segment is not accessible, the trip is not accessible
                }
                if (segment.bicycleAccessible === null) {
                    bicycleAccessible = null;   // trip accessibility is at most null, can still become false
                }
            }
        }
        return bicycleAccessible;
    }

    public isSingleSegment(): boolean {
        return this.segments.length === 1;
    }

    public getKey(): string {
        return (this.saveURL ? this.saveURL : String(this.weightedScore));
    }

    get satappQuery(): string {
        return this._satappQuery;
    }

    set satappQuery(value: string) {
        this._satappQuery = value;
    }
}

export default Trip;