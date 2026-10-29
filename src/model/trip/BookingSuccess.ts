import { JsonObject, JsonProperty } from "json2typescript/src/json2typescript/json-convert-decorators";
import BookingActionRequired from "./BookingActionRequired";

@JsonObject
export default class BookingSuccess {
    @JsonProperty("bookingID", String, true)
    bookingID?: string = undefined;
    @JsonProperty("updateURL", String, true)
    updateURL?: string = undefined;
    @JsonProperty("actionRequired", BookingActionRequired, true)
    actionRequired?: BookingActionRequired = undefined;
}