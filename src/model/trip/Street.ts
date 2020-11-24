import {JsonObject, JsonProperty} from "json2typescript";
import LatLng from "../LatLng";
import LeafletUtil from "../../util/LeafletUtil";

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
    private _metres: number | null = null;

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

    get metres(): number | null {
        return this._metres;
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