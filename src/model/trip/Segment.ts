import {JsonObject, JsonProperty} from "json2typescript";
import SegmentTemplate, {Visibility} from "./SegmentTemplate";
import Trip from "./Trip";
import Color from "./Color";
import TransportUtil from "../../trip/TransportUtil";
import DateTimeUtil from "../../util/DateTimeUtil";
import ModeIdentifier from "../region/ModeIdentifier";
import Ticket from "./Ticket";

@JsonObject
class Segment extends SegmentTemplate {

    @JsonProperty("startTime")
    private _startTime: number = 0;
    @JsonProperty("endTime")
    private _endTime: number = 0;
    @JsonProperty("segmentTemplateHashCode")
    private _segmentTemplateHashCode: number = 0;
    @JsonProperty("serviceTripID", String, true)
    private _serviceTripID: string = "";
    @JsonProperty("serviceName", String, true)
    private _serviceName: string = "";
    @JsonProperty("serviceNumber", String, true)
    private _serviceNumber: string | null = null;
    @JsonProperty("serviceDirection", String, true)
    private _serviceDirection: string = "";
    @JsonProperty("serviceColor", Color, true)
    private _serviceColor: Color | null = null;
    @JsonProperty("realTime", Boolean, true)
    private _realTime: boolean | null = null;
    @JsonProperty("isCancelled", Boolean, true)
    private _isCancelled: boolean | null = null;
    // @Json GWTRealTimeVehicle realtimeVehicle;
    @JsonProperty("alertHashCodes", [Number], true)
    private _alertHashCodes: number[] = [];
    // @Json GWTJsonBooking booking;
    @JsonProperty("wheelchairAccessible", Boolean, true)
    private _wheelchairAccessible: boolean | null = null;
    @JsonProperty("bicycleAccessible", Boolean, true)
    private _bicycleAccessible: boolean | null = null;
    @JsonProperty("ticket", Ticket, true)
    private _ticket: Ticket | null = null;

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        super();
    }

    private _trip: Trip = new Trip();

    get startTime(): number {
        return this._startTime;
    }

    set startTime(value: number) {
        this._startTime = value;
    }

    get endTime(): number {
        return this._endTime;
    }

    get segmentTemplateHashCode(): number {
        return this._segmentTemplateHashCode;
    }

    get serviceTripID(): string {
        return this._serviceTripID;
    }

    get serviceName(): string {
        return this._serviceName;
    }

    get serviceNumber(): string | null {
        return this._serviceNumber;
    }

    get serviceDirection(): string {
        return this._serviceDirection;
    }

    get serviceColor(): Color | null {
        return this._serviceColor;
    }

    get realTime(): boolean | null {
        return this._realTime;
    }

    get isCancelled(): boolean | null {
        return this._isCancelled;
    }

    get alertHashCodes(): number[] {
        return this._alertHashCodes;
    }

    get wheelchairAccessible(): boolean | null {
        return this._wheelchairAccessible;
    }

    get bicycleAccessible(): boolean | null {
        return this._bicycleAccessible;
    }

    get ticket(): Ticket | null {
        return this._ticket;
    }

    get trip(): Trip {
        return this._trip;
    }

    set trip(value: Trip) {
        this._trip = value;
    }

    public isPT(): boolean {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith("pt");
    }

    public isTram(): boolean {
        // Check with modeInfo since modeIdentifier comes with "pt_pub" for trams.
        // TODO: Check with routing team if that's the expected value.
        return (this.modeInfo && this.modeInfo.identifier === ModeIdentifier.TRAM_ID) ||
            (this.modeIdentifier !== null && this.modeIdentifier === ModeIdentifier.TRAM_ID);
    }

    public isWalking(): boolean {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith("wa_wal");
    }

    public isWheelchair(): boolean {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith("wa_whe");
    }

    public isBicycle(): boolean {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith("cy_bic");
    }

    public isSchoolbus(): boolean {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith(ModeIdentifier.SCHOOLBUS_ID);
    }

    public isStationay(): boolean {
        return this.type === 'stationary';
    }

    public isNonTCService() {
        return this.isPT()
            && this.serviceOperator.toLowerCase() !== "transport canberra"
            && this.operatorID.toLowerCase() !== "tc"
            && this.operatorID.toLowerCase() !== "cmo";
    }

    public isFirst(visibility?: Visibility): boolean {
        return visibility ?
            this === this.trip.segments.find((segment: Segment) => segment.visibilityType === visibility) :
            this === this.trip.segments[0];
    }

    public isLast(visibility?: Visibility): boolean {
        return visibility ?
            this === this.trip.segments.slice().reverse().find((segment: Segment) => segment.visibilityType === visibility) :
            this === this.trip.segments[this.trip.segments.length - 1];
    }

    public prevSegment(): Segment | undefined {
        return this.isFirst() ? undefined : this.arrival ? this.trip.segments[this.trip.segments.length - 1] :
            this.trip.segments[this.trip.segments.indexOf(this) - 1];
    }

    public isMyWay(): boolean {
        return (this.ticket !== null && this.ticket.name.toLowerCase().includes("myway"))
            || this.notes.toLowerCase().includes("myway");
    }

    public getDuration(): number {
        return this.endTime - this.startTime;
    }

    public getDurationInMinutes(): number {
        return Math.floor(this.endTime/60) - Math.floor(this.startTime/60);
    }

    public getColor(): string {
        // if (this.serviceColor !== null) {
        //     return this.serviceColor.toRGB();
        // }
        let color;
        if (this.modeInfo) {
            color = TransportUtil.getTransportColor(this.modeInfo);
        }
        return color ? color : "black";
    }

    public getAction(): string {
        if (this.action !== null) {
            return this.matchAction(this.action);
        }
        return "-----";
    }

    private matchAction(template: string): string {
        let result = template;
        if (result.includes("<NUMBER><TIME>")) {
            result = result.replace("<NUMBER><TIME>", "<NUMBER> at <TIME>");
        }
        if (result.includes("<NUMBER>")) {
            const service = this.serviceNumber !== null ? this.serviceNumber :
                (this.modeInfo ? this.modeInfo.alt : "");
            result = result.replace("<NUMBER>", service)
        }
        if (result.includes("<DURATION>")) {
            const durationInMinutes = Math.floor(this.endTime/60) - Math.floor(this.startTime/60);
            const duration = DateTimeUtil.durationToBriefString(durationInMinutes, false);
            result = result.replace("<DURATION>", " about " + duration)
        }
        if (result.includes("<TIME>")) {
            const time = DateTimeUtil.momentTZTime(this.startTime * 1000).format(DateTimeUtil.TIME_FORMAT_TRIP);
            result = result.replace("<TIME>", time)
        }
        return result;
    }

    public getNotes(): string[] {
        const notesList = this.notesList;
        if (notesList) {
            return notesList
                .map((note: string) => this.matchNote(note))
                .filter((note: string) => !this.hasTag(note));
        }
        return [];
    }

    private hasTag(note: string): boolean {
        return note.includes("<") && note.includes(">");
    }

    private matchNote(note: string): string {
        let result = note.trim();
        if (result.includes("<LINE_NAME>")) {
            result = result.replace("<LINE_NAME>", this.serviceName)
        }
        // if (result.includes("<LOCATIONS>")) {
        //     result = result.replace("<LOCATIONS>", "")
        // }
        if (result.includes("<DURATION>")) {
            if (result.includes("<STOPS>")) { // Don't want to instantiate stops for ACT, so replace whole note with duration.
                return DateTimeUtil.durationToBriefString(this.getDurationInMinutes());
            }
            result = result.replace("<DURATION>", DateTimeUtil.durationToBriefString(this.getDurationInMinutes()))
        }
        if (result.includes("<NUMBER>")) {
            const service = this.serviceNumber ? this.serviceNumber : (this.modeInfo ? this.modeInfo.alt : null);
            if (service) {
                result = result.replace("<NUMBER>", service);
            }
        }
        if (result.includes("<DIRECTION>")) {
            result = result.replace("<DIRECTION>", this.serviceDirection ? "Direction: " + this.serviceDirection : "");
        }
        return result
    }

    public getKey(): string {
        return this.from.getKey() + this.to.getKey() + this.segmentTemplateHashCode;
    }
}

export default Segment;