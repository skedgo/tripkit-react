import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
export class TSPInfoMode {
    @JsonProperty("mode", String, true)
    public mode: string = "";
    @JsonProperty("numOfServices", Number, true)
    public numberOfServices: number = 0;
    // realTime: any[];
    @JsonProperty("integrations", [String], true)
    private _integrations: string[] | undefined = undefined;

    get integrations(): string[] {
        if (!this._integrations) {
            this._integrations = ["routing"];
        }
        return this._integrations;    
    }
}

@JsonObject
class TSPInfo {
    @JsonProperty("id", String, true)
    public id: string = "";
    @JsonProperty("name", String, true)
    public name: string = "";
    @JsonProperty("modes", [TSPInfoMode], true)
    public modes: TSPInfoMode[] = [];
    @JsonProperty("numOfServices", Number, true)
    public numOfServices: number = 0;
}

export default TSPInfo;