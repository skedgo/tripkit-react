import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class Ticket {
    @JsonProperty("cost", Number, true)
    private _cost: number | undefined = undefined;
    @JsonProperty("exchange", Number, true)
    private _exchange: number | undefined = undefined;
    @JsonProperty("name", String, true)
    private _name: string = "";

    get cost(): number | undefined {
        return this._cost;
    }

    get exchange(): number | undefined {
        return this._exchange;
    }

    get name(): string {
        return this._name;
    }
}

export default Ticket;