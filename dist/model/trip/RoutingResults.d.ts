import SegmentTemplate from "./SegmentTemplate";
import TripGroup from "./TripGroup";
import RoutingQuery from "../RoutingQuery";
import RealTimeAlert from "../service/RealTimeAlert";
declare class RoutingResults {
    private _region;
    _regions: string[];
    private _segmentTemplates;
    private _groups;
    alerts: RealTimeAlert[];
    private query;
    private satappQuery;
    get region(): string;
    get regions(): string[];
    get segmentTemplates(): SegmentTemplate[];
    get groups(): TripGroup[];
    private templatesMap;
    private alertsMap;
    private postProcess;
    setQuery(query: RoutingQuery): void;
    setSatappQuery(satappQuery: string): void;
}
export default RoutingResults;
