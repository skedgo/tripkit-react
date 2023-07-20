import { Any, JsonObject, JsonProperty } from "json2typescript";
import CompanyInfo from "./CompanyInfo";
import { PricingTable } from "./CarParkInfo";

export interface BookingAvailability {
    timestamp: string;
    intervals: BookingAvailabilityInterval[];
}
interface BookingAvailabilityInterval {
    status: "AVAILABLE" | "NOT_AVAILABLE" | "UNKNOWN";
    start: string;
    end: string;
}

@JsonObject
export class CarPodVehicle {
    @JsonProperty("name", String, true)
    public name?: string = undefined;

    @JsonProperty("description", String, true)
    public description?: string = undefined;

    @JsonProperty("licensePlate", String, true)
    public licensePlate?: string = undefined;

    @JsonProperty("engineType", String, true)
    public engineType?: string = undefined;

    @JsonProperty("fuelType", String, true)
    public fuelType?: string = undefined;

    @JsonProperty("fuelLevel", String, true)
    public fuelLevel?: string = undefined;

    @JsonProperty("pricingTable", PricingTable, true)
    public pricingTable?: PricingTable = undefined;

    @JsonProperty("availability", Any, true)
    public availability?: BookingAvailability = undefined;
}

type AvailabilityMode = "NONE" | "CURRENT" | "FUTURE";

@JsonObject
class CarPodInfo {
    @JsonProperty("identifier", String)
    public identifier: string = "";

    @JsonProperty("operator", CompanyInfo)
    public operator: CompanyInfo = new CompanyInfo();

    @JsonProperty("vehicles", [CarPodVehicle], true)
    public vehicles?: CarPodVehicle[] = undefined;

    // real-time availability information
    @JsonProperty("availabilityMode", String, true)
    public availabilityMode?: AvailabilityMode
}

export default CarPodInfo;