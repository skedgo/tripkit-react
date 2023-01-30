import { Any, JsonObject, JsonProperty } from "json2typescript";
import type { BookingProvider } from "./BookingInfo";
import TicketOption from "./TicketOption";
import Location from "../Location";



/**
 * https://developer.tripgo.com/specs/beta/payments/#operation/payBooking
 */

 @JsonObject
class BookingReview {
    @JsonProperty("price", Number, true)
    public price: number = 0;
    @JsonProperty("currency", String, true)
    public currency: string = "";
    @JsonProperty("mode", String, true)
    public mode: string = "";
    @JsonProperty("provider", Any, true)
    public provider?: BookingProvider = undefined;
    @JsonProperty("tickets", Any, true)
    public tickets: TicketOption[] = [];
    @JsonProperty("origin", Location, true)
    public origin?: Location = undefined;
    @JsonProperty("destination", Location, true)
    public destination?: Location = undefined;
    @JsonProperty("depart", String, true)
    public depart: string = "";
    @JsonProperty("arrive", String, true)
    public arrive: string = "";
}

export default BookingReview;