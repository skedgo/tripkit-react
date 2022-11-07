import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class TKUserAccount {
    @JsonProperty('userId', String, true)
    public userID?: string = undefined;
    @JsonProperty('email', String, true)
    public email?: string = undefined;
    @JsonProperty('givenName', String, true)
    public givenName?: string = undefined;
    @JsonProperty('surname', String, true)
    public surname?: string = undefined;
    @JsonProperty('name', String, true)
    public name?: string = undefined;
    @JsonProperty('phone', String, true)
    public phone?: string = undefined;
}

export default TKUserAccount;
