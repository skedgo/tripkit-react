import { JsonObject, JsonProperty, Any } from "json2typescript";
import Color from "./Color";

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
    public options?: BookingFieldOption[] = undefined;
    @JsonProperty("values", [Any], true)
    public values?: string[] = undefined;
    @JsonProperty("value", String, true)
    public value?: string = undefined;
    @JsonProperty("minValue", Number, true)
    public minValue?: number = undefined;
    @JsonProperty("maxValue", Number, true)
    public maxValue?: number = undefined;
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
export class BookingAction {
    @JsonProperty("type", String, true)
    public type: string = "";   // values: CANCEL, CONFIRM
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("internalURL", String, true)
    public internalURL: string = "";
    @JsonProperty("externalURL", String, true)
    public externalURL: string = "";
    @JsonProperty("isDestructive", Boolean, true)
    public isDestructive: boolean = false;
    @JsonProperty("confirmationMessage", String, true)
    public confirmationMessage?: string = undefined;
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
class BookingProvider {
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("subtitle", String, true)
    public subtitle: string = "";
}

@JsonObject
class BookingVehicle {
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("subtitle", String, true)
    public subtitle: string = "";
}

@JsonObject
export class BookingNote {
    @JsonProperty("timestamp", String)
    public timestamp: string = "";
    @JsonProperty("text", String, true)
    public text: string = "";
    @JsonProperty("provider", String, true)
    public provider?: string = undefined;
}

interface BookingBrand {
    name: string,
    website: string,
    phone: string,
    color: Color
}

interface BookingPurchase {
    id: string;
    currency: string;
    price: number;
    productName: string,
    productType: string,
    valid: boolean,
    validFromTimestamp: string,
    brand: BookingBrand
}

@JsonObject
class BookingConfirmation {
    @JsonProperty("input", [BookingField], true)
    public input: BookingField[] = [];
    @JsonProperty("actions", [BookingAction], true)
    public actions: BookingAction[] = [];
    @JsonProperty("status", BookingConfirmationStatus, true)
    public status?: BookingConfirmationStatus = undefined;
    @JsonProperty("provider", BookingProvider, true)
    public provider?: BookingProvider = undefined;
    @JsonProperty("vehicle", BookingVehicle, true)
    public vehicle?: BookingVehicle = undefined;
    @JsonProperty("notes", [BookingNote], true)
    public notes?: BookingNote[] = undefined;
    @JsonProperty("purchase", Any, true)
    public purchase?: BookingPurchase = undefined;
}

@JsonObject
class Booking {
    @JsonProperty("title", String, true)
    public title: string = "";
    @JsonProperty("confirmation", BookingConfirmation, true)
    public confirmation?: BookingConfirmation = undefined;
    @JsonProperty("quickBookingsUrl", String, true)
    public quickBookingsUrl: string = "";
    @JsonProperty("externalActions", [String], true)
    public externalActions?: string[] = undefined;
}

export default BookingInfo;
export { Booking, BookingField, BookingFieldOption, BookingConfirmation }