import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
class TKUserModeRules {
    @JsonProperty('replaceWith', [String], true)
    public replaceWith?: string[] = undefined;
}

@JsonObject
class TKUserMode {
    @JsonProperty('mode', String, true)
    public mode: string = "";
    @JsonProperty('rules', TKUserModeRules, true)
    public rules: TKUserModeRules = new TKUserModeRules();
}

export default TKUserMode;
