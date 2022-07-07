import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class Ticket {
    @JsonProperty("id", String, true)
    public id: string = "";
    @JsonProperty("name", String, true)
    public name: string = "";
    @JsonProperty("description", String, true)
    public description: string = "";
    @JsonProperty("price", Number, true)
    public price: number = -1;
    @JsonProperty("currency", String, true)
    public currency: string = "";
    @JsonProperty("value", Number, true)
    public value: number = 0;
}

export default Ticket;