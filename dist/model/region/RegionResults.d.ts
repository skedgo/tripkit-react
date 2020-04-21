import { Any } from "json2typescript";
import Region from "./Region";
declare class RegionResults {
    private _hashCode;
    private _modes;
    private _regions;
    get hashCode(): number;
    get modes(): Any;
    get regions(): Region[];
}
export default RegionResults;
