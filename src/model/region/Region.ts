import {JsonObject, JsonProperty} from "json2typescript";
import BBox from "../BBox";
import LeafletMap from "../../map/MboxMap";

@JsonObject
class Region {

    public static regionStub = new Region();

    @JsonProperty("name", String)
    private _name: string = "";
    @JsonProperty("polygon", String, true)
    private _polygon: string = "";
    @JsonProperty("timezone", String)
    private _timezone: string = "";
    @JsonProperty("modes", [String])
    private _modes: string[] = [];

    private _bounds: BBox | null = null;

    get name(): string {
        return this._name;
    }

    get polygon(): string {
        return this._polygon;
    }

    get timezone(): string {
        return this._timezone;
    }

    get modes(): string[] {
        return this._modes;
    }

    get bounds(): BBox {
        if (this._bounds === null) {
            this._bounds = BBox.createBBoxArray(LeafletMap.decodePolyline(this._polygon));
        }
        return this._bounds;
    }
}

export default Region;