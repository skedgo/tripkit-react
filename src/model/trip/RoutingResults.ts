import {JsonObject, JsonProperty} from "json2typescript";
import SegmentTemplate from "./SegmentTemplate";
import TripGroup from "./TripGroup";
import RoutingQuery from "../RoutingQuery";
import Trip from "./Trip";

@JsonObject
class RoutingResults {
    @JsonProperty('region', String)
    private _region: string = "";
    @JsonProperty('regions', [String])
    public _regions: string[] = [];
    @JsonProperty('segmentTemplates', [SegmentTemplate], true)
    private _segmentTemplates: SegmentTemplate[] = [];
    @JsonProperty('groups', [TripGroup], true)
    private _groups: TripGroup[] = [];
    // @Json private List<GWTSegmentAlert> alerts;

    private query: RoutingQuery = new RoutingQuery();
    private satappQuery: string = "";

    get region(): string {
        return this._region;
    }

    get regions(): string[] {
        return this._regions;
    }

    get segmentTemplates(): SegmentTemplate[] {
        return this._segmentTemplates;
    }


    get groups(): TripGroup[] {
        if (this.templatesMap === null) {
            this.postProcess();
        }
        return this._groups;
    }

    private templatesMap: Map<number, SegmentTemplate> | null = null;

    // This method mutate trip group objects, but it's not a problem since it's done just once and before using
    // them in the react system.
    private postProcess() {
        this.templatesMap = new Map<number, SegmentTemplate>();
        for (const template of this.segmentTemplates) {
            this.templatesMap.set(template.hashCode, template);
        }
        for (const group of this.groups) {
            const sorting = (t1: Trip, t2: Trip) => {
                return t1.weightedScore - t2.weightedScore;
            };
            group.trips.sort(sorting);
            for (const trip of group.trips) {
                for (const segment of trip.segments) {
                    Object.assign(segment, this.templatesMap.get(segment.segmentTemplateHashCode));
                    segment.trip = trip;
                    if (segment.isFirst() && !this.query.isEmpty()) { // Check that this.query is defined to avoid crashing when injecting trips tests.
                        segment.from.address = this.query.from!.address;
                    }
                    if (segment.isLast() && !this.query.isEmpty()) {
                        segment.to.address = this.query.to!.address;
                    }
                }
                trip.satappQuery = this.satappQuery;
            }
            group.setSelected(0);
        }
    }

    public setQuery(query: RoutingQuery) {
        this.query = query;
    }

    public setSatappQuery(satappQuery: string) {
        this.satappQuery = satappQuery;
    }
}

export default RoutingResults;