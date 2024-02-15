import Location from "../Location";
import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
class City extends Location {

    constructor() {
        super();
        this.class = "CityLocation";
    }

    @JsonProperty('identifier', String, true)
    public identifier: string = '';
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
        return this.title.includes(",") ? this.title.substring(0, this.title.indexOf(",")) : this.title;
    }
}

export default City;