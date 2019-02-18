import WeightingPreferences from "./WeightingPreferences";
import { MapLocationType } from "./location/MapLocationType";
declare class Options {
    private static readonly defaultDisabled;
    static readonly overrideDisabled: string[];
    private _weightingPrefs;
    private _modesDisabled;
    private _wheelchair;
    private _mapLayers;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    weightingPrefs: WeightingPreferences;
    modesDisabled: string[];
    wheelchair: boolean;
    mapLayers: MapLocationType[];
    readonly bikeRacks: boolean;
    isModeEnabled(mode: string): boolean;
}
export default Options;
