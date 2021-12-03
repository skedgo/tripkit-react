import {JsonObject, JsonProperty, JsonConverter, JsonCustomConvert} from "json2typescript";
import LatLng from "../LatLng";
import Util from "../../util/Util";
import LeafletUtil from "../../util/LeafletUtil";
import { black, white } from "jss/TKUITheme";


export enum StreetInstructions {
    HEAD_TOWARDS = "HEAD_TOWARDS",
    CONTINUE_STRAIGHT = "CONTINUE_STRAIGHT",
    TURN_LEFT = "TURN_LEFT",
    TURN_SLIGHTLY_LEFT = "TURN_SLIGHTLY_LEFT",
    TURN_SHARPLY_LEFT = "TURN_SHARPLY_LEFT",
    TURN_RIGHT= "TURN_RIGHT",
    TURN_SLIGHTLY_RIGHT= "TURN_SLIGHTLY_RIGHT",
    TURN_SHARPLY_RIGHT= "TURN_SHARPLY_RIGHT"
}

/**
 * Assume enum values (right-hand side strings) match api representation, which if changes, we can just update those
 * values without any other code change, since we can preserve enum keys (left-hand side values).
 */
@JsonConverter
export class StreetInstructionsConverter implements JsonCustomConvert<StreetInstructions> {
    public serialize(value: StreetInstructions): any {
        return value;
    }
    public deserialize(obj: any): StreetInstructions {
        return obj as StreetInstructions;
    }
}

export enum RoadTags {
    "CYCLE-LANE",
    "CYCLE-TRACK",
    "CYCLE-NETWORK",
    "BICYCLE-DESIGNATED",
    "BICYCLE-BOULEVARD",
    "SIDE-WALK",
    "MAIN-ROAD",
    "SIDE-ROAD",
    "SHARED-ROAD",
    "UNPAVED/UNSEALED"
}

export function roadTagDisplayS(tag: RoadTags) {
    return Util.kebabCaseToSpaced(RoadTags[tag].toLowerCase());
}

export function roadTagColor(tag: RoadTags) {
    switch (tag) {
        case RoadTags["MAIN-ROAD"]:
            return '#fcbb1d';
        case RoadTags["CYCLE-LANE"]:
        case RoadTags["CYCLE-NETWORK"]:    
            return '#0600ff';
        case RoadTags["CYCLE-TRACK"]:
        case RoadTags["BICYCLE-DESIGNATED"]:    
            return '#23b05e';
        case RoadTags["SIDE-ROAD"]:
            return '#78d6f9';   
        default:
            return 'gray';
    }
}

export function roadTagTextColor(tag: RoadTags) {
    return tag === RoadTags["MAIN-ROAD"] || tag === RoadTags["SIDE-ROAD"] ? black() : white();
}

@JsonConverter
export class RoadTagsConverter implements JsonCustomConvert<RoadTags[]> {
    public serialize(value: RoadTags[]): any {
        return value;
    }
    public deserialize(obj: any): RoadTags[] {
        return obj.map(tag => RoadTags[tag]);
    }
}

@JsonObject
class Street {
    @JsonProperty("encodedWaypoints", String, true)
    private _encodedWaypoints: string = "";

    @JsonProperty("waypoints", [Number], true)
    private _decodedWaypoints: number[] | null = null;

    /**
     * Missing when unknown.
     */
    @JsonProperty("safe", Boolean, true)
    private _safe: boolean | null = null;
    @JsonProperty("dismount", Boolean, true)
    public dismount: boolean = false;
    @JsonProperty("name", String, true)
    private _name: string | null = null;
    @JsonProperty("cyclingNetwork", String, true)
    private _cyclingNetwork: string | null = null;
    @JsonProperty("metres", Number, true)
    public metres: number | null = null;
    @JsonProperty("instruction", String, true)
    public instruction: StreetInstructions = StreetInstructions.CONTINUE_STRAIGHT;
    @JsonProperty("roadTags", RoadTagsConverter, true)
    public roadTags: RoadTags[] = [];

    private _waypoints: LatLng[] | null = null;

    get encodedWaypoints(): string {
        return this._encodedWaypoints;
    }

    get safe(): boolean | null {
        return this._safe;
    }

    get name(): string | null {
        // remove "Walk" in the meantime it's being removed from back-end.
        return this._name && this._name.toLowerCase() !== "walk" ? this._name : null;
    }

    get cyclingNetwork(): string | null {
        return this._cyclingNetwork;
    }

    get waypoints(): LatLng[] | null {
        if (this._waypoints === null) {
            if (this._encodedWaypoints) {
                this._waypoints = LeafletUtil.decodePolyline(this._encodedWaypoints);
            } else if (this._decodedWaypoints) {
                this._waypoints = [];
                for (let i = 0; i < this._decodedWaypoints.length; i++) {
                    this._waypoints.push(LatLng.createLatLng(this._decodedWaypoints[i], this._decodedWaypoints[i + 1]));
                    i++;
                }
            }
        }
        return this._waypoints;
    }
}

export default Street;