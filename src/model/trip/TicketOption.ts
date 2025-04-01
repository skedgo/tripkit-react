import { Any, JsonObject, JsonProperty } from "json2typescript";

export interface ITicketOption {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    value: number;
}

export interface PurchasedTicket {
    id: string;
    ticketURL: string;
    status: string;
}

@JsonObject
class TicketOption implements ITicketOption {
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
    @JsonProperty("max", Number, true)
    public max?: number = undefined;
    @JsonProperty("purchasedTickets", [Any], true)
    public purchasedTickets?: PurchasedTicket[] = undefined;
}

export default TicketOption;