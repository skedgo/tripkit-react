import {JsonObject, JsonProperty, JsonConverter, JsonCustomConvert, Any} from "json2typescript";
import {MapLocationType, MapLocationTypeConverter} from "../location/MapLocationType";
import ModeIdentifier from "../region/ModeIdentifier";
import Features from "../../env/Features";
import TKTransportOptions, {DisplayConf} from "./TKTransportOptions";
import TKWeightingPreferences from "./TKWeightingPreferences";
import {TripSort} from "../trip/TripSort";

export enum WalkingSpeed {
    SLOW,
    AVERAGE,
    FAST
}

@JsonConverter
export class WalkingSpeedConverter implements JsonCustomConvert<WalkingSpeed> {
    public serialize(value: WalkingSpeed): any {
        return value;
    }
    public deserialize(obj: any): WalkingSpeed {
        return obj;
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

    // Modes disabled by default, can be changed by user, recorded in local storage.
    private static readonly defaultDisabled = [ModeIdentifier.SCHOOLBUS_ID, ModeIdentifier.TAXI_ID, ModeIdentifier.UBER_ID, ModeIdentifier.CAR_RENTAL_SW_ID];
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
    public trackTripSelections?: boolean;
    @JsonProperty('isDarkMode', Boolean, true)
    public isDarkMode?: boolean = undefined;
    @JsonProperty('customData', Any, true)
    public customData?: any = undefined;
    @JsonProperty('defaultTripSort', TripSortConverter, true)
    public defaultTripSort?: TripSort = undefined;

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