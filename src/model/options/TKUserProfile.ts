import { JsonObject, JsonProperty, JsonConverter, JsonCustomConvert, Any } from "json2typescript";
import ModeIdentifier from "../region/ModeIdentifier";
import Features from "../../env/Features";
import TKTransportOptions, { DisplayConf } from "./TKTransportOptions";
import TKWeightingPreferences from "./TKWeightingPreferences";
import { TripSort } from "../trip/TripSort";
import TKUserMode from "../../account/TKUserMode";
import TripGoApi from "../../api/TripGoApi";
import Util from "../../util/Util";
import { SignInStatus } from "../../account/TKAccountContext";

export enum WalkingSpeed {
    IMPAIRED,   // -1
    SLOW,       // 0
    AVERAGE,    // 1
    FAST        // 2
}

@JsonConverter
export class WalkingSpeedConverter implements JsonCustomConvert<WalkingSpeed> {
    public serialize(value: WalkingSpeed): any {
        return value - 1;
    }
    public deserialize(obj: any): WalkingSpeed {
        return obj + 1;
    }
}

@JsonConverter
export class TripSortConverter implements JsonCustomConvert<TripSort> {
    public serialize(value: TripSort): any {
        return value;
    }
    public deserialize(obj: any): TripSort {
        return obj;
    }
}

@JsonObject
class TKUserProfile {

    // Modes forced as disabled, not recorded in local storage.
    public static get overrideDisabled(): string[] {
        return [ModeIdentifier.SCHOOLBUS_ID].concat(Features.instance.lightRail() ? [] : [ModeIdentifier.TRAM_ID]);
    };

    @JsonProperty('weightingPrefs', TKWeightingPreferences, true)
    public weightingPrefs: TKWeightingPreferences = TKWeightingPreferences.create();
    @JsonProperty('transportOptions', TKTransportOptions, true)
    public transportOptions: TKTransportOptions = new TKTransportOptions();
    @JsonProperty('transitConcessionPricing', Boolean, true)
    public transitConcessionPricing: boolean = false;
    @JsonProperty('minimumTransferTime', Number, true)
    public minimumTransferTime: number = 0;
    @JsonProperty('walkingSpeed', WalkingSpeedConverter, true)
    public walkingSpeed: WalkingSpeed = WalkingSpeed.AVERAGE;
    @JsonProperty('cyclingSpeed', WalkingSpeedConverter, true)
    public cyclingSpeed: WalkingSpeed = WalkingSpeed.AVERAGE;
    @JsonProperty('trackTripSelections', Boolean, true)
    public trackTripSelections?: boolean = undefined;
    @JsonProperty('isDarkMode', Boolean, true)
    public isDarkMode?: boolean = undefined;
    @JsonProperty('customData', Any, true)
    public customData?: any = undefined;
    @JsonProperty('defaultTripSort', TripSortConverter, true)
    public defaultTripSort?: TripSort = undefined;
    @JsonProperty('routingQueryParams', Any, true)
    public routingQueryParams?: any = undefined;

    /**
     * Next two fields are set by TKAccountProvider, the reason is that we need them on a higher level in the components hierarchy,
     * e.g. to be consumed by WithRoutingResults, whereas TKAccountProvider is below it.
     */
    public finishSignInStatusP?: Promise<SignInStatus>;
    public exclusiveModes: boolean = false;

    /**
     * Next two fields may be considered part of the remote user profile, similar to TKUserAccount fetched and maintained by
     * TKAccountProvider, but we need to access them on a higher level in the components hierarchy, 
     * e.g. to be consumed by WithRoutingResults, whereas TKAccountProvider is below it.
     * Improvement: put this data, along with TKUserAccount as a "remote" part in the TKUserProfile, e.g. put this in a 
     * TKRemoteUserProfile object, property of TKUserProfile. See how to avoid depending on account model class, if possible.
     * 
     * Don't declare JsonProperty to avoid serializing and storing it in LS. See if there's any problem that this won't
     * serialize / deserialize on any other situation, e.g. to compare profiles. If there's a problem, then put
     * JsonProperty and just avoid saving it in LS on OptionsData.instance.save.
     */
    private userModeRulesPByRegion: Map<string, Promise<TKUserMode[]>> = new Map();
    private userModeRulesByRegion: Map<string, TKUserMode[] | null> = new Map();

    /** 
     * Need to ensure this is called after user token was resolved.
     */
    public getUserModeRulesByRegionP(region: string): Promise<TKUserMode[]> {
        let modeRulesP = this.userModeRulesPByRegion.get(region);
        if (!modeRulesP) {
            this.userModeRulesByRegion.set(region, null);
            modeRulesP = TripGoApi.apiCall("/data/user/modes.json?regionCode=" + region, "GET")
                .then(resultJson => {
                    const result = Util.jsonConvert().deserializeArray(resultJson, TKUserMode);
                    this.userModeRulesByRegion.set(region, result);
                    return result;
                });
            this.userModeRulesPByRegion.set(region, modeRulesP);
        }
        return modeRulesP;
    }

    public getUserModeRulesByRegion(region: string): TKUserMode[] | null | undefined {
        return this.userModeRulesByRegion.get(region);
    }

    public resetUserModeRules() {
        this.userModeRulesPByRegion = new Map();
        this.userModeRulesByRegion = new Map();
    }

    get wheelchair(): boolean {
        return this.transportOptions.isModeEnabled(ModeIdentifier.WHEELCHAIR_ID);
    }

    set wheelchair(value: boolean) {
        this.transportOptions.setTransportOption(ModeIdentifier.WHEELCHAIR_ID, value ? DisplayConf.NORMAL : DisplayConf.HIDDEN);
        if (value === false) { // Re-enable walk if wheelchair is disabled through this setter (e.g. from Wheelchi
            this.transportOptions.setTransportOption(ModeIdentifier.WALK_ID, DisplayConf.NORMAL);
        }
    }

    get bikeRacks(): boolean {
        // TODO: need to be modeled on tripgo / tripkit?
        return false;
        // return this.isModeEnabled("pt_pub_bus") && this.isModeEnabled("cy_bic");
    }
}

export default TKUserProfile;