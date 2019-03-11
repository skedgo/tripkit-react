import {JsonObject, JsonProperty} from "json2typescript";
import Location from "../Location";
import RealTimeAction from "./RealTimeAction";

@JsonObject
class RealTimeAlert {

    @JsonProperty("title")
    public title: string;
    @JsonProperty("hashCode")
    public hashCode: number;
    @JsonProperty("severity")
    public severity: string;
    @JsonProperty("text", String, true)
    public text: string | undefined;
    @JsonProperty("url", String, true)
    public url: string | undefined;
    @JsonProperty("remoteIcon", String, true)
    public remoteIcon: string | undefined;
    @JsonProperty("location", Location, true)
    public location: Location | undefined;
    @JsonProperty("action", RealTimeAction, true)
    public action: RealTimeAction | undefined;

}

export default RealTimeAlert;