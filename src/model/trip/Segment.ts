import { JsonObject, JsonProperty, JsonConverter, JsonCustomConvert, Any } from "json2typescript";
import SegmentTemplate, { SegmentType, Visibility } from "./SegmentTemplate";
import Trip from "./Trip";
import Color from "./Color";
import TransportUtil from "../../trip/TransportUtil";
import DateTimeUtil from "../../util/DateTimeUtil";
import ModeIdentifier from "../region/ModeIdentifier";
import RealTimeVehicle from "../service/RealTimeVehicle";
import RealTimeAlert, { AlertSeverity } from "../service/RealTimeAlert";
import { Booking } from "./BookingInfo";
import { i18n } from "../../i18n/TKI18nConstants";
import VehicleInfo from "../location/VehicleInfo";

export enum TripAvailability {
    AVAILABLE = "AVAILABLE",
    MISSED_PREBOOKING_WINDOW = "MISSED_PREBOOKING_WINDOW",
    CANCELLED = "CANCELLED"
}

@JsonConverter
export class TripAvailabilityConverter implements JsonCustomConvert<TripAvailability> {
    public serialize(value: TripAvailability): any {
        return TripAvailability[value];
    }
    public deserialize(obj: any): TripAvailability {
        return TripAvailability[obj as string];
    }
}

@JsonObject
class Segment extends SegmentTemplate {

    @JsonProperty("id", String, true)
    public id: string = "";
    @JsonProperty("startTime", Any)
    private _startTime: string | number = 0;
    @JsonProperty("endTime", Any)
    private _endTime: string | number = 0;
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
    // Api specs says it's required, but it's more robust to assume it could be missing and set a default.
    @JsonProperty("availability", TripAvailabilityConverter, true)
    public availability: TripAvailability = TripAvailability.AVAILABLE;
    @JsonProperty("realtimeVehicle", RealTimeVehicle, true)
    public realtimeVehicle: RealTimeVehicle | undefined = undefined;
    @JsonProperty("realtimeAlternativeVehicle", [RealTimeVehicle], true)
    public realtimeAlternativeVehicle: RealTimeVehicle[] | undefined = undefined;
    @JsonProperty("alertHashCodes", [Number], true)
    private _alertHashCodes: number[] = [];
    @JsonProperty("booking", Booking, true)
    public booking?: Booking = undefined;
    @JsonProperty("wheelchairAccessible", Boolean, true)
    public wheelchairAccessible: boolean | undefined = undefined;
    @JsonProperty("bicycleAccessible", Boolean, true)
    private _bicycleAccessible: boolean | null = null;
    @JsonProperty("stops", Number, true)
    public stops?: number = undefined;
    @JsonProperty("startPlatform", String, true)
    public startPlatform?: string = undefined;
    @JsonProperty("endPlatform", String, true)
    public endPlatform?: string = undefined;
    @JsonProperty("endPlatform", String, true)
    public timetableStartPlatform?: string = undefined;
    @JsonProperty("timetableEndPlatform", String, true)
    public timetableEndPlatform?: string = undefined;
    @JsonProperty("sharedVehicle", VehicleInfo, true)
    public sharedVehicle?: VehicleInfo = undefined;

