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

export default BookingInfo;
export {BookingField, BookingFieldOption}