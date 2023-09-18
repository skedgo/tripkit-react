import { Any, JsonCustomConvert, JsonObject, JsonProperty, JsonConverter } from "json2typescript";
import CompanyInfo, { AppInfo } from "./CompanyInfo";
import { PricingTable } from "./CarParkInfo";
import Util from "../../util/Util";

@JsonObject
export class CarPodVehicle {
    @JsonProperty("identifier", String)
    public identifier: string = "";

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

    @JsonProperty("operator", CompanyInfo, true)
    public operator?: CompanyInfo = undefined;

}

type AvailabilityMode = "NONE" | "CURRENT" | "FUTURE";

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
export class CarAvailability {
    @JsonProperty("car", CarPodVehicle, true)   // Required
    public car: CarPodVehicle = new CarPodVehicle();
    @JsonProperty("availability", Any, true)
    public availability?: BookingAvailability = undefined;    
    @JsonProperty("bookingURL", String, true)
    public bookingURL?: string = undefined;
    @JsonProperty("appInfo", AppInfo, true)
    public appInfo?: AppInfo = undefined;
}

@JsonConverter
class TSPInfoModesConverter implements JsonCustomConvert<CarPodInfo> {
    public serialize(carPodInfo: CarPodInfo): any {
        return Util.serialize(carPodInfo);
    }
    public deserialize(carPodInfoJson: any): CarPodInfo {
        return Util.deserialize(carPodInfoJson, CarPodInfo);
    }
}

@JsonObject
export class NearbyPod {
    // @JsonProperty("carPod", CarPodInfo, true)   // This gives ts error: Class 'CarPodInfo' used before its declaration.
    @JsonProperty("carPod", TSPInfoModesConverter, true)
    public readonly carPod: CarPodInfo = new CarPodInfo();
    @JsonProperty("walkingDistance", Number, true)
    public readonly walkingDistance: number = 0;
}
@JsonObject
class CarPodInfo {
    @JsonProperty("identifier", String)
    public identifier: string = "";

    // Operator of the car pod
    @JsonProperty("operator", CompanyInfo)
    public operator: CompanyInfo = new CompanyInfo();

    // Vehicles at this location, including their availability (if known)
    @JsonProperty("availabilities", [CarAvailability], true)
    public availabilities?: CarAvailability[] = undefined;

    // real-time availability information
    @JsonProperty("availabilityMode", String, true)
    public availabilityMode?: AvailabilityMode

    @JsonProperty("nearbyPods", [NearbyPod], true)
    public nearbyPods?: NearbyPod[] = undefined;
}

export default CarPodInfo;