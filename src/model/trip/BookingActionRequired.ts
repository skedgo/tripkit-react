import { JsonObject, JsonProperty } from "json2typescript/src/json2typescript/json-convert-decorators";
import Location from "../Location";
import { BookingAction } from "./BookingInfo";

@JsonObject
class BookingDifference {
    @JsonProperty("bookingType", String, true)
    public bookingType: "SINGLE" | "OUTBOUND" | "RETURN" = "SINGLE";
    @JsonProperty("from", Location, true)
    public from?: Location = undefined;
    @JsonProperty("externalFrom", Location, true)
    public externalFrom?: Location = undefined
    @JsonProperty("to", Location, true)
    public to?: Location = undefined
    @JsonProperty("externalTo", Location, true)
    public externalTo?: Location = undefined;
}

@JsonObject
class BookingActionRequired {
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("message", String, true)
    public message: string = "";
    @JsonProperty("differences", [BookingDifference], true)
    public differences: BookingDifference[] = [];
    @JsonProperty("actions", [BookingAction], true)
    public actions: BookingAction[] = [];
};

export default BookingActionRequired;