import Location from "../Location";
import ModeInfo from "./ModeInfo";
import ServiceShape from "./ServiceShape";
import Street from "./Street";
import StopLocation from "../StopLocation";
export declare enum Visibility {
    HIDDEN = 0,
    IN_DETAILS = 1,
    ON_MAP = 2,
    IN_SUMMARY = 3,
    UNKNOWN = 4
}
declare class SegmentTemplate {
    static Visibility: typeof Visibility;
    private _hashCode;
    private _from;
    private _to;
    modeInfo?: ModeInfo;
    private _modeIdentifier;
    private _action;
    private _notes;
    private _warnings;
    private _visibility;
    private _visibilityType;
    private _type;
    private _travelDirection;
    private _location;
    private _streets;
    private _shapes;
    private _stopCode;
    private _endStopCode;
    private _serviceOperator;
    private _operatorID;
    private _isContinuation;
    private _durationWithoutTraffic;
    metres: number | undefined;
    metresSafe: number | undefined;
    metresUnsafe: number | undefined;
    metresDismount: number | undefined;
    private _mini;
    private _stop;
    private _notesList;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    private _arrival;
    get hashCode(): number;
    set hashCode(value: number);
    get from(): Location;
    set from(value: Location);
    get to(): Location;
    set to(value: Location);
    get modeIdentifier(): string | null;
    set modeIdentifier(value: string | null);
    get action(): string | null;
    set action(value: string | null);
    get notes(): string;
    set notes(value: string);
    get warnings(): string;
    set warnings(value: string);
    get visibility(): string | null;
    set visibility(value: string | null);
    get visibilityType(): Visibility;
    hasVisibility(visibility: Visibility): boolean;
    get type(): string;
    set type(value: string);
    get travelDirection(): number | undefined;
    set travelDirection(value: number | undefined);
    get location(): Location;
    set location(value: Location);
    get streets(): Street[] | undefined;
    set streets(value: Street[] | undefined);
    get shapes(): ServiceShape[] | undefined;
    set shapes(value: ServiceShape[] | undefined);
    get stopCode(): string | null;
    set stopCode(value: string | null);
    get endStopCode(): string | null;
    set endStopCode(value: string | null);
    get serviceOperator(): string;
    set serviceOperator(value: string);
    get operatorID(): string;
    set operatorID(value: string);
    get isContinuation(): boolean;
    set isContinuation(value: boolean);
    get durationWithoutTraffic(): number | null;
    set durationWithoutTraffic(value: number | null);
    get mini(): any;
    set mini(value: any);
    get stop(): StopLocation | null;
    set stop(value: StopLocation | null);
    get notesList(): string[] | null;
    get arrival(): boolean;
    set arrival(value: boolean);
    private static fromVisibilityS;
    private getAngleDegrees;
}
export default SegmentTemplate;
