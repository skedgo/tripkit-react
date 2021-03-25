import {JsonObject, JsonProperty} from "json2typescript";
import Segment, {TripAvailability} from "./Segment";
import Util from "../../util/Util";
import {SegmentType, Visibility} from "./SegmentTemplate";
import DateTimeUtil from "../../util/DateTimeUtil";
import TransportUtil from "../../trip/TransportUtil";
import {TranslationFunction} from "../../i18n/TKI18nProvider";
import TripUtil from "../../trip/TripUtil";

@JsonObject
class Trip {

    @JsonProperty("id", String, true)
    public id?: string = undefined;
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
    @JsonProperty("carbonCost", Number, true)   // Required according to spec. See comment for mainSegmentHashCode.
    private _carbonCost: number = 0;
    @JsonProperty("hassleCost", Number, true)   // Required according to spec. See comment for mainSegmentHashCode.
    private _hassleCost: number = 0;
    @JsonProperty("caloriesCost", Number, true) // Required according to spec. See comment for mainSegmentHashCode.
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
    @JsonProperty("mainSegmentHashCode", Number, true)  // Required according to spec, need to mark as optional since
    public mainSegmentHashCode: number = 0;             // TripGroup extends Trip, but it should always be present.

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
            this.segments.every((segment: Segment) => segment.isBicycle() || segment.isWalking() || segment.type === SegmentType.stationary);
    }

    public isWalkTrip(): boolean {
        return this.isSingleSegment() && this.segments[0].isWalking();
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

    /**
     *  Fallback can be removed when id or saveURL becomes required.
     *  It's important to have a unique id for each trip, and that is maintained across real-time updates.
     *  See comment on TKUIRoutingResultsView.
     *  See comment in TripGroup.getKey().
     */
    public getKey(fallback?: string): string {
        return (this.id ? this.id :
            this.saveURL ? this.saveURL : String(this.weightedScore) + (fallback ? "-" + fallback : ""));
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
            this._arrivalSegment.visibility = "on map";
        }
        return this._arrivalSegment;
    }

    get duration(): number {
        return this.arrive - this.depart;
    }

    public isCancelled(): boolean {
        return this.segments.find((value: Segment) => value.availability === TripAvailability.CANCELLED) !== undefined;
    }

    get mainSegment(): Segment {
        return this.segments.find((segment: Segment) => segment.segmentTemplateHashCode === this.mainSegmentHashCode)!;
    }

    public getAriaDescription(t: TranslationFunction): string {
        let description = "";
        const summarySegments = this.getSegments(Visibility.IN_SUMMARY);
        for (const segment of summarySegments) {
            let infoTitle: string | undefined;
            let infoSubtitle: string | undefined;
            if (segment.isPT()) {
                infoTitle = segment.serviceNumber !== null ? segment.serviceNumber : "";
                // infoSubtitle = t("At.X", {0: DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone).format(DateTimeUtil.TIME_FORMAT_TRIP)});
            } else if (segment.trip.isSingleSegment(Visibility.IN_SUMMARY) && (segment.isBicycle() || segment.isWheelchair())) {
                const mainInfo = segment.metres !== undefined ?
                    TransportUtil.distanceToBriefString(segment.metres) :
                    DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false);
                const friendlinessPct = (segment.metresSafe !== undefined && segment.metres !== undefined) ? Math.floor(segment.metresSafe * 100 / segment.metres) : undefined;
                if (friendlinessPct) {
                    infoTitle = mainInfo;
                    infoSubtitle = segment.isBicycle() ? t("X.cycle.friendly", {0: friendlinessPct + "%"}) : t("X.wheelchair.friendly", {0: friendlinessPct + "%"});
                } else {
                    infoSubtitle = mainInfo;
                }
            } else {
                if (segment.trip.isSingleSegment(Visibility.IN_SUMMARY) && segment.metres !== undefined) {
                    infoSubtitle = TransportUtil.distanceToBriefString(segment.metres);
                } else {
                    infoSubtitle = DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false);
                }
                if (segment.realTime) {
                    infoTitle = infoSubtitle;
                    infoSubtitle = t("Live.traffic");
                }
            }
            description += segment.modeInfo!.alt + (infoTitle ? " " + infoTitle : "") + (infoSubtitle ? " " + infoSubtitle : "")
                + (segment !== summarySegments[summarySegments.length - 1] ? ", then " : ". ");
        }
        const {departureTime, arrivalTime, duration, hasPT} = TripUtil.getTripTimeData(this);
        description += hasPT ?
            t("departs.X", {0: departureTime}) + ", " + t("arrives.X", {0: arrivalTime}) :
            this.queryIsLeaveAfter ? t("arrives.X", {0: arrivalTime}) : t("departs.X", {0: departureTime});
        return description;
    }

    public getAriaTimeDescription(t: TranslationFunction): string {
        const {departureTime, arrivalTime, duration, hasPT} = TripUtil.getTripTimeData(this);
        return hasPT ?
            t("departs.X", {0: departureTime}) + ", " + t("arrives.X", {0: arrivalTime}) :
            this.queryIsLeaveAfter ? t("arrives.X", {0: arrivalTime}) : t("departs.X", {0: departureTime});
    }
}

/**
 * Doc for Trip
 */
export const TripForDoc = (props: Trip) => null;
TripForDoc.displayName = "Trip";

export default Trip;