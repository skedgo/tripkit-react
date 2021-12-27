import { JsonObject, JsonProperty } from "json2typescript";
import Util from "util/Util";

@JsonObject
class VehicleTypeInfo {
    @JsonProperty("name", String, true)
    public name?: string = undefined;

    @JsonProperty("maxRangeMeters", Number, true)
    public maxRangeMeters?: number = undefined;

    @JsonProperty("formFactor", String, true)
    public formFactor: string = "OTHER";   // "BICYCLE" "CAR" "MOPED" "SCOOTER" "OTHER"

    @JsonProperty("propulsionType", String, true) // "HUMAN" "ELECTRIC_ASSIST" "ELECTRIC" "COMBUSTION"
    public propulsionType?: string;

    public formFactorS(t: (phrase: string) => string) {
        return this.formFactor === "BIKE" ? t("E-Bike") :
            this.formFactor === "SCOOTER" ? t("Kick.Scooter") :
                Util.toFirstUpperCase(this.formFactor);
    }
}

export default VehicleTypeInfo;