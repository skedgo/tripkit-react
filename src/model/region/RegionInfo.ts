import { Any, JsonObject, JsonProperty } from "json2typescript";
import Util from "../../util/Util";
import ModeInfo from "../trip/ModeInfo";

@JsonObject
export class SpecificMode {
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("modeInfo", ModeInfo, true)
    modeInfo: ModeInfo = new ModeInfo();
    @JsonProperty("modeImageNames", [String], true)
    modeImageNames: string[] = [];
    @JsonProperty("url", String, true)
    public url: string = "";
}
@JsonObject
class Mode {
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("modeInfo", ModeInfo, true)
    modeInfo: ModeInfo = new ModeInfo();
    @JsonProperty("specificModes", [SpecificMode], true)
    specificModes: SpecificMode[] = [];
}

type Modes = {
    [key: string]: Mode;
}

type SpecificModes = {
    [key: string]: SpecificMode;
}

@JsonObject
class RegionInfo {

    @JsonProperty("code", String)
    public code: string = "";

    @JsonProperty("streetBicyclePaths", Boolean)
    public streetBicyclePaths: boolean = false;

    @JsonProperty("streetWheelchairAccessibility", Boolean)
    public streetWheelchairAccessibility: boolean = false;

    @JsonProperty("transitBicycleAccessibility", Boolean)
    public transitBicycleAccessibility: boolean = false;

    @JsonProperty("transitConcessionPricing", Boolean)
    public transitConcessionPricing: boolean = false;

    @JsonProperty("transitWheelchairAccessibility", Boolean)
    public transitWheelchairAccessibility: boolean = false;

    @JsonProperty("transitModes", [ModeInfo])
    public transitModes: ModeInfo[] = [];

    @JsonProperty("modes", Any, true)
    public _modesJSON: any | undefined = undefined;

    private _modes: Modes | undefined;

    private _specificModes: SpecificModes | undefined;

    get modes(): Modes {
        if (!this._modes && this._modesJSON) {
            this._modes = Object.keys(this._modesJSON).reduce((result, key) => {
                result[key] = Util.deserialize(this._modesJSON[key], Mode);
                return result;
            }, {});
        }
        return this._modes ?? {};
    }

    get specificModes(): SpecificModes {
        if (!this._specificModes) {
            this._specificModes = {};
            Object.values(this.modes)
            .forEach(mode => mode.specificModes
                .forEach(sMode => sMode.modeInfo.identifier && (this._specificModes![sMode.modeInfo.identifier] = sMode)))
        }
        return this._specificModes;
    }

}

export default RegionInfo;