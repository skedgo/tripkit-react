import Location from "../Location";
import {JsonObject, JsonProperty} from "json2typescript";
import Options from "../Options";
import {LocationConverter} from "../location/LocationConverter";
import Favourite from "./Favourite";

@JsonObject
class FavouriteTrip extends Favourite {

    @JsonProperty('type')
    public type = "FavouriteTrip";
    @JsonProperty('from', LocationConverter)
    private _from: Location = new Location();   // need to specify default value in order for json2typescript to work
    @JsonProperty('to', LocationConverter)
    private _to: Location = new Location();     // need to specify default value in order for json2typescript to work
    @JsonProperty('options', Options, true)
    private _options: Options | undefined = undefined;

    public static createForLocation(to: Location): FavouriteTrip {
        return this.create(Location.createCurrLoc(), to);
    }

    public static create(from: Location, to: Location): FavouriteTrip {
        const instance = new FavouriteTrip();
        instance._from = from;
        instance._to = to;
        return instance;
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