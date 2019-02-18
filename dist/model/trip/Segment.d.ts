import SegmentTemplate, { Visibility } from "./SegmentTemplate";
import Trip from "./Trip";
import Color from "./Color";
import Ticket from "./Ticket";
declare class Segment extends SegmentTemplate {
    private _startTime;
    private _endTime;
    private _segmentTemplateHashCode;
    private _serviceTripID;
    private _serviceName;
    private _serviceNumber;
    private _serviceDirection;
    private _serviceColor;
    private _realTime;
    private _isCancelled;
    private _alertHashCodes;
    private _wheelchairAccessible;
    private _bicycleAccessible;
    private _ticket;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    private _trip;
    startTime: number;
    readonly endTime: number;
    readonly segmentTemplateHashCode: number;
    readonly serviceTripID: string;
    readonly serviceName: string;
    readonly serviceNumber: string | null;
    readonly serviceDirection: string;
    readonly serviceColor: Color | null;
    readonly realTime: boolean | null;
    readonly isCancelled: boolean | null;
    readonly alertHashCodes: number[];
    readonly wheelchairAccessible: boolean | null;
    readonly bicycleAccessible: boolean | null;
    readonly ticket: Ticket | null;
    trip: Trip;
    isPT(): boolean;
    isWalking(): boolean;
    isWheelchair(): boolean;
    isBicycle(): boolean;
    isSchoolbus(): boolean;
    isNonTCService(): boolean;
    isFirst(visibility?: Visibility): boolean;
    isLast(visibility?: Visibility): boolean;
    isMyWay(): boolean;
    getDuration(): number;
    getDurationInMinutes(): number;
    getColor(): string;
    getAction(): string;
    private matchAction;
    getNotes(): string[];
    private hasTag;
    private matchNote;
    getKey(): string;
}
export default Segment;
