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
    // @ts-ignore: avoid TS2610
    public timezone: string = '';

    public regionCode: string = '';

    get address(): string {
        return this.title;
    }

    get name(): string {
        return this.title;
    }
}

export default City;