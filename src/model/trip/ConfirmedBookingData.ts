import {JsonObject, JsonProperty, JsonConverter, JsonCustomConvert, Any} from "json2typescript";
import {BookingConfirmation} from "./BookingInfo";
import Location from "../Location";

@JsonObject
class TripInfo {
    @JsonProperty("origin", Location, true)
    public origin?: Location = undefined;
    @JsonProperty("destination", Location, true)
    public destination?: Location = undefined;
}

@JsonObject
class ConfirmedBookingData {
    @JsonProperty("confirmation", BookingConfirmation, true)
    public confirmation?: BookingConfirmation = undefined;
    @JsonProperty("trips", [String], true)
    public trips?: string[] = undefined;
    @JsonProperty("tripsInfo", [TripInfo], true)
    public tripsInfo?: TripInfo[] = undefined;
    @JsonProperty("mode", String, true)
    public mode?: string = undefined;
    /**
     * In ISO format (includes timezone).
     */
    @JsonProperty("datetime", String, true)
    public datetime: string = "";
    @JsonProperty("time", Number, true)
    public time?: number = undefined;
    @JsonProperty("timeZone", String, true)
    public timeZone?: string = undefined;
    @JsonProperty("index", Number, true)
    public index?: number = undefined;
}

@JsonObject
class ConfirmedBookingsResult {
    @JsonProperty("bookings", [ConfirmedBookingData], true)
    public bookings?: ConfirmedBookingData[] = undefined;
    @JsonProperty("count", Number, true)
    public count?: number = undefined;
}

export default ConfirmedBookingData;
export {ConfirmedBookingsResult};