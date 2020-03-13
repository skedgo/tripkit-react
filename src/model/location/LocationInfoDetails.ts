import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class LocationInfoDetails {

    @JsonProperty("w3w", String, true)
    public readonly w3w?: string = undefined;
    @JsonProperty("w3wInfoURL", String, true)
    public readonly w3wInfoURL?: string = undefined;

}

export default LocationInfoDetails;