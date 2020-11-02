import {JsonObject, JsonProperty} from "json2typescript";
import CompanyInfo from "./CompanyInfo";
import {PricingTable} from "./CarParkInfo";

@JsonObject
class CarPodVehicle {
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
}

@JsonObject
class CarPodInfo {
    @JsonProperty("identifier", String)
    public identifier: string = "";

    @JsonProperty("operator", CompanyInfo)
    public operator: CompanyInfo = new CompanyInfo();

    @JsonProperty("vehicles", [CarPodVehicle], true)
    public vehicles?: CarPodVehicle[] = undefined;
}

export default CarPodInfo;