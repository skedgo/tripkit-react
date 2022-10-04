import {JsonObject, JsonProperty} from "json2typescript";
import BBox from "../BBox";
import MapUtil from "../../util/MapUtil";
import LatLng from "../LatLng";
import City from "../location/City";

@JsonObject
class Region {
    @JsonProperty("name", String)
    private _name: string = "";
    @JsonProperty("polygon", String, true)
    private _polygon: string = "";
    @JsonProperty("timezone", String)
    private _timezone: string = "";
    @JsonProperty("modes", [String])
    private _modes: string[] = [];
    @JsonProperty("cities", [City])
    private _cities: City[] = [];

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

    get cities(): City[] {
        return this._cities;
    }

    get bounds(): BBox {
        if (this._bounds === null) {
            this._bounds = MapUtil.createBBoxArray(MapUtil.decodePolyline(this._polygon));
        }
        return this._bounds;
    }

    public contains(latLng: LatLng): boolean {
        return MapUtil.pointInPolygon(latLng, MapUtil.decodePolyline(this._polygon));
    }
}

export default Region;