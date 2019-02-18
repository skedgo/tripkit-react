import Segment from "./Segment";
declare class Trip {
    private _depart;
    private _arrive;
    private _weightedScore;
    private _queryIsLeaveAfter;
    private _queryTime;
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
    readonly depart: number;
    readonly arrive: number;
    readonly weightedScore: number;
    readonly queryIsLeaveAfter: boolean | null;
    readonly queryTime: number | null;
    readonly currencySymbol: string | null;
    readonly moneyCost: number | null;
    readonly moneyUSDCost: number | null;
    readonly carbonCost: number;
    readonly hassleCost: number;
    readonly caloriesCost: number;
    readonly saveURL: string;
    readonly updateURL: string;
    readonly temporaryURL: string;
    readonly plannedURL: string;
    readonly segments: Segment[];
    hasPublicTransport(): boolean;
    hasBicycle(): boolean;
    isBicycleTrip(): boolean;
    getWheelchairAccessible(): boolean | null;
    getBicycleAccessible(): boolean | null;
    isSingleSegment(): boolean;
    getKey(): string;
    satappQuery: string;
    /**
     * Artificial segment representing the trip arrival. It's not in trip segments array.
     */
    readonly arrivalSegment: Segment;
}
export default Trip;
