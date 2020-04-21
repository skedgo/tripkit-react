export declare enum WeightingPreference {
    money = "money",
    time = "time",
    carbon = "carbon",
    hassle = "hassle",
    exercise = "exercise"
}
declare class TKWeightingPreferences {
    money: number;
    time: number;
    carbon: number;
    hassle: number;
    exercise: number;
    static create(money?: number, time?: number, carbon?: number, hassle?: number): TKWeightingPreferences;
    toUrlParam(): string;
    static slidePrefTo(prefs: TKWeightingPreferences, pref: WeightingPreference, value: number): TKWeightingPreferences;
}
export default TKWeightingPreferences;
