import {Any, JsonObject, JsonProperty} from "json2typescript";
import Location from "../Location";
import ModeInfo from "./ModeInfo";
import ServiceShape from "./ServiceShape";
import Street from "./Street";
import StopLocation from "../StopLocation";
import MapUtil from "../../util/MapUtil";

export enum Visibility {
    IN_DETAILS,
    ON_MAP,
    IN_SUMMARY,
    HIDDEN,
    UNKNOWN
}

@JsonObject
class SegmentTemplate {

    public static Visibility = Visibility;

    @JsonProperty("hashCode", Number, true)
    private _hashCode: number = 0;
    @JsonProperty("from", Location, true)
    private _from: Location = new Location();
    @JsonProperty("to", Location, true)
    private _to: Location = new Location();
    @JsonProperty("modeInfo", ModeInfo, true)
    private _modeInfo: ModeInfo | null = null;
    @JsonProperty("modeIdentifier", String, true)
    private _modeIdentifier: string | null = null;
    @JsonProperty("action", String, true)
    private _action: string | null = null;
    @JsonProperty("notes", String, true)
    private _notes: string = "";
    @JsonProperty("warnings", String, true)
    private _warnings: string = "";
    @JsonProperty("visibility", String, true)
    private _visibility: string | null = null;
    private _visibilityType: Visibility;
    @JsonProperty("type", String, true)
    private _type: string = "";
    @JsonProperty("travelDirection", Number, true)
    private _travelDirection: number | undefined = undefined;
    @JsonProperty("location", Location, true)
    private _location: Location = new Location();
    @JsonProperty("streets", [Street], true)
    private _streets: Street[] | null = null;
    @JsonProperty("shapes", [ServiceShape], true)
    private _shapes: ServiceShape[] | null = null;
    @JsonProperty("stopCode", String, true)
    private _stopCode: string | null = null;
    @JsonProperty("endStopCode", String, true)
    private _endStopCode: string | null = null;
    @JsonProperty("serviceOperator", String, true)
    private _serviceOperator: string = "";
    @JsonProperty("operatorID", String, true)
    private _operatorID: string = "";
    @JsonProperty("isContinuation", Boolean, true)
    private _isContinuation: boolean = false;
    @JsonProperty("durationWithoutTraffic", Number, true)
    private _durationWithoutTraffic: number | null = null;
    @JsonProperty("metres", Number, true)
    private _metres: number | null = null;
    @JsonProperty("metresSafe", Number, true)
    private _metresSafe: number | null = null;
    @JsonProperty("metresUnsafe", Number, true)
    private _metresUnsafe: number | null = null;
    // @Json GWTJsonMini mini;
    @JsonProperty("mini", Any, true)
    private _mini: any = {};

    private _stop: StopLocation | null;
    private _notesList: string[] | null = null;

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        // Empty constructor
    }

    private _arrival: boolean = false;

    get hashCode(): number {
        return this._hashCode;
    }

    set hashCode(value: number) {
        this._hashCode = value;
    }

    get from(): Location {
        return !this._from.isResolved() ? this._location : this._from;
    }

    set from(value: Location) {
        this._from = value;
    }

    get to(): Location {
        return !this._to.isResolved() ? this._location : this._to;
    }

    set to(value: Location) {
        this._to = value;
    }

    get modeInfo(): ModeInfo | null {
        return this._modeInfo;
    }

    set modeInfo(value: ModeInfo | null) {
        this._modeInfo = value;
    }

    get modeIdentifier(): string | null {
        return this._modeIdentifier;
    }

    set modeIdentifier(value: string | null) {
        this._modeIdentifier = value;
    }

    get action(): string | null {
        return this._action;
    }

    set action(value: string | null) {
        this._action = value;
    }

    get notes(): string {
        return this._notes;
    }

    set notes(value: string) {
        this._notes = value;
    }

    get warnings(): string {
        return this._warnings;
    }

    set warnings(value: string) {
        this._warnings = value;
    }

    get visibility(): string | null {
        return this._visibility;
    }

    set visibility(value: string | null) {
        this._visibility = value;
    }

    get visibilityType(): Visibility {
        if (!this._visibilityType) {
            this._visibilityType = SegmentTemplate.fromVisibilityS(this.visibility);
        }
        return this._visibilityType;
    }

    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
    }

    get travelDirection(): number | undefined {
        if (this.arrival) {
            return undefined;
        }
        return this._travelDirection ? this._travelDirection : 90 - this.getAngleDegrees();
    }

    set travelDirection(value: number | undefined) {
        this._travelDirection = value;
    }

    get location(): Location {
        return this._location;
    }

    set location(value: Location) {
        this._location = value;
    }

    get streets(): Street[] | null {
        return this._streets;
    }

    set streets(value: Street[] | null) {
        this._streets = value;
    }

    get shapes(): ServiceShape[] | null {
        return this._shapes;
    }

    set shapes(value: ServiceShape[] | null) {
        this._shapes = value;
    }

    get stopCode(): string | null {
        return this._stopCode;
    }

    set stopCode(value: string | null) {
        this._stopCode = value;
    }

    get endStopCode(): string | null {
        return this._endStopCode;
    }

    set endStopCode(value: string | null) {
        this._endStopCode = value;
    }

    get serviceOperator(): string {
        return this._serviceOperator;
    }

    set serviceOperator(value: string) {
        this._serviceOperator = value;
    }

    get operatorID(): string {
        return this._operatorID;
    }

    set operatorID(value: string) {
        this._operatorID = value;
    }

    get isContinuation(): boolean {
        return this._isContinuation;
    }

    set isContinuation(value: boolean) {
        this._isContinuation = value;
    }

    get durationWithoutTraffic(): number | null {
        return this._durationWithoutTraffic;
    }

    set durationWithoutTraffic(value: number | null) {
        this._durationWithoutTraffic = value;
    }

    get metres(): number | null {
        return this._metres;
    }

    set metres(value: number | null) {
        this._metres = value;
    }

    get metresSafe(): number | null {
        return this._metresSafe;
    }

    set metresSafe(value: number | null) {
        this._metresSafe = value;
    }

    get metresUnsafe(): number | null {
        return this._metresUnsafe;
    }

    set metresUnsafe(value: number | null) {
        this._metresUnsafe = value;
    }

    get mini(): any {
        return this._mini;
    }

    set mini(value: any) {
        this._mini = value;
    }

    get stop(): StopLocation | null {
        return this._stop;
    }

    set stop(value: StopLocation | null) {
        this._stop = value;
    }

    get notesList(): string[] | null {
        if (this._notesList === null && this.notes) {
            this._notesList = this.notes.split("\n")
        }
        return this._notesList;
    }

    get arrival(): boolean {
        return this._arrival;
    }

    set arrival(value: boolean) {
        this._arrival = value;
    }

    private static fromVisibilityS(visibilityS: string | null): Visibility {
        switch (visibilityS) {
            case "in summary":
                return Visibility.IN_SUMMARY;
            case "on map":
                return Visibility.ON_MAP;
            case "in details":
                return Visibility.IN_DETAILS;
            case "hidden":
                return Visibility.HIDDEN;
            default:
                return Visibility.UNKNOWN;
        }
    }

    private getAngleDegrees(): number {
        const latDiff =  this.to.lat - this.from.lat;
        const lngDiff = this.to.lng - this.from.lng;
        return MapUtil.toDegrees(Math.atan2(latDiff, lngDiff));
    }
}

export default SegmentTemplate;