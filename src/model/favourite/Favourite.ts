import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject
class Favourite {
    @JsonProperty('name', String, true)
    public name?: string = undefined;
    @JsonProperty('order', Number, true)
    public order: number = 0;
    @JsonProperty('uuid', String, true)
    public uuid: string = "";
    @JsonProperty('type', String, true)
    public type: "stop" | "trip" | "location" = "location";

    constructor() {

    }

    equals(other: any): boolean {
        return JSON.stringify(this) === JSON.stringify(other);
    }

}

export default Favourite;