import {JsonObject, JsonProperty} from "json2typescript";
import TripChoice from "./TripChoice";
import Trip from "../../model/trip/Trip";

@JsonObject
class PlannedTrip {

    public static create(source: string, trips: Trip[], selected: Trip) {
        const instance = new PlannedTrip();
        instance._source = source;
        instance._choiceSet = trips.map((trip: Trip) => TripChoice.create(trip, trip === selected));
        return instance;
    }

    @JsonProperty('source', String)
    private _source: string = "";
    @JsonProperty('choiceSet', [TripChoice])
    private _choiceSet: TripChoice[] = [];


    get source(): string {
        return this._source;
    }

    get choiceSet(): TripChoice[] {
        return this._choiceSet;
    }
}

export default PlannedTrip;