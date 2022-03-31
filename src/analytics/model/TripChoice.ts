import { JsonObject, JsonProperty } from "json2typescript";
import ChoiceSegment from "./ChoiceSegment";
import Trip from "../../model/trip/Trip";
import Segment from "../../model/trip/Segment";

@JsonObject
class TripChoice {

    @JsonProperty('price', Number, true)
    private _price: number | undefined = undefined;
    @JsonProperty('score', Number)
    private _score: number = 0;
    @JsonProperty('carbon', Number)
    private _carbon: number = 0;
    @JsonProperty('hassle', Number)
    private _hassle: number = 0;
    @JsonProperty('calories', Number)
    private _calories: number = 0;
    @JsonProperty('arrivalTime', Number, true)
    public arrivalTime?: number = undefined; /* In secs. since epoch */
    @JsonProperty('departureTime', Number, true)
    public departureTime?: number = undefined;
    @JsonProperty('segments', [ChoiceSegment])
    private _segments: ChoiceSegment[] = [];
    @JsonProperty('selected', Boolean)
    private _selected: boolean = false;

    public static create(trip: Trip, selected: boolean, anonymous: boolean): TripChoice {
        const instance = new TripChoice();
        instance._price = trip.moneyUSDCost ? trip.moneyUSDCost : undefined;
        instance._score = trip.weightedScore;
        instance._carbon = trip.carbonCost;
        instance._hassle = trip.hassleCost;
        instance._calories = trip.caloriesCost;
        if (!anonymous) {
            instance.arrivalTime = trip.arrive;
            instance.departureTime = trip.depart;
        }
        instance._segments = trip.segments.map((segment: Segment) => ChoiceSegment.create(segment, anonymous));
        instance._selected = selected;
        return instance;
    }


    get price(): number | undefined {
        return this._price;
    }

    get score(): number {
        return this._score;
    }

    get carbon(): number {
        return this._carbon;
    }

    get hassle(): number {
        return this._hassle;
    }

    get calories(): number {
        return this._calories;
    }

    get segments(): ChoiceSegment[] {
        return this._segments;
    }

    get selected(): boolean {
        return this._selected;
    }
}

export default TripChoice;