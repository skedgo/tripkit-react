import { JsonObject, JsonProperty } from "json2typescript";
import Util from "../../util/Util";

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

    public vehicleTypeS(t: (phrase: string) => string) {
        switch (this.formFactor) {
            case "BICYCLE":
                return this.propulsionType === "ELECTRIC" || this.propulsionType === "ELECTRIC_ASSIST" ?
                    t("E-Bike") : t("Bicycle");
            case "SCOOTER":
                return this.propulsionType === "ELECTRIC" || this.propulsionType === "ELECTRIC_ASSIST" ?
                    "E-Scooter" : this.propulsionType === "COMBUSTION" ? t("Moto.Scooter") : t("Kick.Scooter");
            default:
                return Util.toFirstUpperCase(this.formFactor);
        }
    }

    public vehicleTypeLocalIcon(): string | undefined {
        switch (this.formFactor) {
            case "BICYCLE":
                return this.propulsionType === "ELECTRIC" || this.propulsionType === "ELECTRIC_ASSIST" ?
                    "bicycle-electric" : "bicycle";
            case "SCOOTER":
                return "kickscooter";
            default:
                return undefined;
        }
    }
}

export default VehicleTypeInfo;