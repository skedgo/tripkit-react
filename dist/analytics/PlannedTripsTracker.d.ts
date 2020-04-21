import Trip from "../model/trip/Trip";
declare class PlannedTripsTracker {
    private static _instance;
    static get instance(): PlannedTripsTracker;
    private _trips;
    private _selected;
    private timeoutId;
    constructor();
    set trips(value: Trip[] | undefined);
    set selected(value: Trip | undefined);
    scheduleTrack(long: boolean): void;
    private track;
}
export default PlannedTripsTracker;
