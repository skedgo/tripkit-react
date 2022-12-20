import { JsonObject, JsonProperty } from "json2typescript";
import MapUtil from "../../util/MapUtil";
import LatLng from "../LatLng";
import Color from "../trip/Color";
import ModeInfo from "../trip/ModeInfo";

@JsonObject
class RouteStop extends LatLng {
    @JsonProperty("stopCode", String, true)
    public readonly stopCode: string = "";
    @JsonProperty("name", String, true)
    public readonly name: string = "";
    @JsonProperty("common", Boolean, true)
    public readonly common: boolean = false;
}

@JsonObject
class Direction {
    @JsonProperty("id", String, true)
    public readonly id: string = "";
    @JsonProperty("name", String, true)
    public readonly name: string = "";
    @JsonProperty("encodedShape", String, true)
    public readonly encodedShape: string = "";
    @JsonProperty("shapeIsDetailed", Boolean, true)
    public readonly shapeIsDetailed: boolean = false;
    @JsonProperty("stops", [RouteStop], true)
    public readonly stops: RouteStop[] = [];

    private _shape?: LatLng[];

    get shape(): LatLng[] | undefined {
        if (!this._shape && this.encodedShape) {
            this._shape = MapUtil.decodePolyline(this.encodedShape);
        }
        return this._shape;
    }
}

@JsonObject
class RouteInfo {
    @JsonProperty("region", String, true)
    public readonly region?: string = "";
    @JsonProperty("id", String, true)
    public readonly id: string = "";
    @JsonProperty("operatorId", String, true)
    public readonly operatorId?: string = "";
    @JsonProperty("operatorName", String, true)
    public readonly operatorName?: string = "";
    @JsonProperty("routeName", String, true)
    public readonly routeName?: string = "";
    @JsonProperty("routeDescription", String, true)
    public readonly routeDescription?: string = "";
    @JsonProperty("shortName", String, true)
    public readonly shortName?: string = "";
    @JsonProperty("mode", String, true)
    public readonly mode: string = "";
    @JsonProperty("modeInfo", ModeInfo, true)
    public readonly modeInfo: ModeInfo = new ModeInfo();
    @JsonProperty("routeColor", Color, true)
    public readonly routeColor: Color = new Color();
    @JsonProperty("directions", [Direction], true)
    public readonly directions: Direction[] = [];
    @JsonProperty("numberOfServices", Number, true)
    public numberOfServices: number = 0;
}

export default RouteInfo;