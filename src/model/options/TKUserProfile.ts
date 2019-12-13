import {JsonObject, JsonProperty} from "json2typescript";
import {MapLocationType, MapLocationTypeConverter} from "../location/MapLocationType";
import ModeIdentifier from "../region/ModeIdentifier";
import Features from "../../env/Features";
import TKTransportOptions from "./TKTransportOptions";
import TKWeightingPreferences from "./TKWeightingPreferences";

@JsonObject
class TKUserProfile {

    // Modes disabled by default, can be changed by user, recorded in local storage.
    private static readonly defaultDisabled = [ModeIdentifier.SCHOOLBUS_ID, ModeIdentifier.TAXI_ID, ModeIdentifier.UBER_ID, ModeIdentifier.CAR_RENTAL_SW_ID];
    // Modes forced as disabled, not recorded in local storage.
    public static get overrideDisabled(): string[] {
        return [ModeIdentifier.SCHOOLBUS_ID].concat(Features.instance.lightRail() ? [] : [ModeIdentifier.TRAM_ID]);
    };

    @JsonProperty('weightingPrefs', TKWeightingPreferences, true)
    public weightingPrefs: TKWeightingPreferences = TKWeightingPreferences.create();
    @JsonProperty('modesDisabled', [String], true)
    private _modesDisabled: string[] = TKUserProfile.defaultDisabled;
    @JsonProperty('transportOptions', TKTransportOptions, true)
    public transportOptions: TKTransportOptions = new TKTransportOptions();
    @JsonProperty('wheelchair', Boolean, true)
    private _wheelchair: boolean = false;
    @JsonProperty('mapLayers', MapLocationTypeConverter, true)
    private _mapLayers: MapLocationType[] = [];

    get modesDisabled(): string[] {
        return this._modesDisabled.concat(TKUserProfile.overrideDisabled.filter((mode: string) => this._modesDisabled.indexOf(mode) === -1));
    }

    set modesDisabled(value: string[]) {
        this._modesDisabled = value.filter((mode: string) => TKUserProfile.overrideDisabled.indexOf(mode) === -1);
    }

    get wheelchair(): boolean {
        return this._wheelchair;
    }

    set wheelchair(value: boolean) {
        this._wheelchair = value;
    }

    // TODO: Harcoded STOP layer as enabled.
    get mapLayers(): MapLocationType[] {
        return this._mapLayers.concat([MapLocationType.STOP].filter((locType: MapLocationType) => !this._mapLayers.includes(locType)));
    }

    set mapLayers(value: MapLocationType[]) {
        this._mapLayers = value;
    }

    get bikeRacks(): boolean {
        // TODO: need to be modeled on tripgo / tripkit?
        return false;
        // return this.isModeEnabled("pt_pub_bus") && this.isModeEnabled("cy_bic");
    }
}

export default TKUserProfile;