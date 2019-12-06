import Location from "../Location";
import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class City extends Location {

    constructor() {
        super();
        this.class = "CityLocation";
    }

    @JsonProperty('title', String)
    public title: string = '';
    @JsonProperty('timezone', String)
    public timezone: string = '';

    get name(): string {
        return this.title;
    }
}

export default City;