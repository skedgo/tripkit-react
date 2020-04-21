import VehicleLocation from "./VehicleLocation";
import VehicleComponent, { OccupancyStatus } from "./VehicleComponent";
declare class RealTimeVehicle {
    id: string;
    lastUpdate: number;
    location: VehicleLocation;
    components: VehicleComponent[][] | undefined;
    getOccupancyStatus(): OccupancyStatus | undefined;
}
export default RealTimeVehicle;
