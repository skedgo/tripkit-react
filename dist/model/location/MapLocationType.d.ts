import { JsonCustomConvert } from "json2typescript";
export declare enum MapLocationType {
    BIKE_POD = "BIKE_POD",
    CAR_PARK = "CAR_PARK",
    CAR_POD = "CAR_POD",
    CAR_RENTAL = "CAR_RENTAL",
    STOP = "STOP",
    MY_WAY_FACILITY = "MY_WAY_FACILITY",
    PARK_AND_RIDE_FACILITY = "PARK_AND_RIDE_FACILITY"
}
export declare function values(): MapLocationType[];
export declare function mapLocationTypeToGALabel(value: MapLocationType): string;
export declare class MapLocationTypeConverter implements JsonCustomConvert<MapLocationType> {
    serialize(mapLocationType: MapLocationType): any;
    deserialize(date: any): MapLocationType;
}
export default MapLocationType;
