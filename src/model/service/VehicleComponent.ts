import {JsonObject, JsonProperty, JsonConverter, JsonCustomConvert} from "json2typescript";

export enum OccupancyStatus {
    EMPTY,
    MANY_SEATS_AVAILABLE,
    FEW_SEATS_AVAILABLE,
    STANDING_ROOM_ONLY,
    CRUSHED_STANDING_ROOM_ONLY,
    FULL,
    NOT_ACCEPTING_PASSENGERS
}

@JsonConverter
export class OccupancyStatusConverter implements JsonCustomConvert<OccupancyStatus> {
    public serialize(value: OccupancyStatus): any {
        return OccupancyStatus[value];
    }
    public deserialize(obj: any): OccupancyStatus {
        return OccupancyStatus[obj as string];
    }
}

@JsonObject
class VehicleComponent {

    @JsonProperty("occupancy", OccupancyStatusConverter, true)
    public occupancy: OccupancyStatus | undefined;
    @JsonProperty("wifi", Boolean, true)
    public wifi: boolean | undefined = undefined;
    @JsonProperty("airConditioned", Boolean, true)
    public airConditioned: boolean | undefined = undefined;
    @JsonProperty("wheelchairAccessible", Boolean, true)
    public wheelchairAccessible: boolean | undefined = undefined;
    @JsonProperty("wheelchairSeats", Number, true)
    public wheelchairSeats: number | undefined;
    @JsonProperty("model", String, true)
    public model: string | undefined;

}

export default VehicleComponent;