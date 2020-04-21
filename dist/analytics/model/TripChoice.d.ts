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
    get price(): number | undefined;
    get score(): number;
    get carbon(): number;
    get hassle(): number;
    get calories(): number;
    get arrivalTime(): number;
    get departureTime(): number;
    get segments(): ChoiceSegment[];
    get selected(): boolean;
}
export default TripChoice;
