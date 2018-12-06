import {JsonObject, JsonProperty} from "json2typescript";
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
    @JsonProperty('arrivalTime', Number)
    private _arrivalTime: number = 0; /* In secs. since epoch */
    @JsonProperty('departureTime', Number)
    private _departureTime: number = 0;
    @JsonProperty('segments', [ChoiceSegment])
    private _segments: ChoiceSegment[] = [];
    @JsonProperty('selected', Boolean)
    private _selected: boolean = false;

    public static create(trip: Trip, selected: boolean): TripChoice {
        const instance = new TripChoice();
        instance._price = trip.moneyUSDCost ? trip.moneyUSDCost : undefined;
        instance._score = trip.weightedScore;
        instance._carbon = trip.carbonCost;
        instance._hassle = trip.hassleCost;
        instance._calories = trip.caloriesCost;
        instance._arrivalTime = trip.arrive;
        instance._departureTime = trip.depart;
        instance._segments = trip.segments.map((segment: Segment) => ChoiceSegment.create(segment));
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

    get arrivalTime(): number {
        return this._arrivalTime;
    }

    get departureTime(): number {
        return this._departureTime;
    }

    get segments(): ChoiceSegment[] {
        return this._segments;
    }

    get selected(): boolean {
        return this._selected;
    }
}

export default TripChoice;