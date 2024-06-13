import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
class TKAuthResponse {
    @JsonProperty('changed', Boolean)
    public changed: boolean = false;
    @JsonProperty('userToken', String, true)
    public userToken?: string = undefined;
    @JsonProperty('newUser', Boolean)
    public newUser: boolean = false;
    @JsonProperty('userID', String, true)
    public userID?: string = undefined;
}

export default TKAuthResponse;