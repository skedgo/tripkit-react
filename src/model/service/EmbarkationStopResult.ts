import {JsonObject, JsonProperty} from "json2typescript";
import ServiceDeparture from "./ServiceDeparture";

@JsonObject
class EmbarkationStopResult {

    @JsonProperty('stopCode')
    public stopCode: string = "";
    @JsonProperty('services', [ServiceDeparture])
    public services: ServiceDeparture[] = [];
    @JsonProperty('wheelchairAccessible', Boolean, true)
    public wheelchairAccessible: boolean | undefined = undefined;

}

export default EmbarkationStopResult;