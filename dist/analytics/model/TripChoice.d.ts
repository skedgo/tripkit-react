import ChoiceSegment from "./ChoiceSegment";
import Trip from "../../model/trip/Trip";
declare class TripChoice {
    private _price;
    private _score;
    private _carbon;
    private _hassle;
    private _calories;
    private _arrivalTime;
    private _departureTime;
    private _segments;
    private _selected;
    static create(trip: Trip, selected: boolean): TripChoice;
    readonly price: number | undefined;
    readonly score: number;
    readonly carbon: number;
    readonly hassle: number;
    readonly calories: number;
    readonly arrivalTime: number;
    readonly departureTime: number;
    readonly segments: ChoiceSegment[];
    readonly selected: boolean;
}
export default TripChoice;
