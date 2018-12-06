import {Any, JsonObject, JsonProperty} from "json2typescript";
import Region from "./Region";

@JsonObject
class RegionResults {

    @JsonProperty("hashCode", Number)
    private _hashCode: number = 0;

    @JsonProperty("modes", Any, true)
    private _modes: Any = {};

    @JsonProperty("regions", [Region])
    private _regions: Region[] = [];


    get hashCode(): number {
        return this._hashCode;
    }

    get modes(): Any {
        return this._modes;
    }

    get regions(): Region[] {
        return this._regions;
    }
}

export default RegionResults;