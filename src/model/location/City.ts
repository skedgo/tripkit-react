import Location from "../Location";
import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class City extends Location {
    @JsonProperty('title', String)
    private _title: string = '';
    @JsonProperty('timezone', String)
    private _timezone: string = '';

    get name(): string {
        return this._title;
    }

    get timezone(): string {
        return this._timezone;
    }
}

export default City;