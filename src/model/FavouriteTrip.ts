import Location from "../model/Location";
import {JsonObject, JsonProperty} from "json2typescript";
import Options from "./Options";

@JsonObject
class FavouriteTrip {
    @JsonProperty('from', Location)
    private _from: Location = new Location();   // need to specify default value in order for json2typescript to work
    @JsonProperty('to', Location)
    private _to: Location = new Location();     // need to specify default value in order for json2typescript to work
    @JsonProperty('options', Options, true)
    private _options: Options | undefined = undefined;

    public static create(from: Location, to: Location): FavouriteTrip {
        const instance = new FavouriteTrip();
        instance._from = from;
        instance._to = to;
        return instance;
    }

    /**
     * Empty constructor, necessary for Util.clone
     */
    constructor() {
        // Avoid empty error
    }

    get from(): Location {
        return this._from;
    }

    set from(value: Location) {
        this._from = value;
    }

    get to(): Location {
        return this._to;
    }

    set to(value: Location) {
        this._to = value;
    }

    get options(): Options | undefined {
        return this._options;
    }

    set options(value: Options | undefined) {
        this._options = value;
    }

    public getKey(): string {
        return (this.from.isCurrLoc() ? "CurrLoc" : this.from.getKey()) + (this.to.isCurrLoc() ? "CurrLoc" : this.to.getKey());
    }

    public equals(other: any): boolean {
        if (other === undefined || other === null || other.constructor.name !== this.constructor.name) {
            return false;
        }
        return this.getKey() === other.getKey();
    }
}

export default FavouriteTrip;