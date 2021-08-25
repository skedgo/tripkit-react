import {JsonObject, JsonProperty, JsonConverter, JsonCustomConvert, Any} from "json2typescript";

@JsonObject
class BookingFieldOption {
    @JsonProperty("id", String, true)
    public id: string = "";
    @JsonProperty("title", String, true)
    public title: string = "";
}

@JsonObject
class BookingField {
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("id", String, true)
    public id: string = "";
    @JsonProperty("required", Boolean, true)
    public required: boolean = false;
    @JsonProperty("type", String, true)
    public type?: string = undefined;
    @JsonProperty("options", [BookingFieldOption], true)
    public options: BookingFieldOption[] = [];
    @JsonProperty("values", [Any], true)
    public values?: string[] = undefined;
    @JsonProperty("value", String, true)
    public value?: string = undefined;

}

@JsonObject
class BookingInfo {
    @JsonProperty("bookingURL", String, true)
    public bookingURL: string = "";
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("bookingTitle", String, true)
    public bookingTitle: string = "";
    @JsonProperty("input", [BookingField], true)
    public input: BookingField[] = [];
}

@JsonObject
class BookingAction {
    @JsonProperty("type", String, true)
    public type: string = "";   // values: CANCEL
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("internalURL", String, true)
    public internalURL: string = "";
    @JsonProperty("isDestructive", Boolean, true)
    public isDestructive: boolean = false;
}

@JsonObject
class BookingConfirmationStatus {
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("subtitle", String, true)
    public subtitle: string = "";
    @JsonProperty("imageURL", String, true)
    public imageURL: string = "";
    @JsonProperty("value", String, true)
    public value: string = ""; // e.g. "PROCESSING"
}

@JsonObject
class BookingConfirmation {
    @JsonProperty("input", [BookingField], true)
    public input: BookingField[] = [];
    @JsonProperty("actions", [BookingAction], true)
    public actions: BookingAction[] = [];
    @JsonProperty("status", BookingConfirmationStatus, true)
    public status?: BookingConfirmationStatus = undefined;
}

@JsonObject
class Booking {
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("confirmation", BookingConfirmation, true)
    public confirmation?: BookingConfirmation = undefined;
    @JsonProperty("quickBookingsUrl", String, true)
    public quickBookingsUrl: string = "";
}

export default BookingInfo;
export {Booking, BookingField, BookingFieldOption}