    public alerts: RealTimeAlert[] = [];

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        super();
    }

    private _trip: Trip = new Trip();

    /**
     * Returns the segment start time in ISO format in the from location timezone. I assume that when the value comes in ISO format from 
     * the BE it comes in the from location timezone.
     */
    get startTime(): string {
        return typeof this._startTime === "string" ? this._startTime : DateTimeUtil.isoFromSeconds(this._startTime, this.from.timezone);
    }

    get startTimeSeconds(): number {
        return DateTimeUtil.isoToSeconds(this.startTime);        
    }

    set startTime(value: string) {
        this._startTime = value;
    }

    get endTime(): string {
        return typeof this._endTime === "string" ? this._endTime : DateTimeUtil.isoFromSeconds(this._endTime, this.to.timezone);        
    }

    get endTimeSeconds(): number {
        return DateTimeUtil.isoToSeconds(this.endTime);        
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

    get bicycleAccessible(): boolean | null {
        return this._bicycleAccessible;
    }

    get trip(): Trip {
        return this._trip;
    }

    set trip(value: Trip) {
        this._trip = value;
    }

    public isPT(): boolean {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith(ModeIdentifier.PUBLIC_TRANSIT_ID);
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
        return this.modeIdentifier !== null
            && (this.modeIdentifier.startsWith("cy_bic") || this.modeIdentifier.startsWith("me_mic_bic"));
    }

    public isCar(): boolean {
        return this.modeIdentifier !== null && TransportUtil.isSubMode(this.modeIdentifier, "me_car");
    }

    public isSchoolbus(): boolean {
        return this.modeIdentifier !== null && this.modeIdentifier.startsWith(ModeIdentifier.SCHOOLBUS_ID);
    }

    public isStationary(): boolean {
        return this.type === SegmentType.stationary;
    }

    public isNonTCService() {
        return this.isPT()
            && this.serviceOperator.toLowerCase() !== "transport canberra"
            && this.operatorID.toLowerCase() !== "tc"
            && this.operatorID.toLowerCase() !== "cmo";
    }

    public isFirst(visibility?: Visibility): boolean {
        return this === this.trip.getSegments(visibility)[0];
    }

    public isLast(visibility?: Visibility): boolean {
        const segments = this.trip.getSegments(visibility);
        return this === segments[segments.length - 1];
    }

    public prevSegment(): Segment | undefined {
        return this.isFirst() ? undefined : this.arrival ? this.trip.segments[this.trip.segments.length - 1] :
            this.trip.segments[this.trip.segments.indexOf(this) - 1];
    }

    public nextSegment(): Segment | undefined {
        return this.arrival ? undefined :
            this.isLast() ? this.trip.arrivalSegment : this.trip.segments[this.trip.segments.indexOf(this) + 1];
    }

    public hasContinuation(): boolean {
        const nextSegment = this.nextSegment();
        return nextSegment !== undefined && nextSegment.isContinuation
    }

    public getDuration(): number {
        return this.endTimeSeconds - this.startTimeSeconds;
    }

    public getDurationInMinutes(): number {
        return Math.floor(this.endTimeSeconds / 60) - Math.floor(this.startTimeSeconds / 60);
    }

    public getColor(): string {
        if (this.serviceColor !== null) {
            return this.serviceColor.toRGB();
        }
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
            const durationInMinutes = Math.floor(this.endTimeSeconds / 60) - Math.floor(this.startTimeSeconds / 60);
            const duration = DateTimeUtil.durationToBriefString(durationInMinutes, false);
            result = result.replace("<DURATION>", " about " + duration)
        }
        if (result.includes("<TIME>: ")) {  // Remove time from action since now it's displayed elsewhere
            result = result.replace("<TIME>: ", "")
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
        if (result.includes("<STOPS>")) { // Don't want to instantiate stops for ACT, so replace whole note with duration.
            result = result.replace("<STOPS>", this.stops !== undefined ? i18n.t("X.stops", { 0: this.stops.toString() }) : "");
        }
        if (result.includes("<DURATION>")) {
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

    get hasAlerts(): boolean {
        return this.alerts.length > 0;
    }

    get alertSeverity(): AlertSeverity {
        return alertSeverity(this.alerts);
    }
}

function alertSeverity(alerts: RealTimeAlert[]): AlertSeverity {
    let alertSeverity = AlertSeverity.info;
    for (const alert of alerts) {
        if (alert.severity < alertSeverity) { // '<' means 'more severe' according to the order of values of enum.
            alertSeverity = alert.severity
        }
    }
    return alertSeverity;
}

export const SegmentForDoc = (props: Segment) => null;
SegmentForDoc.displayName = "Segment";

export default Segment;
export { alertSeverity };