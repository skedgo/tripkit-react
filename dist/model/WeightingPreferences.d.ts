declare class WeightingPreferences {
    private _money;
    private _carbon;
    private _time;
    private _hassle;
    static create(money?: number, carbon?: number, time?: number, hassle?: number): WeightingPreferences;
    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor();
    money: number;
    carbon: number;
    time: number;
    hassle: number;
    toUrlParam(): string;
}
export default WeightingPreferences;
