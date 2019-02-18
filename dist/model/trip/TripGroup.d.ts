import Trip from "./Trip";
declare class TripGroup extends Trip {
    private _trips;
    private _frequency;
    private _sources;
    private selected;
    constructor();
    readonly trips: Trip[];
    readonly frequency: number | null;
    readonly sources: any[];
    setSelected(value: number): void;
    getSelectedTrip(): Trip;
    replaceAlternative(orig: Trip, update: Trip): void;
}
export default TripGroup;
