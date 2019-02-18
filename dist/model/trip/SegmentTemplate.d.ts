import Location from "../Location";
import ModeInfo from "./ModeInfo";
import ServiceShape from "./ServiceShape";
import Street from "./Street";
import StopLocation from "../StopLocation";
export declare enum Visibility {
    IN_DETAILS = 0,
    ON_MAP = 1,
    IN_SUMMARY = 2,
    HIDDEN = 3,
    UNKNOWN = 4
}
declare class SegmentTemplate {
    static Visibility: typeof Visibility;
    private _hashCode;
    private _from;
    private _to;
    private _modeInfo;
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
    private _metres;
    private _metresSafe;
    private _metresUnsafe;
    private _mini;
    private _stop;
    private _notesList;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    private _arrival;
    hashCode: number;
    from: Location;
    to: Location;
    modeInfo: ModeInfo | null;
    modeIdentifier: string | null;
    action: string | null;
    notes: string;
    warnings: string;
    visibility: string | null;
    readonly visibilityType: Visibility;
    type: string;
    travelDirection: number | undefined;
    location: Location;
    readonly streets: Street[] | null;
    readonly shapes: ServiceShape[] | null;
    stopCode: string | null;
    endStopCode: string | null;
    serviceOperator: string;
    operatorID: string;
    isContinuation: boolean;
    durationWithoutTraffic: number | null;
    metres: number | null;
    metresSafe: number | null;
    metresUnsafe: number | null;
    mini: any;
    stop: StopLocation | null;
    readonly notesList: string[] | null;
    arrival: boolean;
    private static fromVisibilityS;
    private getAngleDegrees;
}
export default SegmentTemplate;
