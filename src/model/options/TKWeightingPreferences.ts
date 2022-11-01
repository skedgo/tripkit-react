import {JsonObject, JsonProperty} from "json2typescript";
import Util from "../../util/Util";

export enum WeightingPreference {
    money = "money",
    time = "time",
    carbon = "carbon",
    hassle = "hassle",
    exercise = "exercise"
}

@JsonObject
class TKWeightingPreferences {
    @JsonProperty(WeightingPreference.money, Number)
    public money: number = 1;    // Range: [0,2]
    @JsonProperty(WeightingPreference.time, Number)
    public time: number = 1;    // Range: [0,2]
    @JsonProperty(WeightingPreference.carbon, Number)
    public carbon: number = 1;    // Range: [0,2]
    @JsonProperty(WeightingPreference.hassle, Number)
    public hassle: number = 1;    // Range: [0,2]
    @JsonProperty(WeightingPreference.exercise, Number)
    public exercise: number = 1;    // Range: [0,2]

    public static create({ money = 1, time = 1, carbon = 1, hassle = 1, exercise = 1 } = {}) {
        return Util.iAssign(new TKWeightingPreferences(), {money, time, carbon, hassle, exercise});
    }

    public toUrlParam(): string {
        return "(" + this.money.toFixed(2) + "," + this.carbon.toFixed(2) + "," +
            this.time.toFixed(2) + "," + this.hassle.toFixed(2) + ")";
    }
    
}

export default TKWeightingPreferences;