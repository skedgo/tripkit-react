import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class WeightingPreferences {
    @JsonProperty('money', Number)
    private _money: number = 1;
    @JsonProperty('carbon', Number)
    private _carbon: number = 1;
    @JsonProperty('time', Number)
    private _time: number = 1;
    @JsonProperty('hassle', Number)
    private _hassle: number = 1;

    public static create(money: number = 1, carbon: number = 1, time: number = 1, hassle: number = 1) {
        const instance = new WeightingPreferences();
        instance._money = money;
        instance._carbon = carbon;
        instance._time = time;
        instance._hassle = hassle;
        return instance;
    }

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        // Avoid empty error
    }

    get money(): number {
        return this._money;
    }

    set money(value: number) {
        this._money = value;
    }

    get carbon(): number {
        return this._carbon;
    }

    set carbon(value: number) {
        this._carbon = value;
    }

    get time(): number {
        return this._time;
    }

    set time(value: number) {
        this._time = value;
    }

    get hassle(): number {
        return this._hassle;
    }

    set hassle(value: number) {
        this._hassle = value;
    }

    public toUrlParam(): string {
        return "(" + this.money.toFixed(2) + "," + this.carbon.toFixed(2) + "," +
            this.time.toFixed(2) + "," + this.hassle.toFixed(2) + ")";
    }
}

export default WeightingPreferences;