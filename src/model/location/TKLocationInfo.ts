import {JsonObject, JsonProperty} from "json2typescript";
import LocationInfoDetails from "./LocationInfoDetails";
import RealTimeAlert from "../service/RealTimeAlert";
import StopLocation from "../StopLocation";
import CarParkInfo from "./CarParkInfo";
import BikePodInfo from "./BikePodInfo";
import CarRentalInfo from "./CarRentalInfo";
import CarPodInfo from "./CarPodInfo";

@JsonObject
class TKLocationInfo {

    @JsonProperty("lat", Number)
    public readonly lat: number = 0;
    @JsonProperty("lng", Number)
    public readonly lng: number = 0;
    @JsonProperty("details", LocationInfoDetails, true)
    public readonly details?: LocationInfoDetails = undefined;
    @JsonProperty('alerts', [RealTimeAlert], true)
    public alerts: RealTimeAlert[] = [];
    @JsonProperty("stop", StopLocation, true)
    public readonly stop?: StopLocation = undefined;
    @JsonProperty("carPark", CarParkInfo, true)
    public readonly carPark?: CarParkInfo = undefined;
    @JsonProperty("carRental", CarRentalInfo, true)
    public readonly carRental?: CarRentalInfo = undefined;
    @JsonProperty("carPod", CarPodInfo, true)
    public readonly carPod?: CarPodInfo = undefined;
    @JsonProperty("bikePod", BikePodInfo, true)
    public readonly bikePod?: BikePodInfo = undefined;

}

export default TKLocationInfo;