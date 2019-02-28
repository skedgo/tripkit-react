import {JsonObject, JsonProperty} from "json2typescript";
import WeightingPreferences from "./WeightingPreferences";
import {MapLocationType, MapLocationTypeConverter} from "./location/MapLocationType";
import ModeIdentifier from "./region/ModeIdentifier";
import Features from "../env/Features";

@JsonObject
class Options {

    // Modes disabled by default, can be changed by user, recorded in local storage.
    private static readonly defaultDisabled = [ModeIdentifier.SCHOOLBUS_ID, ModeIdentifier.TAXI_ID, ModeIdentifier.UBER_ID, ModeIdentifier.CAR_RENTAL_SW_ID];
    // Modes forced as disabled, not recorded in local storage.
    public static get overrideDisabled(): string[] {
        return [ModeIdentifier.SCHOOLBUS_ID].concat(Features.instance.lightRail() ? [] : [ModeIdentifier.TRAM_ID]);
    };

    @JsonProperty('weightingPrefs', WeightingPreferences, true)
    private _weightingPrefs: WeightingPreferences = WeightingPreferences.create(1, 1, 2);
    @JsonProperty('modesDisabled', [String], true)
    private _modesDisabled: string[] = Options.defaultDisabled;
    @JsonProperty('wheelchair', Boolean, true)
    private _wheelchair: boolean = false;
    @JsonProperty('mapLayers', MapLocationTypeConverter, true)
    private _mapLayers: MapLocationType[] = [];

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        // Avoid empty error
    }

    get weightingPrefs(): WeightingPreferences {
        return this._weightingPrefs;
    }

    set weightingPrefs(value: WeightingPreferences) {
        this._weightingPrefs = value;
    }

    get modesDisabled(): string[] {
        return this._modesDisabled.concat(Options.overrideDisabled.filter((mode: string) => this._modesDisabled.indexOf(mode) === -1));
    }

    set modesDisabled(value: string[]) {
        this._modesDisabled = value.filter((mode: string) => Options.overrideDisabled.indexOf(mode) === -1);
    }

    get wheelchair(): boolean {
        return this._wheelchair;
    }

    set wheelchair(value: boolean) {
        this._wheelchair = value;
    }

    get mapLayers(): MapLocationType[] {
        return this._mapLayers;
    }

    set mapLayers(value: MapLocationType[]) {
        this._mapLayers = value;
    }

    get bikeRacks(): boolean {
        return this.isModeEnabled("pt_pub_bus") && this.isModeEnabled("cy_bic");
    }

    public isModeEnabled(mode: string): boolean {
        return this.modesDisabled.find((modeD: string) => {
            return mode === modeD ||
                (mode.startsWith(modeD) && mode.charAt(modeD.length) === "_")   // mode is a particular case of (more specific than) modeD
        }) === undefined
    }
}

export default Options;