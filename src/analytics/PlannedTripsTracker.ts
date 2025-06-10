import Trip from "../model/trip/Trip";
import PlannedTrip from "./model/PlannedTrip";
import Environment from "../env/Environment";
import TripGoApi from "../api/TripGoApi";
import NetworkUtil from "../util/NetworkUtil";
import { JsonConvert } from "json2typescript";

class PlannedTripsTracker {

    private static _instance: PlannedTripsTracker;

    public static get instance(): PlannedTripsTracker {
        if (!this._instance) {
            this._instance = new PlannedTripsTracker();
        }
        return this._instance;
    }

    private _trips: Trip[] | undefined;
    private _selected: Trip | undefined;

    private timeoutId: any;


    constructor() {
        this.track = this.track.bind(this);
    }

    public set trips(value: Trip[] | undefined) {
        this._trips = value;
    }

    set selected(value: Trip | undefined) {
        this._selected = value;
    }

    public scheduleTrack(props: { anonymous?: boolean }) {
        const { anonymous } = props;
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => this.track(!!anonymous), 5000);
    }

    public cancelScheduledTrack() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }
    }

    public track(anonymous: boolean) {
        if (!this._trips || !this._selected) {
            return
        }
        const trackData = PlannedTrip.create("manual", this._trips, this._selected, anonymous);
        const jsonConvert = new JsonConvert();
        const body = jsonConvert.serialize(trackData);
        if (Environment.isProd()) {
            if (this._selected.plannedURL) {
                TripGoApi.apiCallUrl(this._selected.plannedURL, NetworkUtil.MethodType.POST, body)
            }
        }
        else {
            TripGoApi.apiCallUrl("http://httpbin.org/post", NetworkUtil.MethodType.POST, body)
        }
    }
}

export default PlannedTripsTracker;