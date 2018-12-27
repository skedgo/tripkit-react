import {JsonConverter, JsonCustomConvert} from "json2typescript";

export enum MapLocationType {
    BIKE_POD = "BIKE_POD",
    CAR_PARK = "CAR_PARK",
    CAR_POD = "CAR_POD",
    CAR_RENTAL = "CAR_RENTAL",
    STOP = "STOP",
    MY_WAY_FACILITY = "MY_WAY_FACILITY",
    PARK_AND_RIDE_FACILITY = "PARK_AND_RIDE_FACILITY"
}

// export namespace MapLocationType {
    export function values(): MapLocationType[] {
        return Object.keys(MapLocationType).filter(
            (type) => isNaN(type as any) && type !== 'values'
        ) as MapLocationType[];
    }
// }

export function mapLocationTypeToGALabel(value: MapLocationType): string {
    switch (value) {
        case MapLocationType.BIKE_POD: return "bike share";
        case MapLocationType.CAR_PARK: return "car park";
        case MapLocationType.CAR_POD: return "car pod";
        case MapLocationType.CAR_RENTAL: return "car rental";
        case MapLocationType.STOP: return "stop";
        case MapLocationType.MY_WAY_FACILITY: return "myway retailer";
        case MapLocationType.PARK_AND_RIDE_FACILITY: return "park & ride";
        default: return "";
    }
}

@JsonConverter
export class MapLocationTypeConverter implements JsonCustomConvert<MapLocationType> {
    public serialize(mapLocationType: MapLocationType): any {
        return mapLocationType;
    }
    public deserialize(date: any): MapLocationType {
        return date;
    }
}

export default MapLocationType;