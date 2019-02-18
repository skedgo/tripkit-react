import SegmentTemplate from "./SegmentTemplate";
import TripGroup from "./TripGroup";
import RoutingQuery from "../RoutingQuery";
declare class RoutingResults {
    private _region;
    _regions: string[];
    private _segmentTemplates;
    private _groups;
    private query;
    private satappQuery;
    readonly region: string;
    readonly regions: string[];
    readonly segmentTemplates: SegmentTemplate[];
    readonly groups: TripGroup[];
    private templatesMap;
    private postProcess;
    setQuery(query: RoutingQuery): void;
    setSatappQuery(satappQuery: string): void;
}
export default RoutingResults;
