import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class RealTimeAction {

    @JsonProperty("text")
    public text: string = "";
    @JsonProperty("type")
    public type: string = "";
    @JsonProperty("excludedStopCodes", [String], true)
    public excludedStopCodes: string[] | undefined = undefined;

}

export default RealTimeAction;