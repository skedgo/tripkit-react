import {JsonObject, JsonProperty, Any} from "json2typescript";
import LatLng from "../LatLng";
import DataSourceAttribution from "./DataSourceAttribution";
import CompanyInfo from "./CompanyInfo";

@JsonObject
class OpeningTime {
    @JsonProperty("opens", String)
    public opens: string = "";

    @JsonProperty("closes", String)
    public closes: string = "";
}

@JsonObject
class OpeningDay {
    @JsonProperty("name", String)
    public name: string = "";

    @JsonProperty("times", [OpeningTime])
    public times: OpeningTime[] = [];
}

@JsonObject
export class OpeningHours {
    @JsonProperty("timeZone", String)
    public timezone: string = "";

    @JsonProperty("days", [OpeningDay])
    public days: OpeningDay[] = [];
}

@JsonObject
class PricingEntry {
    @JsonProperty("label", String, true)
    public label?: string = undefined;

    @JsonProperty("price", Number)
    public price: number = 0;

    @JsonProperty("maxDurationInMinutes", Number, true)
    public maxDurationInMinutes?: number = undefined;
}

@JsonObject
export class PricingTable {
    @JsonProperty("title", String)
    public title: string = "";

    @JsonProperty("subtitle", String, true)
    public subtitle?: string = undefined;

    @JsonProperty("currency", String)
    public currency: string = "";

    @JsonProperty("currencySymbol", String)
    public currencySymbol: string = "";

    @JsonProperty("entries", [PricingEntry])
    public entries: PricingEntry[] = [];
}

@JsonObject
class Restrictions {
    @JsonProperty("maxStayInMinutes", Number, true)
    public maxStayInMinutes?: number = undefined;

    @JsonProperty("noRestrictionWhenClosed", Boolean, true)
    public noRestrictionWhenClosed?: boolean = undefined;

    // Changed to Any to avoid exception since sometimes it comes [{}]
    // @JsonProperty("allowedOnly", [String], true)
    @JsonProperty("allowedOnly", [Any], true)
    public allowedOnly?: any[] = undefined;

    @JsonProperty("notAllowed", [String], true)
    public notAllowed?: string[] = undefined;
}

@JsonObject
class Entrance extends LatLng {
    @JsonProperty("type", String)
    public type: string = "";

    @JsonProperty("address", String, true)
    public address?: string = undefined;
}

@JsonObject
class CarParkInfo {
    @JsonProperty("identifier", String)
    public identifier: string = "";

    @JsonProperty('name', String)
    public name: string = "";

    // API specs says it's required, but sometimes it didn't come.
    @JsonProperty("address", String, true)
    public address: string = "";

    @JsonProperty("operator", CompanyInfo)
    public operator: CompanyInfo = new CompanyInfo();

    @JsonProperty("totalSpaces", Number, true)
    public totalSpaces?: number = undefined;

    @JsonProperty("availableSpaces", Number, true)
    public availableSpaces?: number = undefined;

    @JsonProperty("lastUpdate", Number, true)
    public lastUpdate?: number = undefined;

    @JsonProperty("onStreetParking", Boolean, true)
    public onStreetParking?: boolean = undefined;

    @JsonProperty("encodedParkingArea", String, true)
    public encodedParkingArea?: string = undefined;

    @JsonProperty("openingHours", OpeningHours, true)
    public openingHours?: OpeningHours = undefined;

    @JsonProperty("pricingTable", PricingTable, true)
    public pricingTable?: PricingTable = undefined;

    @JsonProperty("restrictions", Restrictions, true)
    public restrictions?: Restrictions = undefined;

    @JsonProperty("entrances", [Entrance], true)
    public entrances?: Entrance[] = undefined;

    @JsonProperty("source", DataSourceAttribution, true)
    public source: DataSourceAttribution = new DataSourceAttribution();
}

export default CarParkInfo;