import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class CarParkInfo {
    @JsonProperty('name', String, true)
    public name: string = '';
}

export default CarParkInfo;