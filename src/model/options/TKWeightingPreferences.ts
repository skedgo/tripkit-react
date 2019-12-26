import {JsonObject, JsonProperty} from "json2typescript";

export enum WeightingPreference {
    money = "money",
    time = "time",
    carbon = "carbon",
    hassle = "hassle",
    exercise = "exercise"
}

@JsonObject
class TKWeightingPreferences {
    @JsonProperty("money", Number)
    public money: number = 1;    // Range: [0,2]
    @JsonProperty("time", Number)
    public time: number = 1;    // Range: [0,2]
    @JsonProperty("carbon", Number)
    public carbon: number = 1;    // Range: [0,2]
    @JsonProperty("hassle", Number)
    public hassle: number = 1;    // Range: [0,2]
    @JsonProperty("exercise", Number)
    public exercise: number = 1;    // Range: [0,2]

    public static create(money: number = 1, time: number = 1, carbon: number = 1, hassle: number = 1) {
        const instance = new TKWeightingPreferences();
        instance.money = money;
        instance.time = time;
        instance.carbon = carbon;
        instance.hassle = hassle;
        return instance;
    }

    public toUrlParam(): string {
        return "(" + this.money.toFixed(2) + "," + this.carbon.toFixed(2) + "," +
            this.time.toFixed(2) + "," + this.hassle.toFixed(2) + ")";
    }

    public static slidePrefTo(prefs: TKWeightingPreferences, pref: WeightingPreference, value: number) {
        console.log(Object.keys(WeightingPreference));
        const result = new TKWeightingPreferences();
        const total = 5;
        const oldRemainder = total - prefs[pref];
        const newRemainder = total - value;
        for (const prefName of Object.keys(WeightingPreference)) {
            if (prefName === pref) {
                result[prefName] = value;
            } else {
                result[prefName] = Math.min((prefs[prefName] * newRemainder) / oldRemainder, 2);
            }
        }
        console.log(result);
        return result;
    }
}

export default TKWeightingPreferences;