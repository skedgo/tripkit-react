import { JsonObject, JsonProperty } from "json2typescript";
import VehicleLocation from "./VehicleLocation";
import VehicleComponent, { OccupancyStatus } from "./VehicleComponent";

@JsonObject
class RealTimeVehicle {

    @JsonProperty("id")
    public id: string = "";
    @JsonProperty("lastUpdate")
    public lastUpdate: number = 0;
    @JsonProperty("location", VehicleLocation)
    public location: VehicleLocation = new VehicleLocation();
    @JsonProperty("components", [[VehicleComponent]], true)
    public components: VehicleComponent[][] | undefined = undefined;

    public getOccupancyStatus(): OccupancyStatus | undefined {
        return this.components &&
            this.components.reduce((overallOccupancy: OccupancyStatus, connComponents: VehicleComponent[]) => {
                const overallCompOccupancy = connComponents.reduce((overallCompOccupancy: OccupancyStatus, component: VehicleComponent) => {
                    return Math.min(overallCompOccupancy, component.occupancy ?? OccupancyStatus.NOT_ACCEPTING_PASSENGERS);
                }, OccupancyStatus.NOT_ACCEPTING_PASSENGERS);
                return Math.min(overallOccupancy, overallCompOccupancy);
            }, OccupancyStatus.NOT_ACCEPTING_PASSENGERS)
    }
}

export default RealTimeVehicle;