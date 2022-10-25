import {JsonObject, JsonProperty, Any} from "json2typescript";
import SegmentTemplate from "./SegmentTemplate";
import TripGroup from "./TripGroup";
import RoutingQuery from "../RoutingQuery";
import Trip from "./Trip";
import RealTimeAlert from "../service/RealTimeAlert";
import Location from "../Location";
import ServiceShape from "./ServiceShape";
import ServiceStopLocation from "../ServiceStopLocation";

@JsonObject
class ResultsQuery {
    @JsonProperty("from", Location, true)
    public from: Location = new Location();
    @JsonProperty("to", Location, true)
    public to: Location = new Location();
}

@JsonObject
class RoutingResults {
    @JsonProperty('regions', [String], true)
    public _regions: string[] = [];
    @JsonProperty('segmentTemplates', [SegmentTemplate], true)
    private _segmentTemplates: SegmentTemplate[] = [];
    @JsonProperty('groups', [TripGroup], true)
    private _groups: TripGroup[] = [];
    @JsonProperty('alerts', [RealTimeAlert], true)
    public alerts: RealTimeAlert[] = [];

    @JsonProperty('query', ResultsQuery, true)
    public resultsQuery?: ResultsQuery = undefined;

    /**
     * @Deprecated. Replace by the previous one coming with the results.
     */
    private query: RoutingQuery = new RoutingQuery();
    private satappQuery: string = "";

    get region(): string {
        return this._regions.length > 0 ? this._regions[0] : "";
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
    private alertsMap: Map<number, RealTimeAlert> = new Map<number, RealTimeAlert>();

    // This method mutate trip group objects, but it's not a problem since it's done just once and before using
    // them in the react system.
    private postProcess() {
        this.templatesMap = new Map<number, SegmentTemplate>();
        for (const template of this.segmentTemplates) {
            this.templatesMap.set(template.hashCode, template);
        }
        for (const alert of this.alerts) {
            this.alertsMap.set(alert.hashCode, alert);
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
                    segment.shapes?.forEach((shape: ServiceShape) =>
                        shape.stops?.forEach((stop: ServiceStopLocation) => {
                            if (stop.departure === null && stop.relativeDeparture !== null) {
                                stop.departure = segment.startTimeSeconds + stop.relativeDeparture;
                            }
                            if (stop.arrival === null && stop.relativeArrival !== null) {
                                stop.arrival = segment.endTimeSeconds + stop.relativeArrival;
                            }
                        }));
                    if (segment.isFirst() && !this.query.isEmpty() && this.query.from!.address) { // Check that this.query is defined to avoid crashing when injecting trips tests.
                        segment.from.address = this.query.from!.address;
                    }
                    if (segment.isLast() && !this.query.isEmpty() && this.query.to!.address) {
                        segment.to.address = this.query.to!.address;
                    }
                    const segmentAlerts: RealTimeAlert[] = [];
                    for (const alertHash of segment.alertHashCodes) {
                        const segmentAlert = this.alertsMap.get(alertHash);
                        if (segmentAlert) {
                            segmentAlerts.push(segmentAlert);
                        }
                    }
                    segment.alerts = segmentAlerts;
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