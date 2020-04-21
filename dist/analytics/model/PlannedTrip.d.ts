import TripChoice from "./TripChoice";
import Trip from "../../model/trip/Trip";
declare class PlannedTrip {
    static create(source: string, trips: Trip[], selected: Trip): PlannedTrip;
    private _source;
    private _choiceSet;
    get source(): string;
    get choiceSet(): TripChoice[];
}
export default PlannedTrip;
