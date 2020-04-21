import { JsonCustomConvert } from "json2typescript";
export declare enum OccupancyStatus {
    EMPTY = 0,
    MANY_SEATS_AVAILABLE = 1,
    FEW_SEATS_AVAILABLE = 2,
    STANDING_ROOM_ONLY = 3,
    CRUSHED_STANDING_ROOM_ONLY = 4,
    FULL = 5,
    NOT_ACCEPTING_PASSENGERS = 6
}
export declare class OccupancyStatusConverter implements JsonCustomConvert<OccupancyStatus> {
    serialize(value: OccupancyStatus): any;
    deserialize(obj: any): OccupancyStatus;
}
declare class VehicleComponent {
    occupancy: OccupancyStatus | undefined;
    wifi: boolean | undefined;
    airConditioned: boolean | undefined;
    wheelchairAccessible: boolean | undefined;
    wheelchairSeats: number | undefined;
    model: string | undefined;
}
export default VehicleComponent;
