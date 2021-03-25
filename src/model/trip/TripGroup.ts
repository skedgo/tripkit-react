import Trip from "./Trip";
import {Any, JsonObject, JsonProperty} from "json2typescript";

@JsonObject
class TripGroup extends Trip {

    @JsonProperty("trips", [Trip])
    private _trips: Trip[] = [];
    @JsonProperty("frequency", Number, true)
    private _frequency: number | null = null;
    // @Json List<GWTDataSourceAttribution> sources;
    @JsonProperty("sources", [Any], true)
    private _sources: any[] = [];

    private selected?: number;

    get trips(): Trip[] {
        return this._trips;
    }

    get frequency(): number | null {
        return this._frequency;
    }

    get sources(): any[] {
        return this._sources;
    }

    public setSelected(value: number) {
        if (this.selected) {
            Object.assign(this.trips[this.selected], new Trip());
            Object.assign(this.trips[this.selected], this);
        }
        this.selected = value;
        Object.assign(this, new Trip()); // Clean fields from previous selected trip
        Object.assign(this, this.trips[this.selected]); // Assign values of new selected trip
    }

    public getSelectedTrip(): Trip {
        return this.trips[this.selected!];
    }

    public replaceAlternative(orig: Trip, update: Trip) {
        const updateIndex = this.trips.indexOf(orig);
        this.trips[updateIndex] = update;
        if (this.selected === updateIndex) {
            Object.assign(this, new Trip()); // Clean fields from previous selected trip
            Object.assign(this, this.trips[this.selected]); // Assign values of new selected trip
        }
    }

    public allCancelled(): boolean {
        return this.trips.every((value: Trip) => value.isCancelled());
    }

    /**
     * The id of the trip group is calculated as the id of the first trip, no matter it's or not the selected. This is
     * to avoid an id change when selected alternative changes, which whould cause an unnecessary re-construction of
     * a component using this id as key (e.g. TKUITripRow), which in turn causes focus cannot be returned to original
     * HTML element (e.g. Details button, which pushes details card and changes alternative selected at the same time.)
     */
    public getKey(fallback?: string): string {
        return this.trips[0]!.getKey(fallback);
    }
}

export default TripGroup;