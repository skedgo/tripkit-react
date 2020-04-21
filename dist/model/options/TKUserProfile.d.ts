import { JsonCustomConvert } from "json2typescript";
import { MapLocationType } from "../location/MapLocationType";
import TKTransportOptions from "./TKTransportOptions";
import TKWeightingPreferences from "./TKWeightingPreferences";
export declare enum WalkingSpeed {
    SLOW = 0,
    AVERAGE = 1,
    FAST = 2
}
export declare class WalkingSpeedConverter implements JsonCustomConvert<WalkingSpeed> {
    serialize(value: WalkingSpeed): any;
    deserialize(obj: any): WalkingSpeed;
}
declare class TKUserProfile {
    private static readonly defaultDisabled;
    static get overrideDisabled(): string[];
    weightingPrefs: TKWeightingPreferences;
    private _modesDisabled;
    transportOptions: TKTransportOptions;
    transitConcessionPricing: boolean;
    private _mapLayers;
    minimumTransferTime: number;
    walkingSpeed: WalkingSpeed;
    cyclingSpeed: WalkingSpeed;
    trackTripSelections: boolean;
    get modesDisabled(): string[];
    set modesDisabled(value: string[]);
    get wheelchair(): boolean;
    set wheelchair(value: boolean);
    get mapLayers(): MapLocationType[];
    set mapLayers(value: MapLocationType[]);
    get bikeRacks(): boolean;
}
export default TKUserProfile;
