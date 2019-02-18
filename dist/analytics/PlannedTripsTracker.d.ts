import Trip from "../model/trip/Trip";
declare class PlannedTripsTracker {
    private static _instance;
    static readonly instance: PlannedTripsTracker;
    private _trips;
    private _selected;
    private timeoutId;
    constructor();
    trips: Trip[] | null;
    selected: Trip | undefined;
    scheduleTrack(long: boolean): void;
    private track;
}
export default PlannedTripsTracker;
