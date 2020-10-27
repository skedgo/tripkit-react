import {JsonObject, JsonProperty} from "json2typescript";
import ModeLocation from "./ModeLocation";
import CarRentalInfo from "./CarRentalInfo";

@JsonObject
class CarRentalLocation extends ModeLocation {

    @JsonProperty("carRental", CarRentalInfo)
    public carRental: CarRentalInfo = new CarRentalInfo();

}

export default CarRentalLocation;