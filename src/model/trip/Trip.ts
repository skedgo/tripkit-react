import {JsonObject, JsonProperty} from "json2typescript";
import Segment from "./Segment";
import Util from "../../util/Util";
import {Visibility} from "./SegmentTemplate";

@JsonObject
class Trip {

    @JsonProperty("depart", Number, true)
    private _depart: number = 0;
    @JsonProperty("arrive", Number, true)
    private _arrive: number = 0;
    @JsonProperty("weightedScore", Number, true)
    private _weightedScore: number = 0;
    @JsonProperty("queryIsLeaveAfter", Boolean, true)
    public queryIsLeaveAfter: boolean | null = null;    // Don't set as readonly since I want to set it when results come from waypoints.json
    @JsonProperty("queryTime", Number, true)
    public queryTime: number | null = null;             // Don't set as readonly since I want to set it when results come from waypoints.json
    @JsonProperty("currencySymbol", String, true)
    private _currencySymbol: string | null = null;
    @JsonProperty("moneyCost", Number, true)
    private _moneyCost: number | null = null;
    @JsonProperty("moneyUSDCost", Number, true)
    private _moneyUSDCost: number | null = 0;
    @JsonProperty("carbonCost", Number, true)   // Required according to spec, but sometimes don't come.
    private _carbonCost: number = 0;
    @JsonProperty("hassleCost", Number, true)   // Required according to spec, but sometimes don't come.
    private _hassleCost: number = 0;
    @JsonProperty("caloriesCost", Number, true) // Required according to spec, but sometimes don't come.
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

    private _satappQuery: string = "";
    private _arrivalSegment: Segment | undefined;


    get depart(): number {
        return this._depart;
    }

    get arrive(): number {
        return this._arrive;
    }

    get weightedScore(): number {
        return this._weightedScore;
    }

    get currencySymbol(): string | null {
        return this._currencySymbol;
    }

    get moneyCost(): number | null {
        if (!this.hasPublicTransport() && this._moneyCost) {
            return Math.ceil(this._moneyCost)
        }
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

    public getSegments(visibility?: Visibility): Segment[] {
        return !visibility ? this._segments : this._segments.filter((segment: Segment) => segment.hasVisibility(visibility));
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
                if (segment.wheelchairAccessible === undefined) {
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

    public isSingleSegment(visibility?: Visibility): boolean {
        return this.getSegments(visibility).length === 1;
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

    /**
     * Artificial segment representing the trip arrival. It's not in trip segments array.
     */
    get arrivalSegment(): Segment {
        if (!this._arrivalSegment) {
            const last: Segment = this.segments[this.segments.length - 1];
            this._arrivalSegment = Util.iAssign(last, {});
            this._arrivalSegment.arrival = true;
            this._arrivalSegment.from = last.to;
            this._arrivalSegment.startTime = last.endTime;
            this._arrivalSegment.action = "Arrive";
            this._arrivalSegment.streets = [];
            this._arrivalSegment.shapes = [];
        }
        return this._arrivalSegment;
    }

    get duration(): number {
        return this.arrive - this.depart;
    }
}

export default Trip;