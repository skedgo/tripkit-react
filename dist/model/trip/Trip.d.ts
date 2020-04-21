import Segment from "./Segment";
import { Visibility } from "./SegmentTemplate";
declare class Trip {
    private _depart;
    private _arrive;
    private _weightedScore;
    queryIsLeaveAfter: boolean | null;
    queryTime: number | null;
    private _currencySymbol;
    private _moneyCost;
    private _moneyUSDCost;
    private _carbonCost;
    private _hassleCost;
    private _caloriesCost;
    private _saveURL;
    private _updateURL;
    private _temporaryURL;
    private _plannedURL;
    private _segments;
    private _satappQuery;
    private _arrivalSegment;
    get depart(): number;
    get arrive(): number;
    get weightedScore(): number;
    get currencySymbol(): string | null;
    get moneyCost(): number | null;
    get moneyUSDCost(): number | null;
    get carbonCost(): number;
    get hassleCost(): number;
    get caloriesCost(): number;
    get saveURL(): string;
    get updateURL(): string;
    get temporaryURL(): string;
    get plannedURL(): string;
    get segments(): Segment[];
    getSegments(visibility?: Visibility): Segment[];
    hasPublicTransport(): boolean;
    hasBicycle(): boolean;
    isBicycleTrip(): boolean;
    getWheelchairAccessible(): boolean | null;
    getBicycleAccessible(): boolean | null;
    isSingleSegment(visibility?: Visibility): boolean;
    getKey(): string;
    get satappQuery(): string;
    set satappQuery(value: string);
    /**
     * Artificial segment representing the trip arrival. It's not in trip segments array.
     */
    get arrivalSegment(): Segment;
    get duration(): number;
}
export default Trip;
