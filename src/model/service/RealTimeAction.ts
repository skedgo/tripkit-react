import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class RealTimeAction {

    @JsonProperty("text", String, true) // Set as optional since sometimes doesn't come. In docs it says it's required
    public text: string = "";
    @JsonProperty("type", String, true) // Set as optional since sometimes doesn't come. In docs it says it's required
    public type: string = "";
    @JsonProperty("excludedStopCodes", [String], true)
    public excludedStopCodes: string[] | undefined = undefined;

}

export default RealTimeAction;